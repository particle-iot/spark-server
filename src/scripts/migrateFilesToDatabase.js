// @flow

import type { DeviceKeyObject } from '../types';

import fs from 'fs';
import settings from '../settings';
import { ObjectId } from 'mongodb';
import NeDb from '../repository/NeDb';
import MongoDb from '../repository/MongoDb';

type DatabaseType = 'mongo' | 'nedb';

type Database = MongoDb | NeDb;

type FileObject = {
  fileName: string,
  fileBuffer: Buffer,
};

const DATABASE_TYPE: DatabaseType = (process.argv[2]: any);

const setupDatabase = async (): Promise<Database> => {
  if (DATABASE_TYPE === 'mongo') {
    if (!settings.DB_CONFIG.URL) {
      throw new Error(
        'You should provide mongoDB connection URL' +
          'in settings.DB_CONFIG.URL',
      );
    }
    return new MongoDb(settings.DB_CONFIG.URL, settings.DB_CONFIG.OPTIONS);
  }

  if (DATABASE_TYPE === 'nedb') {
    if (!settings.DB_CONFIG.PATH) {
      throw new Error(
        'You should provide path to dir where NeDB will store the db files' +
          'in settings.DB_CONFIG.PATH',
      );
    }
    return new NeDb(settings.DB_CONFIG.PATH);
  }
  throw new Error('Wrong database type');
};

const getFiles = (
  directoryPath: string,
  fileExtension?: string = '.json',
): Array<FileObject> => {
  const fileNames = fs
    .readdirSync(directoryPath)
    .filter((fileName: string): boolean => fileName.endsWith(fileExtension));

  return fileNames.map((fileName: string): FileObject => ({
    fileBuffer: fs.readFileSync(`${directoryPath}/${fileName}`),
    fileName,
  }));
};

const parseFile = (file: Buffer): Object => JSON.parse(file.toString());

const mapOwnerID = (
  userIDsMap: Map<string, string>,
): ((item: Object) => Object) => (item: Object): Object => ({
  ...item,
  ownerID: userIDsMap.get(item.ownerID) || null,
});

const translateDeviceID = (item: Object): Object => ({
  ...item,
  _id: new ObjectId(item.deviceID),
  id: item.deviceID,
});

// eslint-disable-next-line no-unused-vars
const filterID = ({ id, ...otherProps }: Object): Object => ({ ...otherProps });

const deepDateCast = (node: any): any => {
  Object.keys(node).forEach((key: string) => {
    if (node[key] === Object(node[key])) {
      deepDateCast(node[key]);
    }
    if (!isNaN(Date.parse(node[key]))) {
      // eslint-disable-next-line
      node[key] = new Date(node[key]);
    }
  });
  return node;
};

const insertItem = (
  database: Object,
  collectionName: string,
): ((item: Object) => Promise<void>) => async (item: Object): Promise<void> =>
  await database.insertOne(collectionName, item);

const insertUsers = async (
  database: Object,
  users: Array<Object>,
): Promise<Map<string, string>> => {
  const userIDsMap = new Map();

  await Promise.all(
    users.map(deepDateCast).map(async (user: Object): Promise<void> => {
      const insertedUser = await database.insertOne('users', filterID(user));
      userIDsMap.set(user.id, insertedUser.id);
    }),
  );

  return userIDsMap;
};

(async (): Promise<void> => {
  try {
    console.log('Setup database connection...');
    const database = await setupDatabase();
    console.log(`Start migration to ${DATABASE_TYPE}`);

    const users = getFiles(
      settings.USERS_DIRECTORY,
    ).map(({ fileBuffer }: FileObject): Object => parseFile(fileBuffer));

    const userIDsMap = await insertUsers(database, users);

    await Promise.all(
      getFiles(settings.WEBHOOKS_DIRECTORY)
        .map(({ fileBuffer }: FileObject): Object => parseFile(fileBuffer))
        .map(deepDateCast)
        .map(mapOwnerID(userIDsMap))
        .map(filterID)
        .map(insertItem(database, 'webhooks')),
    );

    await Promise.all(
      getFiles(settings.DEVICE_DIRECTORY)
        .map(({ fileBuffer }: FileObject): Object => parseFile(fileBuffer))
        .map(deepDateCast)
        .map(mapOwnerID(userIDsMap))
        .map(translateDeviceID)
        .map(filterID)
        .map(insertItem(database, 'deviceAttributes')),
    );

    await Promise.all(
      getFiles(settings.DEVICE_DIRECTORY, '.pub.pem')
        .map(({ fileName, fileBuffer }: FileObject): DeviceKeyObject => ({
          algorithm: 'rsa',
          deviceID: fileName.substring(0, fileName.indexOf('.pub.pem')),
          key: fileBuffer.toString(),
        }))
        .map(insertItem(database, 'deviceKeys')),
    );

    console.log('All files migrated to the database successfully!');
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();
