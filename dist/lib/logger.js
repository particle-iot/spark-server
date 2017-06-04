'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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

function _transform() {
  for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
    params[_key] = arguments[_key];
  }

  return params.map(_stringify2.default);
}

var Logger = function () {
  function Logger() {
    (0, _classCallCheck3.default)(this, Logger);
  }

  (0, _createClass3.default)(Logger, null, [{
    key: 'log',
    value: function log() {
      if (_settings2.default.SHOW_VERBOSE_DEVICE_LOGS) {
        console.log(_transform.apply(undefined, arguments));
      }
    }
  }, {
    key: 'info',
    value: function info() {
      console.log(_chalk2.default.cyan(_transform.apply(undefined, arguments)));
    }
  }, {
    key: 'warn',
    value: function warn() {
      console.warn(_chalk2.default.yellow(_transform.apply(undefined, arguments)));
    }
  }, {
    key: 'error',
    value: function error() {
      console.error(_chalk2.default.red(_transform.apply(undefined, arguments)));
    }
  }]);
  return Logger;
}();

exports.default = Logger;