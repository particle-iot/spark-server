// @flow

import BaseMongoRepository from './BaseMongoRepository';

class MongoDb extends BaseMongoRepository {
  _database: Object;

  constructor(database: Object) {
    super();

    this._database = database;
  }

  __runForCollection = async (
    collectionName: string,
    callback: (collection: Object) => Promise<*>,
  ): Promise<*> => callback(this._database.collection(collectionName));
}

export default MongoDb;
