"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promisify = undefined;

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var promisify = exports.promisify = function promisify(object, fnName) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return new _promise2.default(function (resolve, reject) {
    return object[fnName].apply(object, args.concat([function (error) {
      for (var _len2 = arguments.length, callbackArgs = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        callbackArgs[_key2 - 1] = arguments[_key2];
      }

      if (error) {
        reject(error);
        return null;
      }

      return callbackArgs.length <= 1 ? resolve.apply(undefined, (0, _toConsumableArray3.default)(callbackArgs)) : resolve(callbackArgs);
    }]));
  });
};