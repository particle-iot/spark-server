'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _arrayFlatten = require('array-flatten');

var _arrayFlatten2 = _interopRequireDefault(_arrayFlatten);

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _defaultBindings = require('./defaultBindings');

var _defaultBindings2 = _interopRequireDefault(_defaultBindings);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _constitute = require('constitute');

var _logger = require('./lib/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = _logger2.default.createModuleLogger(module);

var NODE_PORT = process.env.NODE_PORT || _settings2.default.EXPRESS_SERVER_CONFIG.PORT;

process.on('uncaughtException', function (exception) {
  logger.error({ err: exception }, 'uncaughtException');
  process.exit(1); // exit with failure
});

/* This is the container used app-wide for dependency injection. If you want to
 * override any of the implementations, create your module with the new
 * implementation and use:
 *
 * container.bindAlias(DefaultImplementation, MyNewImplementation);
 *
 * You can also set a new value
 * container.bindAlias(DefaultValue, 12345);
 *
 * See https://github.com/justmoon/constitute for more info
 */
var container = new _constitute.Container();
(0, _defaultBindings2.default)(container, _settings2.default);

var deviceServer = container.constitute('DeviceServer');
deviceServer.start();

var app = (0, _app2.default)(container, _settings2.default);

var onServerStartListen = function onServerStartListen() {
  logger.info({ port: NODE_PORT }, 'express server started, with events');
};

var _settings$EXPRESS_SER = _settings2.default.EXPRESS_SERVER_CONFIG,
    privateKeyFilePath = _settings$EXPRESS_SER.SSL_PRIVATE_KEY_FILEPATH,
    certificateFilePath = _settings$EXPRESS_SER.SSL_CERTIFICATE_FILEPATH,
    useSSL = _settings$EXPRESS_SER.USE_SSL,
    expressConfig = (0, _objectWithoutProperties3.default)(_settings$EXPRESS_SER, ['SSL_PRIVATE_KEY_FILEPATH', 'SSL_CERTIFICATE_FILEPATH', 'USE_SSL']);


if (useSSL) {
  logger.debug({ cert: certificateFilePath, key: privateKeyFilePath }, 'Use SSL');
  var options = (0, _extends3.default)({
    cert: certificateFilePath && _fs2.default.readFileSync((0, _nullthrows2.default)(certificateFilePath)),
    key: privateKeyFilePath && _fs2.default.readFileSync((0, _nullthrows2.default)(privateKeyFilePath))
  }, expressConfig);
  _https2.default.createServer(options, app).listen(NODE_PORT, onServerStartListen);
} else {
  _http2.default.createServer(app).listen(NODE_PORT, onServerStartListen);
}

var addresses = (0, _arrayFlatten2.default)((0, _entries2.default)(_os2.default.networkInterfaces()).map(
// eslint-disable-next-line no-unused-vars
function (_ref) {
  var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
      name = _ref2[0],
      nic = _ref2[1];

  return nic.filter(function (address) {
    return address.family === 'IPv4' && address.address !== '127.0.0.1';
  }).map(function (address) {
    return address.address;
  });
}));
addresses.forEach(function (address) {
  return logger.info({ address: address }, 'Server IP address found');
});