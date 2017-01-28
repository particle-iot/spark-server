// @flow

import path from 'path';

/* eslint-disable sorting/sort-object-props */
export default {
  CUSTOM_FIRMWARE_DIRECTORY: path.join(__dirname, '../__test_data__'),
  DEVICE_DIRECTORY: path.join(__dirname, '../__test_data__/deviceKeys'),
  FIRMWARE_DIRECTORY: path.join(__dirname, '../__test_data__/knownApps'),
  SERVER_KEY_FILENAME: 'default_key.pem',
  SERVER_KEYS_DIRECTORY: path.join(__dirname, '../__test_data__'),
  USERS_DIRECTORY: path.join(__dirname, '../__test_data__/users'),
  WEBHOOKS_DIRECTORY: path.join(__dirname, '../__test_data__/webhooks'),

  accessTokenLifetime: 7776000, // 90 days,
  baseUrl: 'http://localhost',
  coreFlashTimeout: 90000,
  coreRequestTimeout: 30000,
  coreSignalTimeout: 30000,
  isCoreOnlineTimeout: 2000,
  loginRoute: '/oauth/token',
  logRequests: false,
  maxHooksPerDevice: 10,
  maxHooksPerUser: 20,

  /**
   * Your server crypto keys!
   */
  cryptoSalt: 'aes-128-cbc',
  serverKeyFile: 'default_key.pem',
  serverKeyPassFile: null,
  serverKeyPassEnvVar: null,

  PORT: 5683,
  HOST: 'localhost',
};
