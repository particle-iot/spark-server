

const _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

const _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

const _entries = require('babel-runtime/core-js/object/entries');

const _entries2 = _interopRequireDefault(_entries);

const _constitute = require('constitute');

const _os = require('os');

const _os2 = _interopRequireDefault(_os);

const _arrayFlatten = require('array-flatten');

const _arrayFlatten2 = _interopRequireDefault(_arrayFlatten);

const _logger = require('./lib/logger');

const _logger2 = _interopRequireDefault(_logger);

const _app = require('./app');

const _app2 = _interopRequireDefault(_app);

const _defaultBindings = require('./defaultBindings');

const _defaultBindings2 = _interopRequireDefault(_defaultBindings);

const _settings = require('./settings');

const _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NODE_PORT = process.env.NODE_PORT || 8080;

process.on('uncaughtException', (exception) => {
  _logger2.default.error('uncaughtException', { message: exception.message, stack: exception.stack }); // logging with MetaData
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
const container = new _constitute.Container();
(0, _defaultBindings2.default)(container);

const deviceServer = container.constitute('DeviceServer');
deviceServer.start();

const app = (0, _app2.default)(container, _settings2.default);

app.listen(NODE_PORT, () => console.log(`express server started on port ${NODE_PORT}`));

const addresses = (0, _arrayFlatten2.default)((0, _entries2.default)(_os2.default.networkInterfaces()).map(
// eslint-disable-next-line no-unused-vars
(_ref) => {
  let _ref2 = (0, _slicedToArray3.default)(_ref, 2),
    name = _ref2[0],
    nic = _ref2[1];

  return nic.filter(address => address.family === 'IPv4' && address.address !== '127.0.0.1').map(address => address.address);
}));
addresses.forEach(address => console.log(`Your device server IP address is: ${address}`));
