'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _expressOauthServer = require('express-oauth-server');

var _expressOauthServer2 = _interopRequireDefault(_expressOauthServer);

var _OAuthModel = require('./OAuthModel');

var _OAuthModel2 = _interopRequireDefault(_OAuthModel);

var _sparkProtocol = require('spark-protocol');

var _DeviceClaimsController = require('./controllers/DeviceClaimsController');

var _DeviceClaimsController2 = _interopRequireDefault(_DeviceClaimsController);

var _DevicesController = require('./controllers/DevicesController');

var _DevicesController2 = _interopRequireDefault(_DevicesController);

var _EventsController = require('./controllers/EventsController');

var _EventsController2 = _interopRequireDefault(_EventsController);

var _OauthClientsController = require('./controllers/OauthClientsController');

var _OauthClientsController2 = _interopRequireDefault(_OauthClientsController);

var _ProductsController = require('./controllers/ProductsController');

var _ProductsController2 = _interopRequireDefault(_ProductsController);

var _ProvisioningController = require('./controllers/ProvisioningController');

var _ProvisioningController2 = _interopRequireDefault(_ProvisioningController);

var _UsersController = require('./controllers/UsersController');

var _UsersController2 = _interopRequireDefault(_UsersController);

var _WebhooksController = require('./controllers/WebhooksController');

var _WebhooksController2 = _interopRequireDefault(_WebhooksController);

var _WebhookLogger = require('./lib/WebhookLogger');

var _WebhookLogger2 = _interopRequireDefault(_WebhookLogger);

var _DeviceManager = require('./managers/DeviceManager');

var _DeviceManager2 = _interopRequireDefault(_DeviceManager);

var _WebhookManager = require('./managers/WebhookManager');

var _WebhookManager2 = _interopRequireDefault(_WebhookManager);

var _EventManager = require('./managers/EventManager');

var _EventManager2 = _interopRequireDefault(_EventManager);

var _PermissionManager = require('./managers/PermissionManager');

var _PermissionManager2 = _interopRequireDefault(_PermissionManager);

var _DeviceFirmwareFileRepository = require('./repository/DeviceFirmwareFileRepository');

var _DeviceFirmwareFileRepository2 = _interopRequireDefault(_DeviceFirmwareFileRepository);

var _NeDb = require('./repository/NeDb');

var _NeDb2 = _interopRequireDefault(_NeDb);

var _DeviceAttributeDatabaseRepository = require('./repository/DeviceAttributeDatabaseRepository');

var _DeviceAttributeDatabaseRepository2 = _interopRequireDefault(_DeviceAttributeDatabaseRepository);

var _DeviceKeyDatabaseRepository = require('./repository/DeviceKeyDatabaseRepository');

var _DeviceKeyDatabaseRepository2 = _interopRequireDefault(_DeviceKeyDatabaseRepository);

var _OrganizationDatabaseRepository = require('./repository/OrganizationDatabaseRepository');

var _OrganizationDatabaseRepository2 = _interopRequireDefault(_OrganizationDatabaseRepository);

var _ProductDatabaseRepository = require('./repository/ProductDatabaseRepository');

var _ProductDatabaseRepository2 = _interopRequireDefault(_ProductDatabaseRepository);

var _ProductConfigDatabaseRepository = require('./repository/ProductConfigDatabaseRepository');

var _ProductConfigDatabaseRepository2 = _interopRequireDefault(_ProductConfigDatabaseRepository);

var _ProductDeviceDatabaseRepository = require('./repository/ProductDeviceDatabaseRepository');

var _ProductDeviceDatabaseRepository2 = _interopRequireDefault(_ProductDeviceDatabaseRepository);

var _ProductFirmwareDatabaseRepository = require('./repository/ProductFirmwareDatabaseRepository');

var _ProductFirmwareDatabaseRepository2 = _interopRequireDefault(_ProductFirmwareDatabaseRepository);

var _UserDatabaseRepository = require('./repository/UserDatabaseRepository');

var _UserDatabaseRepository2 = _interopRequireDefault(_UserDatabaseRepository);

var _WebhookDatabaseRepository = require('./repository/WebhookDatabaseRepository');

var _WebhookDatabaseRepository2 = _interopRequireDefault(_WebhookDatabaseRepository);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (container, newSettings) {
  // Make sure that the spark-server settings match whatever is passed in
  (0, _keys2.default)(newSettings).forEach(function (key) {
    _settings2.default[key] = newSettings[key];
  });

  // spark protocol container bindings
  (0, _sparkProtocol.defaultBindings)(container, newSettings);

  // settings
  container.bindValue('DATABASE_PATH', _settings2.default.DB_CONFIG.PATH);
  container.bindValue('DEVICE_DIRECTORY', _settings2.default.DEVICE_DIRECTORY);
  container.bindValue('FIRMWARE_DIRECTORY', _settings2.default.FIRMWARE_DIRECTORY);
  container.bindValue('SERVER_KEY_FILENAME', _settings2.default.SERVER_KEY_FILENAME);
  container.bindValue('SERVER_KEYS_DIRECTORY', _settings2.default.SERVER_KEYS_DIRECTORY);
  container.bindValue('USERS_DIRECTORY', _settings2.default.USERS_DIRECTORY);
  container.bindValue('WEBHOOKS_DIRECTORY', _settings2.default.WEBHOOKS_DIRECTORY);
  container.bindMethod('OAUTH_SETTINGS', function (oauthModel) {
    return {
      accessTokenLifetime: _settings2.default.ACCESS_TOKEN_LIFETIME,
      allowBearerTokensInQueryString: true,
      model: oauthModel
    };
  }, ['OAuthModel']);

  container.bindClass('OAuthModel', _OAuthModel2.default, ['IUserRepository']);

  container.bindClass('OAuthServer', _expressOauthServer2.default, ['OAUTH_SETTINGS']);

  container.bindClass('IDatabase', _NeDb2.default, ['DATABASE_PATH']);

  // lib
  container.bindClass('WebhookLogger', _WebhookLogger2.default, []);

  // controllers
  container.bindClass('DeviceClaimsController', _DeviceClaimsController2.default, ['DeviceManager', 'ClaimCodeManager']);
  container.bindClass('DevicesController', _DevicesController2.default, ['DeviceManager']);
  container.bindClass('EventsController', _EventsController2.default, ['EventManager']);
  container.bindClass('PermissionManager', _PermissionManager2.default, ['IDeviceAttributeRepository', 'IOrganizationRepository', 'IUserRepository', 'IWebhookRepository', 'OAuthServer']);
  container.bindClass('OauthClientsController', _OauthClientsController2.default, []);
  container.bindClass('ProductsController', _ProductsController2.default, ['DeviceManager', 'IDeviceAttributeRepository', 'IOrganizationRepository', 'IProductRepository', 'IProductConfigRepository', 'IProductDeviceRepository', 'IProductFirmwareRepository']);
  container.bindClass('ProvisioningController', _ProvisioningController2.default, ['DeviceManager']);
  container.bindClass('UsersController', _UsersController2.default, ['IUserRepository']);
  container.bindClass('WebhooksController', _WebhooksController2.default, ['WebhookManager']);

  // managers
  container.bindClass('DeviceManager', _DeviceManager2.default, ['IDeviceAttributeRepository', 'IDeviceFirmwareRepository', 'IDeviceKeyRepository', 'PermissionManager', 'EventPublisher']);
  container.bindClass('EventManager', _EventManager2.default, ['EventPublisher']);
  container.bindClass('WebhookManager', _WebhookManager2.default, ['EventPublisher', 'PermissionManager', 'WebhookLogger', 'IWebhookRepository']);

  // Repositories
  container.bindClass('IDeviceAttributeRepository', _DeviceAttributeDatabaseRepository2.default, ['IDatabase']);
  container.bindClass('IDeviceFirmwareRepository', _DeviceFirmwareFileRepository2.default, ['FIRMWARE_DIRECTORY']);
  container.bindClass('IDeviceKeyRepository', _DeviceKeyDatabaseRepository2.default, ['IDatabase']);
  container.bindClass('IOrganizationRepository', _OrganizationDatabaseRepository2.default, ['IDatabase']);
  container.bindClass('IProductRepository', _ProductDatabaseRepository2.default, ['IDatabase']);
  container.bindClass('IProductConfigRepository', _ProductConfigDatabaseRepository2.default, ['IDatabase']);
  container.bindClass('IProductDeviceRepository', _ProductDeviceDatabaseRepository2.default, ['IDatabase']);
  container.bindClass('IProductFirmwareRepository', _ProductFirmwareDatabaseRepository2.default, ['IDatabase']);

  container.bindClass('IUserRepository', _UserDatabaseRepository2.default, ['IDatabase']);
  container.bindClass('IWebhookRepository', _WebhookDatabaseRepository2.default, ['IDatabase']);
};