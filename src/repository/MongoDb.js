// @flow

import type { IBaseDatabase } from '../types';

import EventEmitter from 'events';
import BaseMongoDb from './BaseMongoDb';
import { MongoClient } from 'mongodb';
import Logger from '../lib/logger';
const logger = Logger.createModuleLogger(module);

const DB_READY_EVENT = 'dbReady';

class MongoDb extends BaseMongoDb implements IBaseDatabase {
  _database: ?Object = null;
  _statusEventEmitter = new EventEmitter();

  constructor(url: string, options?: Object = {}) {
    super();

    (async (): Promise<void> => await this._init(url, options))();
  }

  count = async (
    collectionName: string,
    query?: Object = {},
  ): Promise<number> =>
    (await this.__runForCollection(
      collectionName,
      async (collection: Object): Promise<number> =>
        await collection.count(this.__translateQuery(query), {
          timeout: false,
        }),
    )) || 0;

  insertOne = async (collectionName: string, entity: Object): Promise<*> =>
    await this.__runForCollection(
      collectionName,
      async (collection: Object): Promise<*> => {
        const insertResult = await collection.insertOne(entity);
        return this.__translateResultItem(insertResult.ops[0]);
      },
    );

  find = async (collectionName: string, query: Object): Promise<*> =>
    await this.__runForCollection(
      collectionName,
      async (collection: Object): Promise<*> => {
        const { page, pageSize = 25, ...otherQuery } = query;
        let result = collection.find(this.__translateQuery(otherQuery), {
          timeout: false,
        });

        if (page) {
          result = result.skip((page - 1) * pageSize).limit(pageSize);
        }

        const resultItems = await result.toArray();
        return resultItems.map(this.__translateResultItem);
      },
    );

  findAndModify = async (
    collectionName: string,
    query: Object,
    updateQuery: Object,
  ): Promise<*> =>
    await this.__runForCollection(
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

  findOne = async (collectionName: string, query: Object): Promise<*> =>
    await this.__runForCollection(
      collectionName,
      async (collection: Object): Promise<*> => {
        const resultItem = await collection.findOne(
          this.__translateQuery(query),
        );
        return this.__translateResultItem(resultItem);
      },
    );

  remove = async (collectionName: string, query: Object): Promise<*> =>
    await this.__runForCollection(
      collectionName,
      async (collection: Object): Promise<*> =>
        await collection.remove(this.__translateQuery(query)),
    );

  __runForCollection = async (
    collectionName: string,
    callback: (collection: Object) => Promise<*>,
  ): Promise<*> => {
    await this._isDbReady();
    // hack for flow:
    if (!this._database) {
      throw new Error('database is not initialized');
    }
    return callback(
      this._database.collection(collectionName),
    ).catch((error: Error): void =>
      logger.error({ err: error }, 'Run for Collection'),
    );
  };

  _init = async (url: string, options: Object): Promise<void> => {
    const database = await MongoClient.connect(url, options);

    database.on('error', (error: Error): void =>
      logger.error({ err: error }, 'DB connection Error: '),
    );

    database.on('open', (): void => logger.info('DB connected'));

    database.on('close', (str: string): void =>
      logger.info({ info: str }, 'DB disconnected: '),
    );

    this._database = database;
    this._statusEventEmitter.emit(DB_READY_EVENT);
  };

  _isDbReady = async (): Promise<void> => {
    if (this._database) {
      return Promise.resolve();
    }

    return new Promise((resolve: () => void) => {
      this._statusEventEmitter.once(DB_READY_EVENT, (): void => resolve());
    });
  };
}

export default MongoDb;
