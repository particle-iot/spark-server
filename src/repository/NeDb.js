// @flow

import type { IBaseDatabase } from '../types';
import type { CollectionName } from './collectionNames';

import fs from 'fs';
import mkdirp from 'mkdirp';
import Datastore from 'nedb-core';
import COLLECTION_NAMES from './collectionNames';
import { promisify } from '../lib/promisify';
import BaseMongoDb from './BaseMongoDb';

class NeDb extends BaseMongoDb implements IBaseDatabase {
  _database: Object;

  constructor(path: string) {
    super();

    if (!fs.existsSync(path)) {
      mkdirp.sync(path);
    }

    this._database = {};

    Object.values(COLLECTION_NAMES).forEach((collectionName: mixed) => {
      const colName: CollectionName = (collectionName: any);
      this._database[collectionName] = new Datastore({
        autoload: true,
        filename: `${path}/${colName}.db`,
      });
    });
  }

  insertOne = async (
    collectionName: string,
    entity: Object,
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      const insertResult = await promisify(
        collection,
        'insert',
        entity,
      );

      return this.__translateResultItem(insertResult);
    },
  );

  find = async (
    collectionName: string,
    query: Object,
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      const resultItems = await promisify(collection, 'find', query);
      return resultItems.map(this.__translateResultItem);
    },
  );

  findAndModify = async (
    collectionName: string,
    query: Object,
    updateQuery: Object,
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      // eslint-disable-next-line no-unused-vars
      const [count, resultItem] = await promisify(
        collection,
        'update',
        query,
        updateQuery,
        { returnUpdatedDocs: true, upsert: true },
      );

      return this.__translateResultItem(resultItem);
    },
  );

  findOne = async (
    collectionName: string,
    query: Object,
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      const resultItem = await promisify(collection, 'findOne', query);
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
  ): Promise<*> => callback(this._database[collectionName]);
}

export default NeDb;
