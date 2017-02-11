'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HttpError = function (_Error) {
  (0, _inherits3.default)(HttpError, _Error);

  function HttpError(error) {
    var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 400;
    (0, _classCallCheck3.default)(this, HttpError);

    var _this = (0, _possibleConstructorReturn3.default)(this, (HttpError.__proto__ || (0, _getPrototypeOf2.default)(HttpError)).call(this, error.message || error));

    if (typeof error.status === 'number') {
      _this.status = error.status;
    } else {
      _this.status = status;
    }
    return _this;
  }

  return HttpError;
}(Error);

exports.default = HttpError;