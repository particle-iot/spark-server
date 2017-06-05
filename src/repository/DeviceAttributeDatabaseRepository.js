// @flow

import type {
  DeviceAttributes,
  IBaseDatabase,
  IDeviceAttributeRepository,
} from '../types';

class DeviceAttributeDatabaseRepository implements IDeviceAttributeRepository {
  _database: IBaseDatabase;
  _collectionName: string = 'deviceAttributes';

  constructor(database: IBaseDatabase) {
    this._database = database;
  }

  create = async (): Promise<DeviceAttributes> => {
    throw new Error('The method is not implemented');
  };

  deleteById = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, id);

  doesUserHaveAccess = async (id: string, userID: string): Promise<boolean> =>
    !!(await this._database.findOne(
      this._collectionName,
      { _id: id, ownerID: userID },
    ));

  getAll = async (userID: ?string = null): Promise<Array<DeviceAttributes>> => {
    const query = userID ? { ownerID: userID } : {};
    return await this._database.find(
      this._collectionName,
      query,
      { timeout: false },
    );
  };

  getById = async (
    id: string,
    userID: ?string = null,
  ): Promise<?DeviceAttributes> => {
    const query = userID ? { _id: id, ownerID: userID } : { _id: id };
    return await this._database.findOne(this._collectionName, query);
  };

  update = async (model: DeviceAttributes): Promise<DeviceAttributes> =>
    await this._database.findAndModify(
      this._collectionName,
      { _id: model.deviceID },
      null,
      { $set: { ...model, _id: model.deviceID, timeStamp: new Date() } },
      { new: true, upsert: true },
    );
}

export default DeviceAttributeDatabaseRepository;
