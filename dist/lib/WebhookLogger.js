'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = _logger2.default.createModuleLogger(module);

var WebhookLogger = function () {
  function WebhookLogger() {
    (0, _classCallCheck3.default)(this, WebhookLogger);
  }

  (0, _createClass3.default)(WebhookLogger, [{
    key: 'log',
    value: function log() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this._lastLog = args;
      logger.info([].concat(args), 'webhook');
    }
  }]);
  return WebhookLogger;
}();

exports.default = WebhookLogger;