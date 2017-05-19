'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

var _DeviceManager = require('./managers/DeviceManager');

var _DeviceManager2 = _interopRequireDefault(_DeviceManager);

var _WebhookManager = require('./managers/WebhookManager');

var _WebhookManager2 = _interopRequireDefault(_WebhookManager);

var _EventManager = require('./managers/EventManager');

var _EventManager2 = _interopRequireDefault(_EventManager);

var _DeviceFirmwareFileRepository = require('./repository/DeviceFirmwareFileRepository');

var _DeviceFirmwareFileRepository2 = _interopRequireDefault(_DeviceFirmwareFileRepository);

var _TingoDb = require('./repository/TingoDb');

var _TingoDb2 = _interopRequireDefault(_TingoDb);

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
  container.bindValue('DATABASE_OPTIONS', _settings2.default.DB_CONFIG.OPTIONS);
  container.bindValue('DEVICE_DIRECTORY', _settings2.default.DEVICE_DIRECTORY);
  container.bindValue('FIRMWARE_DIRECTORY', _settings2.default.FIRMWARE_DIRECTORY);
  container.bindValue('SERVER_KEY_FILENAME', _settings2.default.SERVER_KEY_FILENAME);
  container.bindValue('SERVER_KEYS_DIRECTORY', _settings2.default.SERVER_KEYS_DIRECTORY);
  container.bindValue('USERS_DIRECTORY', _settings2.default.USERS_DIRECTORY);
  container.bindValue('WEBHOOKS_DIRECTORY', _settings2.default.WEBHOOKS_DIRECTORY);

  container.bindClass('Database', _TingoDb2.default, ['DATABASE_PATH', 'DATABASE_OPTIONS']);

  // controllers
  container.bindClass('DeviceClaimsController', _DeviceClaimsController2.default, ['DeviceManager', 'ClaimCodeManager']);
  container.bindClass('DevicesController', _DevicesController2.default, ['DeviceManager']);
  container.bindClass('EventsController', _EventsController2.default, ['EventManager']);
  container.bindClass('OauthClientsController', _OauthClientsController2.default, []);
  container.bindClass('ProductsController', _ProductsController2.default, []);
  container.bindClass('ProvisioningController', _ProvisioningController2.default, ['DeviceManager']);
  container.bindClass('UsersController', _UsersController2.default, ['UserRepository']);
  container.bindClass('WebhooksController', _WebhooksController2.default, ['WebhookManager']);

  // managers
  container.bindClass('DeviceManager', _DeviceManager2.default, ['DeviceAttributeRepository', 'DeviceFirmwareRepository', 'DeviceKeyRepository', 'DeviceServer']);
  container.bindClass('EventManager', _EventManager2.default, ['EventPublisher']);
  container.bindClass('WebhookManager', _WebhookManager2.default, ['WebhookRepository', 'EventPublisher']);

  // Repositories
  container.bindClass('DeviceFirmwareRepository', _DeviceFirmwareFileRepository2.default, ['FIRMWARE_DIRECTORY']);
  container.bindClass('UserRepository', _UserDatabaseRepository2.default, ['Database']);
  container.bindClass('WebhookRepository', _WebhookDatabaseRepository2.default, ['Database']);
};