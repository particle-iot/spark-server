// @flow

import type { CollectionName } from './collectionNames';
import type {
  IBaseDatabase,
  IProductFirmwareRepository,
  ProductFirmware,
} from '../types';

import COLLECTION_NAMES from './collectionNames';

class ProductFirmwareDatabaseRepository implements IProductFirmwareRepository {
  _database: IBaseDatabase;
  _collectionName: CollectionName = COLLECTION_NAMES.PRODUCT_FIRMWARE;

  constructor(database: IBaseDatabase) {
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
    return await this._database.find(this._collectionName, query);
  };

  getAllByProductID = async (
    productID: string,
  ): Promise<Array<ProductFirmware>> =>
    await this._database.find(this._collectionName, { product_id: productID });

  getByID = async (id: string): Promise<?ProductFirmware> =>
    await this._database.findOne(this._collectionName, { _id: id });

  updateByID = async (
    productFirmwareID: string,
    productFirmware: ProductFirmware,
  ): Promise<ProductFirmware> =>
    await this._database.findAndModify(
      this._collectionName,
      { _id: productFirmwareID },
      { $set: { ...productFirmware, updated_at: new Date() } },
    );
}

export default ProductFirmwareDatabaseRepository;
