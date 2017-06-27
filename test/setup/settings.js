// @flow

import path from 'path';

/* eslint-disable sorting/sort-object-props */
export default {
  BUILD_DIRECTORY: path.join(__dirname, '../__test_data__/build'),
  CUSTOM_FIRMWARE_DIRECTORY: path.join(__dirname, '../__test_data__'),
  DEFAULT_ADMIN_PASSWORD: 'adminPassword',
  DEFAULT_ADMIN_USERNAME: '__admin__',
  DEVICE_DIRECTORY: path.join(__dirname, '../__test_data__/deviceKeys'),
  ENABLE_SYSTEM_FIRWMARE_AUTOUPDATES: true,
  FIRMWARE_DIRECTORY: path.join(__dirname, '../__test_data__/knownApps'),
  FIRMWARE_REPOSITORY_DIRECTORY: path.join(
    __dirname,
    '../__test_data__/firmware',
  ),
  SERVER_KEY_FILENAME: 'default_key.pem',
  SERVER_KEYS_DIRECTORY: path.join(__dirname, '../__test_data__'),
  USERS_DIRECTORY: path.join(__dirname, '../__test_data__/users'),
  WEBHOOKS_DIRECTORY: path.join(__dirname, '../__test_data__/webhooks'),

  ACCESS_TOKEN_LIFETIME: 7776000, // 90 days,
  API_TIMEOUT: 30000,
  CRYPTO_ALGORITHM: 'aes-128-cbc',
  LOG_REQUESTS: false,
  LOGIN_ROUTE: '/oauth/token',

  EXPRESS_SERVER_CONFIG: {
    PORT: 8080,
    SSL_CERTIFICATE_FILEPATH: null,
    SSL_PRIVATE_KEY_FILEPATH: null,
    USE_SSL: false,
  },
  TCP_DEVICE_SERVER_CONFIG: {
    HOST: 'localhost',
    PORT: 5683,
  },
  DB_CONFIG: {
    PATH: path.join(__dirname, '../__test_data__/db'),
  },
  WEBHOOK_TEMPLATE_PARAMETERS: {},
};
