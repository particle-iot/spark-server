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

const path = require('path');
/* eslint-disable sorting/sort-object-props */
module.exports = {
  BUILD_DIRECTORY: path.join(__dirname, '../data/build'),
  DEVICE_DIRECTORY: path.join(__dirname, '../data/deviceKeys'),
  FIRMWARE_DIRECTORY: path.join(__dirname, '../data/knownApps'),
  FIRMWARE_REPOSITORY_DIRECTORY: path.join(__dirname, '../../spark-firmware'),
  SERVER_KEY_FILENAME: 'default_key.pem',
  SERVER_KEYS_DIRECTORY: path.join(__dirname, '../data'),
  USERS_DIRECTORY: path.join(__dirname, '../data/users'),
  WEBHOOKS_DIRECTORY: path.join(__dirname, '../data/webhooks'),

  accessTokenLifetime: 7776000, // 90 days,
  baseUrl: 'http://localhost',
  coreFlashTimeout: 90000,
  coreRequestTimeout: 30000,
  coreSignalTimeout: 30000,
  isCoreOnlineTimeout: 2000,
  loginRoute: '/oauth/token',
  logRequests: true,
  maxHooksPerDevice: 10,
  maxHooksPerUser: 20,

  /**
   * Your server crypto keys!
   */
  cryptoSalt: 'aes-128-cbc',
  serverKeyPassFile: null,
  serverKeyPassEnvVar: null,

  PORT: 5683,
  HOST: 'localhost',
};
