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

  ACCESS_TOKEN_LIFETIME: 7776000, // 90 days,
  API_TIMEOUT: 30000,
  CRYPTO_SALT: 'aes-128-cbc',
  LOG_REQUESTS: false,
  LOGIN_ROUTE: '/oauth/token',

  PORT: 5683,
  HOST: 'localhost',
};
