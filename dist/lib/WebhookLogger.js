'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _types = require('../types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebhookLogger = function () {
  function WebhookLogger() {
    (0, _classCallCheck3.default)(this, WebhookLogger);
  }

  (0, _createClass3.default)(WebhookLogger, [{
    key: 'log',
    value: function log() {
      var _console;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this._lastLog = args;
      (_console = console).log.apply(_console, args);
    }
  }]);
  return WebhookLogger;
}();

exports.default = WebhookLogger;