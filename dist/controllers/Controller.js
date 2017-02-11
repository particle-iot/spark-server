'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Controller = function Controller() {
  (0, _classCallCheck3.default)(this, Controller);

  this.bad = function (message) {
    var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 400;
    return {
      data: {
        error: message,
        ok: false
      },
      status: status
    };
  };

  this.ok = function (output) {
    return {
      data: output,
      status: 200
    };
  };
};

exports.default = Controller;