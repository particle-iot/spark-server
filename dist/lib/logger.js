'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Logger = function () {
  function Logger() {
    (0, _classCallCheck3.default)(this, Logger);
  }

  (0, _createClass3.default)(Logger, null, [{
    key: 'log',
    value: function log() {
      // eslint-disable-next-line prefer-rest-params
      //console.log(...arguments);
    }
  }, {
    key: 'error',
    value: function error() {
      // eslint-disable-next-line prefer-rest-params
      console.error(_chalk2.default.red.apply(_chalk2.default, arguments));
    }
  }]);
  return Logger;
}(); /**
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

exports.default = Logger;