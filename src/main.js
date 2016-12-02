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

import type {
  $Request,
  $Response,
  Middleware,
  NextFunction,
} from 'express';

import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { DeviceServer } from 'spark-protocol';
import settings from './settings';

import utilities from './lib/utilities';
import logger from './lib/logger';

import api from './views/api_v1';
import eventsV1 from './views/EventViews001';

// Routing
import routeConfig from './lib/RouteConfig';
import UsersController from './lib/controllers/UsersController';
import WebhookController from './lib/controllers/WebhookController';

import {
  DeviceAttributeFileRepository,
  ServerConfigFileRepository,
} from 'spark-protocol';

const NODE_PORT = process.env.NODE_PORT || 8080;

// TODO wny do we need this? (Anton Puko)
global._socket_counter = 1;

// TODO: something better here
process.on('uncaughtException', (exception: Error) => {
  let details = '';
  try {
    details = JSON.stringify(exception);
  } catch (stringifyException) {
    logger.error(`Caught exception: ${stringifyException}`);
  }
  logger.error(`Caught exception: ${exception.toString()} ${exception.stack}`);
});

const app = express();

const setCORSHeaders: Middleware = (
  request: $Request,
  response: $Response,
  next: NextFunction,
): mixed => {
  if (request.method === 'OPTIONS') {
    response.set({
      'Access-Control-Allow-Headers':
        'X-Requested-With, Content-Type, Accept, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': '300',
    });
    return response.sendStatus(204);
  }
  response.set({ 'Access-Control-Allow-Origin': '*' });
  return next();
};

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(setCORSHeaders);

routeConfig(app, [
  new UsersController(settings.usersRepository),
  new WebhookController(settings.webhookRepository),
]);

eventsV1.loadViews(app);
api.loadViews(app);

const noRouteMiddleware: Middleware = (
  request: $Request,
  response: $Response,
): mixed => response.sendStatus(404);

app.use(noRouteMiddleware);


console.log(`Starting server, listening on ${NODE_PORT}`);
app.listen(NODE_PORT);

const deviceServer = new DeviceServer({
  coreKeysDir: settings.coreKeysDir,
  deviceAttributeRepository: new DeviceAttributeFileRepository(
    settings.coreKeysDir,
  ),
  host: settings.HOST,
  port: settings.PORT,
  serverConfigRepository: new ServerConfigFileRepository(
    settings.serverKeyFile,
  ),
  serverKeyFile: settings.serverKeyFile,
  serverKeyPassEnvVar: settings.serverKeyPassEnvVar,
  serverKeyPassFile: settings.serverKeyPassFile,
});

// TODO wny do we need next line? (Anton Puko)
global.server = deviceServer;
deviceServer.start();


utilities.getIPAddresses().forEach((ip: string): void =>
  console.log(`Your server IP address is: ${ip}`),
);
