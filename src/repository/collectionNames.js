// @flow

export type CollectionName =
  | 'deviceAttributes'
  | 'deviceKeys'
  | 'organizations'
  | 'products'
  | 'productConfigs'
  | 'productDevices'
  | 'productFirmware'
  | 'users'
  | 'webhooks';

const COLLECTION_NAMES: { [key: string]: CollectionName } = {
  DEVICE_ATTRIBUTES: 'deviceAttributes',
  DEVICE_KEYS: 'deviceKeys',
  ORGANIZATIONS: 'organizations',
  PRODUCT_CONFIGS: 'productConfigs',
  PRODUCT_DEVICES: 'productDevices',
  PRODUCT_FIRMWARE: 'productFirmware',
  PRODUCTS: 'products',
  USERS: 'users',
  WEBHOOKS: 'webhooks',
};

export default COLLECTION_NAMES;
