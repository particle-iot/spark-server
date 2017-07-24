// @flow

import type { CollectionName } from './collectionNames';
import type {
  IBaseDatabase,
  IOrganizationRepository,
  Organization,
} from '../types';

import COLLECTION_NAMES from './collectionNames';
import BaseRepository from './BaseRepository';

class OrganizationDatabaseRepository extends BaseRepository
  implements IOrganizationRepository {
  _database: IBaseDatabase;
  _collectionName: CollectionName = COLLECTION_NAMES.ORGANIZATIONS;

  constructor(database: IBaseDatabase) {
    super(database, COLLECTION_NAMES.ORGANIZATIONS);
    this._database = database;
  }

  create = async (model: $Shape<Organization>): Promise<Organization> =>
    await this._database.insertOne(this._collectionName, {
      ...model,
    });

  deleteByID = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, { _id: id });

  getAll = async (userID: ?string = null): Promise<Array<Organization>> => {
    // TODO - this should probably just query the organization
    const query = userID ? { ownerID: userID } : {};
    return await this._database.find(this._collectionName, query);
  };

  getByUserID = async (userID: string): Promise<Array<Organization>> =>
    await this._database.find(this._collectionName, {
      user_ids: userID,
    });

  getByID = async (id: string): Promise<?Organization> =>
    await this._database.findOne(this._collectionName, { _id: id });

  updateByID = async (): Promise<Organization> => {
    throw new Error('The method is not implemented');
  };
}

export default OrganizationDatabaseRepository;
