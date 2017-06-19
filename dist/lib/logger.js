'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _DefaultLogger = require('./DefaultLogger');

var _types = require('../types');

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

var Logger = function () {
  function Logger() {
    (0, _classCallCheck3.default)(this, Logger);
  }

  (0, _createClass3.default)(Logger, null, [{
    key: 'error',
    value: function error() {
      var _Logger$_logger;

      (_Logger$_logger = Logger._logger).error.apply(_Logger$_logger, arguments);
    }
  }, {
    key: 'info',
    value: function info() {
      var _Logger$_logger2;

      (_Logger$_logger2 = Logger._logger).info.apply(_Logger$_logger2, arguments);
    }
  }, {
    key: 'initialize',
    value: function initialize(logger) {
      Logger._logger = logger;
    }
  }, {
    key: 'log',
    value: function log() {
      var _Logger$_logger3;

      (_Logger$_logger3 = Logger._logger).log.apply(_Logger$_logger3, arguments);
    }
  }, {
    key: 'warn',
    value: function warn() {
      var _Logger$_logger4;

      (_Logger$_logger4 = Logger._logger).warn.apply(_Logger$_logger4, arguments);
    }
  }]);
  return Logger;
}();

Logger._logger = _DefaultLogger.DefaultLogger;
exports.default = Logger;