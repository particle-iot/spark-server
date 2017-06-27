// @flow

export type CollectionName =
  | 'deviceAttributes'
  | 'deviceKeys'
  | 'users'
  | 'webhooks';

const COLLECTION_NAMES: { [key: string]: CollectionName } = {
  DEVICE_ATTRIBUTES: 'deviceAttributes',
  DEVICE_KEYS: 'deviceKeys',
  USERS: 'users',
  WEBHOOKS: 'webhooks',
};

export default COLLECTION_NAMES;
