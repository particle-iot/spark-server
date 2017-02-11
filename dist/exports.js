

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.settings = exports.logger = exports.defaultBindings = exports.createApp = undefined;

const _logger = require('./lib/logger');

const _logger2 = _interopRequireDefault(_logger);

const _app = require('./app');

const _app2 = _interopRequireDefault(_app);

const _defaultBindings = require('./defaultBindings');

const _defaultBindings2 = _interopRequireDefault(_defaultBindings);

const _settings = require('./settings');

const _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.createApp = _app2.default;
exports.defaultBindings = _defaultBindings2.default;
exports.logger = _logger2.default;
exports.settings = _settings2.default;
