'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HASH_DIGEST = 'sha256'; /**
                            *    Copyright (C) 2013-2014 Spark Labs, Inc. All rights reserved. -  https://www.spark.io/
                            *
                            *    This program is free software: you can redistribute it and/or modify
                            *    it under the terms of the GNU Affero General Public License, version 3,
                            *    as published by the Free Software Foundation.
                            *
                            *    This program is distributed in the hope that it will be useful,
                            *    but WITHOUT ANY WARRANTY; without even the implied warranty of
                            *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                            *    GNU Affero General Public License for more details.
                            *
                            *    You should have received a copy of the GNU Affero General Public License
                            *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
                            *
                            *    You can download the source here: https://github.com/spark/spark-server
                            *
                            * 
                            *
                            */

var HASH_ITERATIONS = 30000;
var KEY_LENGTH = 64;

var PasswordHasher = function () {
  function PasswordHasher() {
    (0, _classCallCheck3.default)(this, PasswordHasher);
  }

  (0, _createClass3.default)(PasswordHasher, null, [{
    key: 'generateSalt',
    value: function generateSalt() {
      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 64;

      return new _promise2.default(function (resolve, reject) {
        _crypto2.default.randomBytes(size, function (error, buffer) {
          if (error) {
            reject(error);
            return;
          }
          resolve(buffer.toString('base64'));
        });
      });
    }
  }, {
    key: 'hash',
    value: function hash(password, salt) {
      return new _promise2.default(function (resolve, reject) {
        _crypto2.default.pbkdf2(password, salt, HASH_ITERATIONS, KEY_LENGTH, HASH_DIGEST, function (error, key) {
          if (error) {
            reject(error);
            return;
          }
          resolve(key.toString('base64'));
        });
      });
    }
  }]);
  return PasswordHasher;
}();

exports.default = PasswordHasher;