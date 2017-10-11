// @flow

import { ObjectId } from 'mongodb';

const deepToObjectIdCast = (node: any): any => {
  Object.keys(node).forEach((key: string) => {
    if (node[key] === Object(node[key])) {
      deepToObjectIdCast(node[key]);
    }
    if (key === '_id') {
      // eslint-disable-next-line
      node[key] = new ObjectId(node[key]);
    }
  });
  return node;
};

class BaseMongoDb {
  // eslint-disable-next-line no-unused-vars
  __filterID = ({ id, ...otherProps }: Object): Object => ({ ...otherProps });

  __translateQuery = (query: Object): Object =>
    this.__filterID(deepToObjectIdCast(query));

  __translateResultItem = (item: ?Object): ?Object => {
    if (!item) {
      return null;
    }
    const { _id, ...otherProps } = item;
    return { ...otherProps, id: _id.toString() };
  };
}

export default BaseMongoDb;
