// @flow

import type {
  $Application,
  $Request,
  $Response,
  Middleware,
  NextFunction,
} from 'express';
import type { Settings } from './types';

import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';

import api from './views/api_v1';
import eventsV1 from './views/EventViews001';

// Routing
import routeConfig from './lib/RouteConfig';
import UsersController from './lib/controllers/UsersController';
import WebhookController from './lib/controllers/WebhookController';

export default (settings: Settings): $Application => {
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

  if (settings.logRequests) {
    app.use(morgan('combined'));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(setCORSHeaders);

  routeConfig(
    app,
    [
      new UsersController(settings.usersRepository),
      new WebhookController(settings.webhookRepository),
    ],
    settings,
  );

  eventsV1.loadViews(app);
  api.loadViews(app);

  const noRouteMiddleware: Middleware = (
    request: $Request,
    response: $Response,
  ): mixed => response.sendStatus(404);

  app.use(noRouteMiddleware);

  return app;
};
