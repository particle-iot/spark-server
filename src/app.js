// @flow

import type {
  $Application,
  $Request,
  $Response,
  Middleware,
  NextFunction,
} from 'express';
import type { Container } from 'constitute';
import type { Settings } from './types';

import bodyParser from 'body-parser';
import express from 'express';
import Logger from './lib/logger';
import routeConfig from './RouteConfig';
import bunyanMiddleware from 'bunyan-middleware';
const logger = Logger.createModuleLogger(module);

export default (
  container: Container,
  settings: Settings,
  existingApp?: express$Application,
): $Application => {
  const app = existingApp || express();

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
    response.set({
      'Access-Control-Allow-Origin': '*',
    });
    return next();
  };

  if (logger.debug()) {
    app.use(
      bunyanMiddleware({
        headerName: 'X-Request-Id',
        level: 'debug',
        logger,
        logName: 'req_id',
        obscureHeaders: [],
        propertyName: 'reqId',
      }),
    );
    logger.warn('Request logging enabled');
  }

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );
  app.use(setCORSHeaders);

  routeConfig(
    app,
    container,
    [
      'DeviceClaimsController',
      // to avoid routes collisions EventsController should be placed
      // before DevicesController
      'EventsController',
      'DevicesController',
      'OauthClientsController',
      'ProductsController',
      'ProvisioningController',
      'UsersController',
      'WebhooksController',
    ],
    settings,
  );

  return app;
};
