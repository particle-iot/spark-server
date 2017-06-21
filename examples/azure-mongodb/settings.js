/**
 *    Copyright (C) 2013-2014 Spark Labs, Inc. All rights reserved. -  https://www.spark.io/
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *    You can download the source here: https://github.com/spark/spark-server
 *
 * @flow
 *
 */

import path from 'path';

/* eslint-disable sorting/sort-object-props */
export default {
  BUILD_DIRECTORY: path.join(__dirname, '../data/build'),
  DEFAULT_ADMIN_PASSWORD: 'adminPassword',
  DEFAULT_ADMIN_USERNAME: '__admin__',
  DEVICE_DIRECTORY: path.join(__dirname, '../data/deviceKeys'),
  ENABLE_SYSTEM_FIRWMARE_AUTOUPDATES: true,
  FIRMWARE_DIRECTORY: path.join(__dirname, '../data/knownApps'),
  FIRMWARE_REPOSITORY_DIRECTORY: path.join(__dirname, '../../spark-firmware'),
  SERVER_KEY_FILENAME: 'default_key.pem',
  SERVER_KEYS_DIRECTORY: path.join(__dirname, '../data'),
  USERS_DIRECTORY: path.join(__dirname, '../data/users'),
  WEBHOOKS_DIRECTORY: path.join(__dirname, '../data/webhooks'),
  ACCESS_TOKEN_LIFETIME: 7776000, // 90 days,
  API_TIMEOUT: 30000, // Timeout for API requests.
  CRYPTO_ALGORITHM: 'aes-128-cbc',
  LOG_REQUESTS: true,
  LOGIN_ROUTE: '/oauth/token',
  EXPRESS_SERVER_CONFIG: {
    PORT: 8080,
    SSL_CERTIFICATE_FILEPATH: null,
    SSL_PRIVATE_KEY_FILEPATH: null,
    USE_SSL: false,
  },
  DB_CONFIG: {
    OPTIONS: {
      // here you can pass any options, which MongoClient.connect() accepts
      // retry to connect for 60 times
      reconnectTries: 60,
      // wait 1 second before retrying
      reconnectInterval: 1000,
    },
    // you have to provide mongo connection URL here
    URL: 'mongodb://host:impFJimWwvAJ59u8E...',
  },
  SHOW_VERBOSE_DEVICE_LOGS: false,

  TCP_DEVICE_SERVER_CONFIG: {
    HOST: 'localhost',
    PORT: 5683,
  },
  // Override template parameters in webhooks with this object
  WEBHOOK_TEMPLATE_PARAMETERS: {
    // SOME_AUTH_TOKEN: '12312312',
  },
};
