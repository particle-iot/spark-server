// @flow

import { promisify } from '../lib/promisify';

class BaseMongoRepository {
  insert = async (
    collectionName: string,
    entity: Object,
  ): Promise<*> => this.__runForCollection(
      collectionName,
      (collection: Object): Promise<*> => promisify(
        collection,
        'insert',
        entity,
        { fullResult: true },
     ).then((results: Array<*>): Object => results[0]),
    );

  find = async (
    collectionName: string,
    ...args: Array<any>
  ): Promise<*> => this.__runForCollection(
    collectionName,
    (collection: Object): Promise<*> =>
      promisify(collection.find(...args), 'toArray'),
  ).then((items: Array<*>): Array<*> =>
    items.map((item: Object): Object =>
      (item ? { ...item, id: item._id } : null)),
  );

  findOne = async (
    collectionName: string,
    ...args: Array<any>
  ): Promise<*> => this.__runForCollection(
      collectionName,
      (collection: Object): Promise<*> =>
        promisify(collection, 'findOne', ...args),
    ).then((item: Object): Object => (item ? { ...item, id: item._id } : null));

  findAndModify = async (
    collectionName: string,
    ...args: Array<any>
  ): Promise<*> => this.__runForCollection(
      collectionName,
      (collection: Object): Promise<*> =>
        promisify(collection, 'findAndModify', ...args),
    ).then((item: Object): Object => ({ ...item, id: item._id }));

  remove = async (
    collectionName: string,
    id: string,
  ): Promise<*> => this.__runForCollection(
      collectionName,
      (collection: Object): Promise<*> =>
        promisify(collection, 'remove', { _id: id }),
    );

  __runForCollection = async (
    collectionName: string,
    callback: (collection: Object) => Promise<*>,
  ): Promise<*> => {
    throw new Error(`Not implemented ${callback.toString()}`);
  };
}

export default BaseMongoRepository;
