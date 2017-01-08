// @flow

import type {Container} from 'constitute';

import {
  defaultBindings,
} from 'spark-protocol';
import DeviceClaimsController from './controllers/DeviceClaimsController';
import DevicesController from './controllers/DevicesController';
import EventsController from './controllers/EventsController';
import ProvisioningController from './controllers/ProvisioningController';
import UsersController from './controllers/UsersController';
import WebhooksController from './controllers/WebhooksController';
import EventManager from './managers/EventManager';
import DeviceFirmwareFileRepository from './repository/DeviceFirmwareFileRepository';
import DeviceRepository from './repository/DeviceRepository';
import UserFileRepository from './repository/UserFileRepository';
import WebhookFileRepository from './repository/WebhookFileRepository';
import settings from './settings';

export default (container: Container): void => {
  // spark protocol container bindings
  defaultBindings(container);

  // settings
  container.bindValue('DEVICE_DIRECTORY', settings.DEVICE_DIRECTORY);
  container.bindValue('FIRMWARE_DIRECTORY', settings.FIRMWARE_DIRECTORY);
  container.bindValue('SERVER_KEY_FILENAME', settings.SERVER_KEY_FILENAME);
  container.bindValue('SERVER_KEYS_DIRECTORY', settings.SERVER_KEYS_DIRECTORY);
  container.bindValue('USERS_DIRECTORY', settings.USERS_DIRECTORY);
  container.bindValue('WEBHOOKS_DIRECTORY', settings.WEBHOOKS_DIRECTORY);

  // controllers
  container.bindClass(
    'DeviceClaimsController',
    DeviceClaimsController,
    ['DeviceRepository']
  );
  container.bindClass(
    'DevicesController',
    DevicesController,
    ['DeviceRepository']
  );
  container.bindClass(
    'EventsController',
    EventsController,
    ['EventManager']
  );
  container.bindClass(
    'ProvisioningController',
    ProvisioningController,
    ['DeviceRepository']
  );
  container.bindClass(
    'UsersController',
    UsersController,
    ['UserRepository']
  );
  container.bindClass(
    'WebhooksController',
    WebhooksController,
    ['WebhookRepository']
  );

  // managers
  container.bindClass(
    'EventManager',
    EventManager,
    ['EventPublisher']
  );

  // Repositories
  container.bindClass(
    'DeviceFirmwareRepository',
    DeviceFirmwareFileRepository,
    ['FIRMWARE_DIRECTORY']
  );
  container.bindClass(
    'DeviceRepository',
    DeviceRepository,
    [
      'DeviceAttributeRepository',
      'DeviceFirmwareRepository',
      'DeviceKeyRepository',
      'DeviceServer',
    ]
  );
  container.bindClass(
    'UserRepository',
    UserFileRepository,
    ['USERS_DIRECTORY']
  );
  container.bindClass(
    'WebhookRepository',
    WebhookFileRepository,
    ['WEBHOOKS_DIRECTORY']
  );
};
