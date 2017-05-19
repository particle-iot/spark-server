// @flow

import fs from 'fs';
import mkdirp from 'mkdirp';
import tingoDb from 'tingodb';
import { promisifyByPrototype } from '../lib/promisify';

class TingoDb {
  _database: Object;

  constructor(path: string, options: Object) {
    const Db = tingoDb(options).Db;

    if (!fs.existsSync(path)) {
      mkdirp.sync(path);
    }

    this._database = new Db(path, {});
  }

  getCollection = (collectionName: string): Object =>
    promisifyByPrototype(this._database.collection(collectionName));
}

export default TingoDb;
