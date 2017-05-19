// @flow

import type { Database, DeviceAttributes } from '../types';

import { promisifyByPrototype } from '../lib/promisify';

class DeviceAttributeDatabaseRepository {
  _collection: Object;

  constructor(database: Database) {
    this._collection = database.getCollection('deviceAttributes');
  }

  create = async (): Promise<DeviceAttributes> => {
    throw new Error('The method is not implemented');
  };

  update = async (model: DeviceAttributes): Promise<DeviceAttributes> =>
    await this._collection.findAndModify(
      { _id: model.deviceID },
      null,
      { $set: { ...model, _id: model.deviceID, timeStamp: new Date() } },
      { new: true, upsert: true },
    );

  deleteById = async (id: string): Promise<void> =>
    await this._collection.remove({ _id: id });

  doesUserHaveAccess = async (id: string, userID: string): Promise<boolean> =>
    !!(await this._collection.findOne({ _id: id, ownerID: userID }));

  getAll = async (userID: ?string = null): Promise<Array<DeviceAttributes>> => {
    const query = userID ? { ownerID: userID } : {};

    return await (promisifyByPrototype(
      await this._collection.find(query),
    ).toArray());
  };

  getById = async (
    id: string,
    userID: ?string = null,
  ): Promise<?DeviceAttributes> => {
    const query = userID ? { _id: id, ownerID: userID } : { _id: id };

    return await this._collection.findOne(query);
  }
}

export default DeviceAttributeDatabaseRepository;
