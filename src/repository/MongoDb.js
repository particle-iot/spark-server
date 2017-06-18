// @flow

import type { IBaseDatabase } from '../types';

import BaseMongoDb from './BaseMongoDb';

class MongoDb extends BaseMongoDb implements IBaseDatabase {
  _database: Object;

  constructor(database: Object) {
    super();

    this._database = database;
  }

  insertOne = async (
    collectionName: string,
    entity: Object,
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      const insertResult = await collection.insertOne(entity);
      return this.__translateResultItem(insertResult.ops[0]);
    },
  );

  find = async (
    collectionName: string,
    query: Object,
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      const resultItems = await collection.find(
        this.__translateQuery(query),
        { timeout: false },
      ).toArray();

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
      const modifyResult = await collection.findAndModify(
        this.__translateQuery(query),
        null,
        this.__translateQuery(updateQuery),
        { new: true, upsert: true },
      );
      return this.__translateResultItem(modifyResult.value);
    },
  );

  findOne = async (
    collectionName: string,
    query: Object,
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> => {
      const resultItem = await collection.findOne(
        this.__translateQuery(query),
      );
      return this.__translateResultItem(resultItem);
    },
  );

  remove = async (
    collectionName: string,
    query: Object,
  ): Promise<*> => await this.__runForCollection(
    collectionName,
    async (collection: Object): Promise<*> =>
      await collection.remove(this.__translateQuery(query)),
  );

  __runForCollection = async (
    collectionName: string,
    callback: (collection: Object) => Promise<*>,
  ): Promise<*> => callback(
    this._database.collection(collectionName),
  ).catch((error: Error): void => console.error(error));
}

export default MongoDb;
