// @flow

import BaseMongoRepository from './BaseMongoRepository';

class MongoDb extends BaseMongoRepository {
  _databasePromise: Promise<Object>;
  _database: Object;

  constructor(database: Object) {
    super();

    this._database = database;
  }

  __runForCollection = async (
    collectionName: string,
    callback: (collection: Object) => Promise<*>,
  ): Promise<*> => {
    console.log(this._database.collection(collectionName) !== null);
    return callback(this._database.collection(collectionName));
  }
}

export default MongoDb;
