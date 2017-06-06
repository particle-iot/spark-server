// @flow

import type {
  DeviceAttributes,
  IBaseDatabase,
  IDeviceAttributeRepository,
} from '../types';

class DeviceAttributeDatabaseRepository implements IDeviceAttributeRepository {
  _database: IBaseDatabase;
  _collectionName: string = 'deviceAttributes';
  _permissionManager: Object;

  constructor(database: IBaseDatabase, permissionManager: Object) {
    this._database = database;
    this._permissionManager = permissionManager;
  }

  create = async (): Promise<DeviceAttributes> => {
    throw new Error('The method is not implemented');
  };

  deleteByID = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, { _id: id });

  getAll = async (userID: ?string = null): Promise<Array<DeviceAttributes>> => {
    const query = userID ? { ownerID: userID } : {};
    return await this._database.find(
      this._collectionName,
      query,
      { timeout: false },
    );
  };

  getByID = async (id: string): Promise<?DeviceAttributes> =>
    await this._database.findOne(this._collectionName, { _id: id });

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
