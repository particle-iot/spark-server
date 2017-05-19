'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _tingodb = require('tingodb');

var _tingodb2 = _interopRequireDefault(_tingodb);

var _promisify = require('../lib/promisify');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TingoDb = function TingoDb(path, options) {
  var _this = this;

  (0, _classCallCheck3.default)(this, TingoDb);

  this.getCollection = function (collectionName) {
    return (0, _promisify.promisifyByPrototype)(_this._database.collection(collectionName));
  };

  var Db = (0, _tingodb2.default)(options).Db;

  if (!_fs2.default.existsSync(path)) {
    _mkdirp2.default.sync(path);
  }

  this._database = new Db(path, {});
};

exports.default = TingoDb;