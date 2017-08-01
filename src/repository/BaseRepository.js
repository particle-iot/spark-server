// @flow

import type { CollectionName } from './collectionNames';
import type { IBaseDatabase } from '../types';

class BaseRepository {
  _database: IBaseDatabase;
  _collectionName: CollectionName;

  constructor(database: IBaseDatabase, collectionName: CollectionName) {
    this._database = database;
    this._collectionName = collectionName;
  }

  count = async (...filters: Array<any>): Promise<number> =>
    await this._database.count(
      this._collectionName,
      ...(filters.length ? filters : [{}]),
    );
}

export default BaseRepository;
