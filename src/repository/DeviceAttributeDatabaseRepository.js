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
    return (await this._database.find(this._collectionName, query)).map(
      this._parseVariables,
    );
  };

  getByID = async (deviceID: string): Promise<?DeviceAttributes> =>
    this._parseVariables(
      await this._database.findOne(this._collectionName, { deviceID }),
    );

  updateByID = async (
    deviceID: string,
    { variables, ...props }: $Shape<DeviceAttributes>,
  ): Promise<DeviceAttributes> => {
    const attributesToSave = {
      ...props,
      variables: variables ? JSON.stringify(variables) : undefined,
    };

    return await this._database.findAndModify(
      this._collectionName,
      { deviceID },
      { $set: { ...attributesToSave, timeStamp: new Date() } },
    );
  };

  // mongo and neDB don't support dots in variables names
  // but some of the server users want to have dots in their device var names
  // so we have to stringify them and parse back.
  _parseVariables = (attributesFromDB: ?Object): ?DeviceAttributes => {
    if (!attributesFromDB) {
      return null;
    }

    const { variables } = attributesFromDB;
    try {
      return {
        ...attributesFromDB,
        variables: variables ? JSON.parse(variables) : undefined,
      };
    } catch (ignore) {
      return attributesFromDB;
    }
  };
}
export default DeviceAttributeDatabaseRepository;
