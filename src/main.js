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

import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import OAuthServer from 'node-oauth2-server';
import { DeviceServer } from 'spark-protocol';
import settings from './settings';

import utilities from './lib/utilities';
import logger from './lib/logger';
import OAuth2ServerModel from './lib/OAuth2ServerModel';
import AccessTokenViews from './lib/AccessTokenViews';
import UserCreator from './lib/UserCreator.js';

import api from './views/api_v1.js';
import eventsV1 from './views/EventViews001.js';

// Routing
import routeConfig from './lib/RouteConfig';
import WebhookController from './lib/controllers/WebhookController';

const  NODE_PORT = process.env.NODE_PORT || 8080;

// TODO wny do we need this? (Anton Puko)
global._socket_counter = 1;

//TODO: something better here
process.on('uncaughtException', (exception) => {
  let details = '';
  try {
    details = JSON.stringify(exception);
  } catch (stringifyException) {
    logger.error('Caught exception: ' + stringifyException);
  }
  logger.error('Caught exception: ' + exception + details);
});

const app = express();

const oauth = OAuthServer({
  allow: {
    "delete": ['/v1/access_tokens/([0-9a-f]{40})'],
    "get": ['/server/health', '/v1/access_tokens'],
    "post": ['/v1/users'],
  },
	accessTokenLifetime: 7776000,    //90 days
	grants: ['password'],
	model: new OAuth2ServerModel({}),
});

const setCORSHeaders = (request, response, next) => {
  if ('OPTIONS' === request.method) {
    response.set({
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': 300,
    });
    return response.sendStatus(204);
  }
	else {
		response.set({'Access-Control-Allow-Origin': '*'});
		next();
	}
};

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(setCORSHeaders);
app.use(oauth.handler());
app.use(oauth.errorHandler());


app.post('/v1/users', UserCreator.getMiddleware());
const tokenViews = new AccessTokenViews({});

eventsV1.loadViews(app);
api.loadViews(app);
tokenViews.loadViews(app);
routeConfig(app, [
  new WebhookController(settings.webhookRepository),
]);

app.use((request, response, next) => response.sendStatus(404));


console.log("Starting server, listening on " + NODE_PORT);
http.createServer(app).listen(NODE_PORT);

const deviceServer = new DeviceServer({
	coreKeysDir: settings.coreKeysDir,
});

// TODO wny do we need next line? (Anton Puko)
global.server = deviceServer;
deviceServer.start();


utilities.getIPAddresses().forEach((ip) =>
  console.log(`Your server IP address is: ${ip}`),
);
