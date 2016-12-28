// @flow

import type {
  $Application,
  $Request,
  $Response,
  Middleware,
  NextFunction,
} from 'express';
import type { EventPublisher, DeviceServer } from 'spark-protocol';
import type { Settings } from './types';

import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';

// Repositories
import DeviceRepository from './repository/DeviceRepository';
import {
  DeviceAttributeFileRepository,
  DeviceKeyFileRepository,
} from 'spark-protocol';

// Managers
import EventManager from './managers/EventManager';

// Routing
import routeConfig from './RouteConfig';
import DeviceClaimsController from './controllers/DeviceClaimsController';
import DevicesController from './controllers/DevicesController';
import EventsController from './controllers/EventsController';
import ProvisioningController from './controllers/ProvisioningController';
import UsersController from './controllers/UsersController';
import WebhooksController from './controllers/WebhooksController';

export default (
  settings: Settings,
  deviceServer: DeviceServer,
  eventPublisher: EventPublisher,
): $Application => {
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

  const deviceAttributeRepository = new DeviceAttributeFileRepository(
    settings.coreKeysDir,
  );

  const deviceRepository = new DeviceRepository(
    deviceAttributeRepository,
    settings.deviceFirmwareRepository,
    new DeviceKeyFileRepository(settings.coreKeysDir),
    deviceServer,
  );

  const eventManager = new EventManager(
    deviceAttributeRepository,
    eventPublisher,
  );

  // to avoid routes collisions eventController should be placed
  // before DevicesController
  routeConfig(
    app,
    [
      new DeviceClaimsController(deviceRepository),
      new EventsController(eventManager),
      new DevicesController(deviceRepository),
      new ProvisioningController(deviceRepository),
      new UsersController(settings.usersRepository),
      new WebhooksController(settings.webhookRepository),
    ],
    settings,
  );

  return app;
};
