'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _BaseMongoRepository2 = require('./BaseMongoRepository');

var _BaseMongoRepository3 = _interopRequireDefault(_BaseMongoRepository2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MongoDb = function (_BaseMongoRepository) {
  (0, _inherits3.default)(MongoDb, _BaseMongoRepository);

  function MongoDb(database) {
    var _this2 = this;

    (0, _classCallCheck3.default)(this, MongoDb);

    var _this = (0, _possibleConstructorReturn3.default)(this, (MongoDb.__proto__ || (0, _getPrototypeOf2.default)(MongoDb)).call(this));

    _this.__runForCollection = function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(collectionName, callback) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', callback(_this._database.collection(collectionName)));

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }();

    _this._database = database;
    return _this;
  }

  return MongoDb;
}(_BaseMongoRepository3.default);

exports.default = MongoDb;