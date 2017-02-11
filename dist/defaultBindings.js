

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const _sparkProtocol = require('spark-protocol');

const _DeviceClaimsController = require('./controllers/DeviceClaimsController');

const _DeviceClaimsController2 = _interopRequireDefault(_DeviceClaimsController);

const _DevicesController = require('./controllers/DevicesController');

const _DevicesController2 = _interopRequireDefault(_DevicesController);

const _EventsController = require('./controllers/EventsController');

const _EventsController2 = _interopRequireDefault(_EventsController);

const _OauthClientsController = require('./controllers/OauthClientsController');

const _OauthClientsController2 = _interopRequireDefault(_OauthClientsController);

const _ProductsController = require('./controllers/ProductsController');

const _ProductsController2 = _interopRequireDefault(_ProductsController);

const _ProvisioningController = require('./controllers/ProvisioningController');

const _ProvisioningController2 = _interopRequireDefault(_ProvisioningController);

const _UsersController = require('./controllers/UsersController');

const _UsersController2 = _interopRequireDefault(_UsersController);

const _WebhooksController = require('./controllers/WebhooksController');

const _WebhooksController2 = _interopRequireDefault(_WebhooksController);

const _WebhookManager = require('./managers/WebhookManager');

const _WebhookManager2 = _interopRequireDefault(_WebhookManager);

const _EventManager = require('./managers/EventManager');

const _EventManager2 = _interopRequireDefault(_EventManager);

const _DeviceFirmwareFileRepository = require('./repository/DeviceFirmwareFileRepository');

const _DeviceFirmwareFileRepository2 = _interopRequireDefault(_DeviceFirmwareFileRepository);

const _DeviceManager = require('./managers/DeviceManager');

const _DeviceManager2 = _interopRequireDefault(_DeviceManager);

const _UserFileRepository = require('./repository/UserFileRepository');

const _UserFileRepository2 = _interopRequireDefault(_UserFileRepository);

const _WebhookFileRepository = require('./repository/WebhookFileRepository');

const _WebhookFileRepository2 = _interopRequireDefault(_WebhookFileRepository);

const _settings = require('./settings');

const _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (container) {
  // spark protocol container bindings
  (0, _sparkProtocol.defaultBindings)(container);

  // settings
  container.bindValue('DEVICE_DIRECTORY', _settings2.default.DEVICE_DIRECTORY);
  container.bindValue('FIRMWARE_DIRECTORY', _settings2.default.FIRMWARE_DIRECTORY);
  container.bindValue('SERVER_KEY_FILENAME', _settings2.default.SERVER_KEY_FILENAME);
  container.bindValue('SERVER_KEYS_DIRECTORY', _settings2.default.SERVER_KEYS_DIRECTORY);
  container.bindValue('USERS_DIRECTORY', _settings2.default.USERS_DIRECTORY);
  container.bindValue('WEBHOOKS_DIRECTORY', _settings2.default.WEBHOOKS_DIRECTORY);

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
  container.bindClass('UserRepository', _UserFileRepository2.default, ['USERS_DIRECTORY']);
  container.bindClass('WebhookRepository', _WebhookFileRepository2.default, ['WEBHOOKS_DIRECTORY']);
};
