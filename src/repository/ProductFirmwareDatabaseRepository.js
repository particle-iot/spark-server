// @flow

import type { CollectionName } from './collectionNames';
import type {
  IBaseDatabase,
  IProductFirmwareRepository,
  ProductFirmware,
} from '../types';

import COLLECTION_NAMES from './collectionNames';
import BaseRepository from './BaseRepository';

const formatProductFirmwareFromDb = (
  productFirmware: Object,
): ProductFirmware =>
  ({
    ...productFirmware,
    // todo right now its hack for getting right buffer from different dbs
    data: productFirmware.data.buffer
      ? productFirmware.data.buffer // for mongo
      : Buffer.from(Object.values(productFirmware.data)), // for nedb,
  }: any);

class ProductFirmwareDatabaseRepository extends BaseRepository
  implements IProductFirmwareRepository {
  _database: IBaseDatabase;
  _collectionName: CollectionName = COLLECTION_NAMES.PRODUCT_FIRMWARE;

  constructor(database: IBaseDatabase) {
    super(database, COLLECTION_NAMES.PRODUCT_FIRMWARE);
    this._database = database;
  }

  create = async (model: $Shape<ProductFirmware>): Promise<ProductFirmware> =>
    await this._database.insertOne(this._collectionName, {
      ...model,
      updated_at: new Date(),
    });

  deleteByID = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, { _id: id });

  getAll = async (userID: ?string = null): Promise<Array<ProductFirmware>> => {
    // TODO - this should probably just query the organization
    const query = userID ? { ownerID: userID } : {};
    return (await this._database.find(this._collectionName, query)).map(
      formatProductFirmwareFromDb,
    );
  };

  getAllByProductID = async (
    productID: number,
  ): Promise<Array<ProductFirmware>> =>
    (await this._database.find(this._collectionName, {
      product_id: productID,
    })).map(formatProductFirmwareFromDb);

  getByVersionForProduct = async (
    productID: number,
    version: number,
  ): Promise<?ProductFirmware> => {
    const productFirmware = await this._database.findOne(this._collectionName, {
      product_id: productID,
      version,
    });
    return productFirmware
      ? formatProductFirmwareFromDb(productFirmware)
      : null;
  };

  getCurrentForProduct = async (
    productID: number,
  ): Promise<?ProductFirmware> => {
    const productFirmware = await this._database.findOne(this._collectionName, {
      current: true,
      product_id: productID,
    });
    return productFirmware
      ? formatProductFirmwareFromDb(productFirmware)
      : null;
  };

  getByID = async (id: string): Promise<?ProductFirmware> => {
    const productFirmware = await this._database.findOne(this._collectionName, {
      _id: id,
    });
    return productFirmware
      ? formatProductFirmwareFromDb(productFirmware)
      : null;
  };

  updateByID = async (
    productFirmwareID: string,
    productFirmware: ProductFirmware,
  ): Promise<ProductFirmware> =>
    await this._database
      .findAndModify(
        this._collectionName,
        { _id: productFirmwareID },
        {
          $set: {
            ...productFirmware,
            updated_at: new Date(),
          },
        },
      )
      .then(formatProductFirmwareFromDb);
}

export default ProductFirmwareDatabaseRepository;
