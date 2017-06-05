// @flow

import type { IBaseDatabase, IWebhookRepository, Webhook } from '../types';

class WebhookDatabaseRepository implements IWebhookRepository {
  _database: IBaseDatabase;
  _collectionName: string = 'webhooks';

  constructor(database: IBaseDatabase) {
    this._database = database;
  }

  create = async (model: $Shape<Webhook>): Promise<Webhook> =>
    await this._database.insertOne(
      this._collectionName,
      {
        ...model,
        created_at: new Date(),
      },
    );

  deleteById = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, id);

  getAll = async (userID: ?string = null): Promise<Array<Webhook>> => {
    const query = userID ? { ownerID: userID } : {};
    return await this._database.find(
      this._collectionName,
      query,
      { timeout: false },
    );
  };

  getById = async (id: string, userID: ?string = null): Promise<?Webhook> => {
    const query = userID ? { _id: id, ownerID: userID } : { _id: id };
    return await this._database.findOne(this._collectionName, query);
  };

  update = async (): Promise<Webhook> => {
    throw new Error('The method is not implemented');
  };
}

export default WebhookDatabaseRepository;
