// @flow

import type { Database, Webhook } from '../types';

class WebhookDatabaseRepository {
  _database: Object;
  _collectionName: string = 'webhooks';

  constructor(database: Database) {
    this._database = database;
  }

  create = async (model: $Shape<Webhook>): Promise<Webhook> => {
    const webhook = await this._database.insert(
      this._collectionName,
      {
        ...model,
        created_at: new Date(),
      },
    );

    return { ...webhook, id: webhook._id.toString() };
  };

  deleteById = async (id: string): Promise<void> =>
    this._database.remove(this._collectionName, id);

  getAll = async (userID: ?string = null): Promise<Array<Webhook>> => {
    const query = userID ? { ownerID: userID } : {};
    return this._database.find(this._collectionName, query);
  };

  getById = async (id: string, userID: ?string = null): Promise<?Webhook> => {
    const query = userID ? { _id: id, ownerID: userID } : { _id: id };
    return this._database.findOne(
      this._collectionName,
      query,
    );
  };

  update = async (): Promise<Webhook> => {
    throw new Error('The method is not implemented');
  };
}

export default WebhookDatabaseRepository;
