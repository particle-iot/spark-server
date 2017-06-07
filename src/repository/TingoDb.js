// @flow

import fs from 'fs';
import mkdirp from 'mkdirp';
import tingoDb from 'tingodb';
import { promisify } from '../lib/promisify';
import BaseMongoDb from './BaseMongoDb';

class TingoDb extends BaseMongoDb {
  _database: Object;

  constructor(path: string, options: Object) {
    super();

    const Db = tingoDb(options).Db;

    if (!fs.existsSync(path)) {
      mkdirp.sync(path);
    }

    this._database = new Db(path, {});
  }

  insertOne = async (
    collectionName: string,
    entity: Object,
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      const insertResults = await promisify(
        collection,
        'insert',
        entity,
        { fullResult: true },
      );

      return this.__translateResultItem(insertResults[0]);
    },
  );

  find = async (
    collectionName: string,
    ...args: Array<any>
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      const resultItems = await promisify(collection.find(...args), 'toArray');
      return resultItems.map(this.__translateResultItem);
    },
  );

  findAndModify = async (
    collectionName: string,
    ...args: Array<any>
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      const modifiedItem = await promisify(collection, 'findAndModify', ...args);
      return this.__translateResultItem(modifiedItem);
    },
  );

  findOne = async (
    collectionName: string,
    ...args: Array<any>
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      const resultItem = await promisify(collection, 'findOne', ...args);
      return this.__translateResultItem(resultItem);
    },
  );

  remove = async (
    collectionName: string,
    query: Object,
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> =>
      await promisify(collection, 'remove', query),
  );

  __runForCollection = async (
    collectionName: string,
    callback: (collection: Object) => Promise<*>,
  ): Promise<*> => callback(this._database.collection(collectionName));
}

export default TingoDb;
