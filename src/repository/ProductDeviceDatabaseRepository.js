// @flow

import type { CollectionName } from './collectionNames';
import type {
  IBaseDatabase,
  IProductDeviceRepository,
  ProductDevice,
} from '../types';

import COLLECTION_NAMES from './collectionNames';
import BaseRepository from './BaseRepository';

class ProductDeviceDatabaseRepository extends BaseRepository
  implements IProductDeviceRepository {
  _database: IBaseDatabase;
  _collectionName: CollectionName = COLLECTION_NAMES.PRODUCT_DEVICES;

  constructor(database: IBaseDatabase) {
    super(database, COLLECTION_NAMES.PRODUCT_DEVICES);
    this._database = database;
  }

  create = async (model: $Shape<ProductDevice>): Promise<ProductDevice> =>
    await this._database.insertOne(this._collectionName, {
      ...model,
    });

  deleteByID = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, { _id: id });

  getAll = async (userID: ?string = null): Promise<Array<ProductDevice>> => {
    // TODO - this should probably just query the organization
    const query = userID ? { ownerID: userID } : {};
    return await this._database.find(this._collectionName, query);
  };

  getAllByProductID = async (
    productID: number,
    page: number,
    pageSize: number,
  ): Promise<Array<ProductDevice>> =>
    await this._database.find(this._collectionName, {
      page,
      pageSize,
      productID,
    });

  getByID = async (id: string): Promise<?ProductDevice> =>
    await this._database.findOne(this._collectionName, { _id: id });

  getFromDeviceID = async (deviceID: string): Promise<?ProductDevice> =>
    await this._database.findOne(this._collectionName, {
      deviceID,
    });

  getManyFromDeviceIDs = async (
    deviceIDs: Array<string>,
  ): Promise<Array<ProductDevice>> =>
    await this._database.find(this._collectionName, {
      deviceID: { $in: deviceIDs },
    });

  updateByID = async (): Promise<ProductDevice> => {
    throw new Error('The method is not implemented');
  };

  updateByID = async (
    productDeviceID: string,
    productDevice: ProductDevice,
  ): Promise<ProductDevice> =>
    await this._database.findAndModify(
      this._collectionName,
      { _id: productDeviceID },
      { $set: { ...productDevice } },
    );
}

export default ProductDeviceDatabaseRepository;
