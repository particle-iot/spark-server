// @flow
/* eslint-disable */

import type { File } from 'express';
import type {
  IOrganizationRepository,
  IProductConfigRepository,
  IProductFirmwareRepository,
  IProductRepository,
  Product,
  ProductFirmware,
} from '../types';

import Controller from './Controller';
import allowUpload from '../decorators/allowUpload';
import { HalModuleParser } from 'binary-version-reader';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';
import HttpError from '../lib/HttpError';

type ProductFirmwareUpload = {
  current: boolean,
  description: string,
  binary: File,
  title: string,
  version: number,
};

class ProductsController extends Controller {
  _organizationRepository: IOrganizationRepository;
  _productConfigRepository: IProductConfigRepository;
  _productFirmwareRepository: IProductFirmwareRepository;
  _productRepository: IProductRepository;

  constructor(
    organizationRepository: IOrganizationRepository,
    productRepository: IProductRepository,
    productConfigRepository: IProductConfigRepository,
    productFirmwareRepository: IProductFirmwareRepository,
  ) {
    super();

    this._organizationRepository = organizationRepository;
    this._productConfigRepository = productConfigRepository;
    this._productFirmwareRepository = productFirmwareRepository;
    this._productRepository = productRepository;
  }

  @httpVerb('get')
  @route('/v1/products')
  async getProducts(): Promise<*> {
    const products = await this._productRepository.getAll();
    return this.ok({ products: products.map(this._formatProduct) });
  }

  @httpVerb('post')
  @route('/v1/products')
  async createProduct(model: { product: $Shape<Product> }): Promise<*> {
    if (!model.product) {
      return this.bad('You must provide a product');
    }

    const missingFields = [
      'description',
      'hardware_version',
      'name',
      'platform_id',
      'type',
    ].filter(key => !model.product[key]);
    if (missingFields.length) {
      return this.bad(`Missing fields: ${missingFields.join(', ')}`);
    }

    const organizations = await this._organizationRepository.getByUserID(
      this.user.id,
    );
    if (!organizations.length) {
      return this.bad("You don't have access to any organizations");
    }

    const organizationID = organizations[0].id;
    model.product.organization = organizationID;
    const product = await this._productRepository.create(model.product);
    const config = await this._productConfigRepository.create({
      org_id: organizationID,
      product_id: product.id,
    });
    product.config_id = config.id;
    await this._productRepository.updateByID(product.id, product);
    // For some reason the spark API returns it in an array.
    return this.ok({ product: [this._formatProduct(product)] });
  }

  @httpVerb('get')
  @route('/v1/products/:productIDOrSlug')
  async getProduct(productIDOrSlug: string): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad('Product does not exist', 404);
    }

    return this.ok({ product: [this._formatProduct(product)] });
  }

  @httpVerb('put')
  @route('/v1/products/:productIDOrSlug')
  async updateProduct(
    productIDOrSlug: string,
    model: { product: Product },
  ): Promise<*> {
    if (!model.product) {
      return this.bad('You must provide a product');
    }

    const missingFields = [
      'config_id',
      'description',
      'hardware_version',
      'id',
      'name',
      'organization',
      'platform_id',
      'type',
    ].filter(key => !model.product[key]);
    if (missingFields.length) {
      return this.bad(`Missing fields: ${missingFields.join(', ')}`);
    }

    let product = await this._productRepository.getByIDOrSlug(productIDOrSlug);
    if (!product) {
      return this.bad(`Product ${productIDOrSlug} doesn't exist`);
    }

    product = await this._productRepository.updateByID(product.id, {
      ...product,
      ...model.product,
    });

    // For some reason the spark API returns it in an array.
    return this.ok({ product: [this._formatProduct(product)] });
  }

  @httpVerb('delete')
  @route('/v1/products/:productIDOrSlug')
  async deleteProduct(productIDOrSlug: string): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad('Product does not exist', 404);
    }

    await this._productRepository.deleteByID(product.id);

    return this.ok();
  }

  @httpVerb('get')
  @route('/v1/products/:productIDOrSlug/config')
  async getConfig(productIDOrSlug: string): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad('Product does not exist', 404);
    }

    const config = await this._productConfigRepository.getByProductID(
      product.id,
    );

    return this.ok({ product_configuration: config });
  }

  @httpVerb('get')
  @route('/v1/products/:productIDOrSlug/firmware')
  async getFirmware(productIDOrSlug: string): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad('Product does not exist', 404);
    }

    const firmwares = await this._productFirmwareRepository.getAllByProductID(
      product.product_id,
    );

    return this.ok(firmwares.map(({ data, ...firmware }) => firmware));
  }

  @httpVerb('get')
  @route('/v1/products/:productIDOrSlug/firmware/:version')
  async getSingleFirmware(
    productIDOrSlug: string,
    version: number,
  ): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad(`${productIDOrSlug} does not exist`);
    }
    const firmwareList = await this._productFirmwareRepository.getAllByProductID(
      product.product_id,
    );

    const existingFirmware = firmwareList.find(
      firmware => firmware.version === version,
    );
    if (!existingFirmware) {
      return this.bad(`Firmware version ${version} does not exist`);
    }

    const { data, id, ...output } = existingFirmware;
    return this.ok(output);
  }

  @httpVerb('post')
  @route('/v1/products/:productIDOrSlug/firmware')
  @allowUpload('binary', 1)
  async addFirmware(
    productIDOrSlug: string,
    body: ProductFirmwareUpload,
  ): Promise<*> {
    const missingFields = ['binary', 'description', 'title'].filter(
      key => !body[key],
    );
    if (missingFields.length) {
      return this.bad(`Missing fields: ${missingFields.join(', ')}`);
    }

    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad(`${productIDOrSlug} does not exist`);
    }

    const parser = new HalModuleParser();
    const moduleInfo = await new Promise((resolve, reject) =>
      parser
        .parseBuffer({ fileBuffer: body.binary.buffer })
        .then(resolve, reject),
    );

    if (moduleInfo.crc.ok !== 1) {
      return this.bad('Invalid CRC. Try recompiling the firmware');
    }

    const firmwarePlatformID = moduleInfo.prefixInfo.platformID;
    if (firmwarePlatformID !== product.platform_id) {
      return this.bad(
        `Firmware had incorrect platform ID ${firmwarePlatformID}. Expected ` +
          product.platform_id,
      );
    }

    const { productId, productVersion } = moduleInfo.suffixInfo;
    if (productId !== parseInt(product.product_id, 10)) {
      return this.bad(
        `Firmware had incorrect product ID ${productId}. Expected ` +
          product.product_id,
      );
    }

    if (productVersion !== parseInt(body.version, 10)) {
      return this.bad(
        `Firmware had incorrect product version ${productVersion}. Expected ` +
          body.version,
      );
    }

    const firmware = await this._productFirmwareRepository.create({
      current: body.current,
      data: body.binary.buffer,
      description: body.description,
      device_count: 0,
      name: body.binary.originalname,
      product_id: product.product_id,
      size: body.binary.size,
      title: body.title,
      version: body.version,
    });
    const { data, id, ...output } = firmware;
    return this.ok(output);
  }

  @httpVerb('put')
  @route('/v1/products/:productIDOrSlug/firmware/:version')
  async updateFirmware(
    productIDOrSlug: string,
    version: number,
    body: $Shape<ProductFirmware>,
  ): Promise<*> {
    const { current, description, title } = body;
    body = {
      current,
      description,
      title,
    };
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad(`${productIDOrSlug} does not exist`);
    }
    const firmwareList = await this._productFirmwareRepository.getAllByProductID(
      product.product_id,
    );

    const existingFirmware = firmwareList.find(
      firmware => firmware.version === version,
    );
    if (!existingFirmware) {
      return this.bad(`Firmware version ${version} does not exist`);
    }

    const firmware = await this._productFirmwareRepository.updateByID(
      existingFirmware.id,
      {
        ...existingFirmware,
        ...body,
      },
    );
    const { data, id, ...output } = firmware;
    return this.ok(output);
  }

  @httpVerb('delete')
  @route('/v1/products/:productIDOrSlug/firmware/:version')
  async deleteFirmware(productIDOrSlug: string, version: number): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad(`${productIDOrSlug} does not exist`);
    }
    const firmwareList = await this._productFirmwareRepository.getAllByProductID(
      product.product_id,
    );

    const existingFirmware = firmwareList.find(
      firmware => firmware.version === version,
    );
    if (!existingFirmware) {
      return this.bad(`Firmware version ${version} does not exist`);
    }

    await this._productFirmwareRepository.deleteByID(existingFirmware.id);

    return this.ok();
  }

  @httpVerb('get')
  @route('/v1/products/:productIdOrSlug/devices')
  async getDevices(productIdOrSlug: string): Promise<*> {
    throw new HttpError('Not implemented');
  }

  @httpVerb('put')
  @route('/v1/products/:productIdOrSlug/devices/:deviceID')
  async setFirmwareVersion(
    productIdOrSlug: string,
    deviceID: string,
    body: { desired_firmware_version: number },
  ): Promise<*> {
    /*
    {
      "desired_firmware_version": 1,
      "updated_at": "2017-01-23T05:59:35.809Z",
      "id": "some_device_id"
    }
    */
    throw new HttpError('Not implemented');
  }

  @httpVerb('delete')
  @route('/v1/products/:productIdOrSlug/devices/:deviceID')
  async removeDeviceFromProduct(
    productIdOrSlug: string,
    deviceID: string,
  ): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('get')
  @route('/v1/products/:productIdOrSlug/events/:eventPrefix?*')
  async getEvents(productIdOrSlug: string, eventName: string): Promise<*> {
    throw new HttpError('Not implemented');
  }

  @httpVerb('delete')
  @route('/v1/products/:productIdOrSlug/team/:username')
  async removeTeamMember(
    productIdOrSlug: string,
    username: string,
  ): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  _formatProduct(product: Product): $Shape<Product> {
    const { product_id, ...output } = product;
    output.id = product_id;
    return output;
  }
}

export default ProductsController;
/* eslint-enable */
