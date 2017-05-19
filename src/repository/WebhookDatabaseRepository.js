// @flow

import type { Database, Webhook } from '../types';

import { promisifyByPrototype } from '../lib/promisify';

class WebhookDatabaseRepository {
  _collection: Object;

  constructor(database: Database) {
    this._collection = database.getCollection('webhooks');
  }

  create = async (model: $Shape<Webhook>): Promise<Webhook> => {
    const webhook = (await this._collection.insert(
      {
        ...model,
        created_at: new Date(),
      },
      { fullResult: true },
    ))[0];

    return { ...webhook, id: webhook._id.toString() };
  };

  deleteById = async (id: string): Promise<void> =>
    this._collection.remove({ _id: id });

  getAll = async (userID: ?string = null): Promise<Array<Webhook>> => {
    const query = userID ? { ownerID: userID } : {};
    return await (promisifyByPrototype(
      await this._collection.find(query),
    ).toArray());
  };

  getById = async (id: string, userID: ?string = null): Promise<?Webhook> => {
    const query = userID ? { _id: id, ownerID: userID } : { _id: id };
    const webhook = await this._collection.findOne(query);

    return webhook ? { ...webhook, id: webhook._id.toString() } : null;
  };

  update = async (): Promise<Webhook> => {
    throw new Error('The method is not implemented');
  };
}

export default WebhookDatabaseRepository;

