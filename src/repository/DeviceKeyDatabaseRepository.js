// @flow

import type { IBaseDatabase, IDeviceKeyRepository } from '../types';

class DeviceKeyDatabaseRepository implements IDeviceKeyRepository {
  _database: IBaseDatabase;
  _collectionName: string = 'deviceKeys';

  constructor(database: IBaseDatabase) {
    this._database = database;
  }

  deleteById = async (deviceID: string): Promise<void> =>
    await this._database.remove(this._collectionName, deviceID);

  getById = async (deviceID: string): Promise<?string> => {
    const keyObject = await this._database.findOne(
      this._collectionName,
      { _id: deviceID },
    );

    return keyObject ? keyObject.key : null;
  }

  update = async (deviceID: string, key: string): Promise<string> => {
    const keyObject = await this._database.findAndModify(
      this._collectionName,
      { _id: deviceID },
      null,
      { $set: { _id: deviceID, key } },
      { new: true, upsert: true },
    );

    return keyObject.key;
  }
}

export default DeviceKeyDatabaseRepository;
