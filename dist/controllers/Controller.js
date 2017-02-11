

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = undefined;

const _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

const _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Controller = function Controller() {
  (0, _classCallCheck3.default)(this, Controller);

  this.bad = function (message) {
    const status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 400;
    return {
      data: {
        error: message,
        ok: false,
      },
      status,
    };
  };

  this.ok = function (output) {
    return {
      data: output,
      status: 200,
    };
  };
};

exports.default = Controller;
