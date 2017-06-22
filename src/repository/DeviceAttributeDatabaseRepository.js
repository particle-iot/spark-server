// @flow

import type { CollectionName } from './collectionNames';
import type {
  DeviceAttributes,
  IBaseDatabase,
  IDeviceAttributeRepository,
} from '../types';

import COLLECTION_NAMES from './collectionNames';

// getByID, deleteByID and update uses model.deviceID as ID for querying
class DeviceAttributeDatabaseRepository implements IDeviceAttributeRepository {
  _database: IBaseDatabase;
  _collectionName: CollectionName = COLLECTION_NAMES.DEVICE_ATTRIBUTES;
  _permissionManager: Object;

  constructor(database: IBaseDatabase, permissionManager: Object) {
    this._database = database;
    this._permissionManager = permissionManager;
  }

  create = async (): Promise<DeviceAttributes> => {
    throw new Error('The method is not implemented');
  };

  deleteByID = async (deviceID: string): Promise<void> =>
    await this._database.remove(this._collectionName, { deviceID });

  getAll = async (userID: ?string = null): Promise<Array<DeviceAttributes>> => {
    const query = userID ? { ownerID: userID } : {};
    return await this._database.find(this._collectionName, query);
  };

  getByID = async (deviceID: string): Promise<?DeviceAttributes> =>
    await this._database.findOne(this._collectionName, { deviceID });

  updateByID = async (
    deviceID: string,
    props: $Shape<DeviceAttributes>,
  ): Promise<DeviceAttributes> =>
    await this._database.findAndModify(
      this._collectionName,
      { deviceID },
      { $set: { ...props, timeStamp: new Date() } },
    );
}
export default DeviceAttributeDatabaseRepository;
