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
import OrganizationDatabaseRepository from './repository/OrganizationDatabaseRepository';
import ProductDatabaseRepository from './repository/ProductDatabaseRepository';
import ProductConfigDatabaseRepository from './repository/ProductConfigDatabaseRepository';
import ProductDeviceDatabaseRepository from './repository/ProductDeviceDatabaseRepository';
import ProductFirmwareDatabaseRepository from './repository/ProductFirmwareDatabaseRepository';
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

  container.bindClass('OAuthModel', OAuthModel, ['IUserRepository']);

  container.bindClass('OAuthServer', OAuthServer, ['OAUTH_SETTINGS']);

  container.bindClass('IDatabase', NeDb, ['DATABASE_PATH']);

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
    'IDeviceAttributeRepository',
    'IOrganizationRepository',
    'IUserRepository',
    'IWebhookRepository',
    'OAuthServer',
  ]);
  container.bindClass('OauthClientsController', OauthClientsController, []);
  container.bindClass('ProductsController', ProductsController, [
    'DeviceManager',
    'IDeviceAttributeRepository',
    'IOrganizationRepository',
    'IProductRepository',
    'IProductConfigRepository',
    'IProductDeviceRepository',
    'IProductFirmwareRepository',
  ]);
  container.bindClass('ProvisioningController', ProvisioningController, [
    'DeviceManager',
  ]);
  container.bindClass('UsersController', UsersController, ['IUserRepository']);
  container.bindClass('WebhooksController', WebhooksController, [
    'WebhookManager',
  ]);

  // managers
  container.bindClass('DeviceManager', DeviceManager, [
    'IDeviceAttributeRepository',
    'IDeviceFirmwareRepository',
    'IDeviceKeyRepository',
    'PermissionManager',
    'EventPublisher',
  ]);
  container.bindClass('EventManager', EventManager, ['EventPublisher']);
  container.bindClass('WebhookManager', WebhookManager, [
    'EventPublisher',
    'PermissionManager',
    'WebhookLogger',
    'IWebhookRepository',
  ]);

  // Repositories
  container.bindClass(
    'IDeviceAttributeRepository',
    DeviceAttributeDatabaseRepository,
    ['IDatabase'],
  );
  container.bindClass(
    'IDeviceFirmwareRepository',
    DeviceFirmwareFileRepository,
    ['FIRMWARE_DIRECTORY'],
  );
  container.bindClass('IDeviceKeyRepository', DeviceKeyDatabaseRepository, [
    'IDatabase',
  ]);
  container.bindClass(
    'IOrganizationRepository',
    OrganizationDatabaseRepository,
    ['IDatabase'],
  );
  container.bindClass('IProductRepository', ProductDatabaseRepository, [
    'IDatabase',
  ]);
  container.bindClass(
    'IProductConfigRepository',
    ProductConfigDatabaseRepository,
    ['IDatabase'],
  );
  container.bindClass(
    'IProductDeviceRepository',
    ProductDeviceDatabaseRepository,
    ['IDatabase'],
  );
  container.bindClass(
    'IProductFirmwareRepository',
    ProductFirmwareDatabaseRepository,
    ['IDatabase'],
  );

  container.bindClass('IUserRepository', UserDatabaseRepository, ['IDatabase']);
  container.bindClass('IWebhookRepository', WebhookDatabaseRepository, [
    'IDatabase',
  ]);
};
