'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promisifyByPrototype = exports.promisify = undefined;

var _getOwnPropertyNames = require('babel-runtime/core-js/object/get-own-property-names');

var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _promise = require('babel-runtime/core-js/promise');

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

var promisifyByPrototype = exports.promisifyByPrototype = function promisifyByPrototype(object) {
  var prototype = (0, _getPrototypeOf2.default)(object);

  var fnNames = (0, _getOwnPropertyNames2.default)(prototype).filter(function (propName) {
    return typeof prototype[propName] === 'function';
  });

  var resultObject = {};

  fnNames.forEach(function (fnName) {
    resultObject[fnName] = function () {
      var _object$fnName;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return promisify((_object$fnName = object[fnName]).bind.apply(_object$fnName, [object].concat(args)));
    };
  });

  return resultObject;
};