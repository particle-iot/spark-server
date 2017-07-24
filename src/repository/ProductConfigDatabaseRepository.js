// @flow

import type { CollectionName } from './collectionNames';
import type {
  IBaseDatabase,
  IProductConfigRepository,
  ProductConfig,
} from '../types';

import COLLECTION_NAMES from './collectionNames';
import BaseRepository from './BaseRepository';

class ProductConfigDatabaseRepository extends BaseRepository
  implements IProductConfigRepository {
  _database: IBaseDatabase;
  _collectionName: CollectionName = COLLECTION_NAMES.PRODUCT_CONFIGS;

  constructor(database: IBaseDatabase) {
    super(database, COLLECTION_NAMES.PRODUCT_CONFIGS);
    this._database = database;
  }

  create = async (model: $Shape<ProductConfig>): Promise<ProductConfig> =>
    await this._database.insertOne(this._collectionName, {
      ...model,
    });

  deleteByID = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, { _id: id });

  getAll = async (userID: ?string = null): Promise<Array<ProductConfig>> => {
    // TODO - this should probably just query the organization
    const query = userID ? { ownerID: userID } : {};
    return await this._database.find(this._collectionName, query);
  };

  getByProductID = async (productID: string): Promise<?ProductConfig> =>
    await this._database.findOne(this._collectionName, {
      product_id: productID,
    });

  getByID = async (id: string): Promise<?ProductConfig> =>
    await this._database.findOne(this._collectionName, { _id: id });

  updateByID = async (): Promise<ProductConfig> => {
    throw new Error('The method is not implemented');
  };
}

export default ProductConfigDatabaseRepository;
