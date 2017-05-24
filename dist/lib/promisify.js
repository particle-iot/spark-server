"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promisify = undefined;

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var promisify = exports.promisify = function promisify(object, fnName) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return new _promise2.default(function (resolve, reject) {
    return object[fnName].apply(object, args.concat([function (error, result) {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    }]));
  });
};