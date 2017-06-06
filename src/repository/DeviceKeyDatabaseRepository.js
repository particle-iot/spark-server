// @flow

import type { DeviceKeyObject, IBaseDatabase, IDeviceKeyRepository } from '../types';

class DeviceKeyDatabaseRepository implements IDeviceKeyRepository {
  _database: IBaseDatabase;
  _collectionName: string = 'deviceKeys';

  constructor(database: IBaseDatabase) {
    this._database = database;
  }

  create = async (model: DeviceKeyObject): Promise<DeviceKeyObject> =>
    await this._database.insertOne(
      this._collectionName,
      { _id: model.deviceID, ...model },
    );

  deleteByID = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, { _id: id });

  getAll = async (): Promise<Array<DeviceKeyObject>> => {
    throw new Error('The method is not implemented.');
  };

  getById = async (deviceID: string): Promise<?DeviceKeyObject> =>
    await this._database.findOne(
      this._collectionName,
      { _id: deviceID },
    );

  update = async (model: DeviceKeyObject): Promise<DeviceKeyObject> =>
    await this._database.findAndModify(
      this._collectionName,
      { _id: model.deviceID },
      null,
      { $set: { ...model } },
      { new: true, upsert: true },
    );
}

export default DeviceKeyDatabaseRepository;
