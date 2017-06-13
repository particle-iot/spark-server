// @flow

import BaseMongoDb from './BaseMongoDb';

class MongoDb extends BaseMongoDb {
  _database: Object;

  constructor(database: Object) {
    super();

    this._database = database;
  }

  __runForCollection = async (
    collectionName: string,
    callback: (collection: Object) => Promise<*>,
  ): Promise<*> => callback(
    this._database.collection(collectionName),
  ).catch((error: Error): void => console.error(error));
}

export default MongoDb;
