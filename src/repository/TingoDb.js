// @flow

import fs from 'fs';
import mkdirp from 'mkdirp';
import tingoDb from 'tingodb';
import BaseMongoRepository from './BaseMongoRepository';

class TingoDb extends BaseMongoRepository {
  _database: Object;

  constructor(path: string, options: Object) {
    super();

    const Db = tingoDb(options).Db;

    if (!fs.existsSync(path)) {
      mkdirp.sync(path);
    }

    this._database = new Db(path, {});
  }

  __runForCollection = async (
    collectionName: string,
    callback: (collection: Object) => Promise<*>,
  ): Promise<*> => callback(this._database.collection(collectionName));
}

export default TingoDb;
