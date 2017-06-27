// @flow

import type { Container } from 'constitute';
import type { Settings } from './types';

import OAuthServer from 'express-oauth-server';
import OAuthModel from './OAuthModel';
import { defaultBindings } from 'spark-protocol';
import DeviceClaimsController from './controllers/DeviceClaimsController';
import DevicesController from './controllers/DevicesController';
import EventsController from './controllers/EventsController';
import OauthClientsController from './controllers/OauthClientsController';
import ProductsController from './controllers/ProductsController';
import ProvisioningController from './controllers/ProvisioningController';
import UsersController from './controllers/UsersController';
import WebhooksController from './controllers/WebhooksController';
import WebhookLogger from './lib/WebhookLogger';
import DeviceManager from './managers/DeviceManager';
import WebhookManager from './managers/WebhookManager';
import EventManager from './managers/EventManager';
import PermissionManager from './managers/PermissionManager';
import DeviceFirmwareFileRepository from './repository/DeviceFirmwareFileRepository';
import NeDb from './repository/NeDb';
import DeviceAttributeDatabaseRepository from './repository/DeviceAttributeDatabaseRepository';
import DeviceKeyDatabaseRepository from './repository/DeviceKeyDatabaseRepository';
import UserDatabaseRepository from './repository/UserDatabaseRepository';
import WebhookDatabaseRepository from './repository/WebhookDatabaseRepository';
import settings from './settings';

export default (container: Container, newSettings: Settings) => {
  // Make sure that the spark-server settings match whatever is passed in
  Object.keys(newSettings).forEach((key: string) => {
    settings[key] = newSettings[key];
  });

  // spark protocol container bindings
  defaultBindings(container, newSettings);

  // settings
  container.bindValue('DATABASE_PATH', settings.DB_CONFIG.PATH);
  container.bindValue('DEVICE_DIRECTORY', settings.DEVICE_DIRECTORY);
  container.bindValue('FIRMWARE_DIRECTORY', settings.FIRMWARE_DIRECTORY);
  container.bindValue('SERVER_KEY_FILENAME', settings.SERVER_KEY_FILENAME);
  container.bindValue('SERVER_KEYS_DIRECTORY', settings.SERVER_KEYS_DIRECTORY);
  container.bindValue('USERS_DIRECTORY', settings.USERS_DIRECTORY);
  container.bindValue('WEBHOOKS_DIRECTORY', settings.WEBHOOKS_DIRECTORY);
  container.bindMethod(
    'OAUTH_SETTINGS',
    (oauthModel: OAuthModel): Object => ({
      accessTokenLifetime: settings.ACCESS_TOKEN_LIFETIME,
      allowBearerTokensInQueryString: true,
      model: oauthModel,
    }),
    ['OAuthModel'],
  );

  container.bindClass('OAuthModel', OAuthModel, ['UserRepository']);

  container.bindClass('OAuthServer', OAuthServer, ['OAUTH_SETTINGS']);

  container.bindClass('Database', NeDb, ['DATABASE_PATH']);

  // lib
  container.bindClass('WebhookLogger', WebhookLogger, []);

  // controllers
  container.bindClass('DeviceClaimsController', DeviceClaimsController, [
    'DeviceManager',
    'ClaimCodeManager',
  ]);
  container.bindClass('DevicesController', DevicesController, [
    'DeviceManager',
  ]);
  container.bindClass('EventsController', EventsController, ['EventManager']);
  container.bindClass('PermissionManager', PermissionManager, [
    'DeviceAttributeRepository',
    'UserRepository',
    'WebhookRepository',
    'OAuthServer',
  ]);
  container.bindClass('OauthClientsController', OauthClientsController, []);
  container.bindClass('ProductsController', ProductsController, []);
  container.bindClass('ProvisioningController', ProvisioningController, [
    'DeviceManager',
  ]);
  container.bindClass('UsersController', UsersController, ['UserRepository']);
  container.bindClass('WebhooksController', WebhooksController, [
    'WebhookManager',
  ]);

  // managers
  container.bindClass('DeviceManager', DeviceManager, [
    'DeviceAttributeRepository',
    'DeviceFirmwareRepository',
    'DeviceKeyRepository',
    'PermissionManager',
    'EventPublisher',
  ]);
  container.bindClass('EventManager', EventManager, ['EventPublisher']);
  container.bindClass('WebhookManager', WebhookManager, [
    'EventPublisher',
    'PermissionManager',
    'WebhookLogger',
    'WebhookRepository',
  ]);

  // Repositories
  container.bindClass(
    'DeviceAttributeRepository',
    DeviceAttributeDatabaseRepository,
    ['Database'],
  );
  container.bindClass(
    'DeviceFirmwareRepository',
    DeviceFirmwareFileRepository,
    ['FIRMWARE_DIRECTORY'],
  );
  container.bindClass('DeviceKeyRepository', DeviceKeyDatabaseRepository, [
    'Database',
  ]);
  container.bindClass('UserRepository', UserDatabaseRepository, ['Database']);
  container.bindClass('WebhookRepository', WebhookDatabaseRepository, [
    'Database',
  ]);
};
