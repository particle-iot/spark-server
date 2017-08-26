// @flow
/* eslint-disable */

import type { File } from 'express';
import type DeviceManager from '../managers/DeviceManager';
import type {
  IDeviceAttributeRepository,
  IOrganizationRepository,
  IProductConfigRepository,
  IProductDeviceRepository,
  IProductFirmwareRepository,
  IProductRepository,
  Product,
  ProductFirmware,
} from '../types';

import Controller from './Controller';
import allowUpload from '../decorators/allowUpload';
import { HalModuleParser } from 'binary-version-reader';
import csv from 'csv';
import httpVerb from '../decorators/httpVerb';
import nullthrows from 'nullthrows';
import route from '../decorators/route';
import HttpError from '../lib/HttpError';
import formatDeviceAttributesToApi from '../lib/deviceToAPI';

type ProductFirmwareUpload = {
  current: boolean,
  description: string,
  binary: File,
  title: string,
  version: number,
};

class ProductsController extends Controller {
  _deviceAttributeRepository: IDeviceAttributeRepository;
  _deviceManager: DeviceManager;
  _organizationRepository: IOrganizationRepository;
  _productConfigRepository: IProductConfigRepository;
  _productDeviceRepository: IProductDeviceRepository;
  _productFirmwareRepository: IProductFirmwareRepository;
  _productRepository: IProductRepository;

  constructor(
    deviceManager: DeviceManager,
    deviceAttributeRepository: IDeviceAttributeRepository,
    organizationRepository: IOrganizationRepository,
    productRepository: IProductRepository,
    productConfigRepository: IProductConfigRepository,
    productDeviceRepository: IProductDeviceRepository,
    productFirmwareRepository: IProductFirmwareRepository,
  ) {
    super();

    this._deviceManager = deviceManager;
    this._deviceAttributeRepository = deviceAttributeRepository;
    this._organizationRepository = organizationRepository;
    this._productConfigRepository = productConfigRepository;
    this._productDeviceRepository = productDeviceRepository;
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
    ].filter(key => !model.product[key] && model.product[key] !== 0);
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
    ].filter(key => !model.product[key] && model.product[key] !== 0);
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
    version: string,
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
      firmware => firmware.version === parseInt(version, 10),
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
    const missingFields = ['binary', 'description', 'title', 'version'].filter(
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

    const version = parseInt(body.version, 10);
    if (productVersion !== version) {
      return this.bad(
        `Firmware had incorrect product version ${productVersion}. Expected ` +
          body.version,
      );
    }

    const firmwareList = await this._productFirmwareRepository.getAllByProductID(
      product.product_id,
    );
    const maxExistingFirmwareVersion = Math.max(
      ...firmwareList.map(firmware => parseInt(firmware.version, 10)),
    );

    if (version <= maxExistingFirmwareVersion) {
      return this.bad(
        `version must be greater than ${maxExistingFirmwareVersion}`,
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
      version: version,
    });

    const { data, id, ...output } = firmware;
    return this.ok(output);
  }

  @httpVerb('put')
  @route('/v1/products/:productIDOrSlug/firmware/:version')
  async updateFirmware(
    productIDOrSlug: string,
    version: string,
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
      firmware => firmware.version === parseInt(version, 10),
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

    if (current) {
      this._deviceManager.flashProductFirmware(product.id, firmware.data);
    }
    return this.ok(output);
  }

  @httpVerb('delete')
  @route('/v1/products/:productIDOrSlug/firmware/:version')
  async deleteFirmware(productIDOrSlug: string, version: string): Promise<*> {
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
      firmware => firmware.version === parseInt(version, 10),
    );
    if (!existingFirmware) {
      return this.bad(`Firmware version ${version} does not exist`);
    }

    await this._productFirmwareRepository.deleteByID(existingFirmware.id);

    return this.ok();
  }

  @httpVerb('get')
  @route('/v1/products/:productIDOrSlug/devices')
  async getDevices(
    productIDOrSlug: string,
    query: { page: number, per_page: number },
  ): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad(`${productIDOrSlug} does not exist`);
    }

    query.page = Math.max(1, query.page);
    const { page, per_page = 25 } = query;
    const totalDevices = await this._productDeviceRepository.count({
      productID: product.id,
    });
    const productDevices = await this._productDeviceRepository.getAllByProductID(
      product.id,
      page,
      per_page,
    );

    const deviceIDs = productDevices.map(
      productDevice => productDevice.deviceID,
    );

    const devices = (await this._deviceAttributeRepository.getManyFromIDs(
      deviceIDs,
    )).map(deviceAttributes => {
      const { denied, development, productID, quarantined } = nullthrows(
        productDevices.find(
          productDevice => productDevice.deviceID === deviceAttributes.deviceID,
        ),
      );
      return {
        ...formatDeviceAttributesToApi(deviceAttributes),
        denied,
        development,
        product_id: product.product_id,
        quarantined,
      };
    });
    return this.ok({
      accounts: [],
      devices,
      meta: { total_pages: Math.ceil(totalDevices / per_page) },
    });
  }

  @httpVerb('get')
  @route('/v1/products/:productIDOrSlug/devices/:deviceID')
  async getSingleDevice(productIDOrSlug: string, deviceID: string): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad(`${productIDOrSlug} does not exist`);
    }

    const deviceAttributes = await this._deviceAttributeRepository.getByID(
      deviceID,
    );

    if (!deviceAttributes) {
      return this.bad(`Device ${deviceID} doesn't exist.`);
    }

    const productDevice = await this._productDeviceRepository.getFromDeviceID(
      deviceID,
    );

    if (!productDevice) {
      return this.bad(`Device ${deviceID} hasn't been assigned to a product`);
    }

    const { denied, development, quarantined } = productDevice;

    return this.ok({
      ...formatDeviceAttributesToApi(deviceAttributes),
      denied,
      development,
      product_id: product.product_id,
      quarantined,
    });
  }

  @httpVerb('post')
  @route('/v1/products/:productIDOrSlug/devices')
  @allowUpload('file', 1)
  async addDevice(
    productIDOrSlug: string,
    body: { file?: File, id?: string, import_method: 'many' | 'one' },
  ): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad(`${productIDOrSlug} does not exist`);
    }

    let ids = null;
    if (body.import_method === 'many') {
      const file = body.file;
      if (!file) {
        return this.bad('No file uploaded');
      }

      const originalname = file.originalname;
      if (!originalname.endsWith('.txt') && !originalname.endsWith('.csv')) {
        return this.bad('File must be csv or txt file.');
      }

      const records = await new Promise(
        (resolve: (data: any) => void, reject: (error: Error) => void) =>
          csv.parse(
            file.buffer.toString('utf8'),
            (error: ?Error, data: any) => {
              if (error) {
                reject(error);
              }
              resolve(data);
            },
          ),
      );

      if (!records.length) {
        return this.bad(`File didn't have any ids`);
      }

      if (records.some(record => record.length !== 1)) {
        return this.bad('File should only have a single column of device ids');
      }

      ids = [].concat.apply([], records);
    } else {
      if (!body.id) {
        return this.bad('You must pass an id for a device');
      }

      ids = [body.id];
    }

    const deviceAttributes = await this._deviceAttributeRepository.getManyFromIDs(
      ids,
      this.user.id,
    );
    const incorrectPlatformDeviceIDs = deviceAttributes
      .filter(
        deviceAttribute =>
          deviceAttribute.particleProductId !== product.platform_id,
      )
      .map(deviceAttribute => deviceAttribute.deviceID);
    const deviceAttributeIDs = deviceAttributes.map(
      deviceAttribute => deviceAttribute.deviceID,
    );
    const existingProductDeviceIDs = (await this._productDeviceRepository.getManyFromDeviceIDs(
      ids,
    )).map(productDevice => productDevice.deviceID);

    const invalidDeviceIds = [
      ...incorrectPlatformDeviceIDs,
      ...existingProductDeviceIDs,
    ];

    const nonmemberDeviceIds = ids.filter(
      id => !deviceAttributeIDs.includes(id),
    );

    if (invalidDeviceIds.length) {
      return {
        data: {
          updated: 0,
          nonmemberDeviceIds,
          invalidDeviceIds,
        },
        status: 400,
      };
    }

    const idsToCreate = ids.filter(
      id =>
        !invalidDeviceIds.includes(id) &&
        !existingProductDeviceIDs.includes(id),
    );
    await Promise.all(
      idsToCreate.map(id =>
        this._productDeviceRepository.create({
          denied: false,
          development: false,
          deviceID: id,
          lockedFirmwareVersion: null,
          productID: product.id,
          quarantined: nonmemberDeviceIds.includes(id),
        }),
      ),
    );

    return this.ok({
      updated: idsToCreate.length,
      nonmemberDeviceIds,
      invalidDeviceIds,
    });
  }

  @httpVerb('put')
  @route('/v1/products/:productIDOrSlug/devices/:deviceID')
  async updateProductDevice(
    productIDOrSlug: string,
    deviceID: string,
    {
      denied,
      desired_firmware_version,
      development,
      notes,
      quarantined,
    }: {
      denied?: boolean,
      desired_firmware_version?: ?number,
      development?: boolean,
      notes?: string,
      quarantined?: boolean,
    },
  ): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad(`${productIDOrSlug} does not exist`);
    }

    const deviceAttributes = await this._deviceAttributeRepository.getByID(
      deviceID,
    );

    if (!deviceAttributes) {
      return this.bad(`Device ${deviceID} doesn't exist.`);
    }

    const productDevice = await this._productDeviceRepository.getFromDeviceID(
      deviceID,
    );

    if (!productDevice) {
      return this.bad(`Device ${deviceID} is not associated with a product`);
    }

    let output = { id: productDevice.id, updated_at: new Date() };
    if (desired_firmware_version !== undefined) {
      const deviceFirmwares = await this._productFirmwareRepository.getAllByProductID(
        product.product_id,
      );

      const parsedFirmware =
        desired_firmware_version !== null
          ? parseInt(desired_firmware_version, 10)
          : null;
      if (
        parsedFirmware !== null &&
        !deviceFirmwares.find(firmware => firmware.version === parsedFirmware)
      ) {
        return this.bad(`Firmware version ${parsedFirmware} does not exist`);
      }

      productDevice.lockedFirmwareVersion = parsedFirmware;
      output = { ...output, desired_firmware_version };
    }

    if (notes !== undefined) {
      productDevice.notes = notes;
      output = { ...output, notes };
    }

    if (development !== undefined) {
      productDevice.development = development;
      output = { ...output, development };
    }

    if (denied !== undefined) {
      productDevice.denied = denied;
      output = { ...output, denied };
    }

    if (quarantined !== undefined) {
      productDevice.quarantined = quarantined;
      output = { ...output, quarantined };
    }

    const updatedProductDevice = await this._productDeviceRepository.updateByID(
      productDevice.id,
      productDevice,
    );

    return this.ok(output);
  }

  @httpVerb('delete')
  @route('/v1/products/:productIDOrSlug/devices/:deviceID')
  async removeDeviceFromProduct(
    productIDOrSlug: string,
    deviceID: string,
  ): Promise<*> {
    const product = await this._productRepository.getByIDOrSlug(
      productIDOrSlug,
    );
    if (!product) {
      return this.bad(`${productIDOrSlug} does not exist`);
    }

    const deviceAttributes = await this._deviceAttributeRepository.getByID(
      deviceID,
    );

    if (!deviceAttributes) {
      return this.bad(`Device ${deviceID} doesn't exist.`);
    }

    const productDevice = (await this._productDeviceRepository.getManyFromDeviceIDs(
      [deviceID],
    ))[0];

    if (!productDevice) {
      return this.bad(
        `Device ${deviceID} was not mapped to ${productIDOrSlug}`,
      );
    }

    await this._productDeviceRepository.deleteByID(productDevice.id);
    return this.ok();
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
