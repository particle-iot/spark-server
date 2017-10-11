'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _collectionNames = require('./collectionNames');

var _collectionNames2 = _interopRequireDefault(_collectionNames);

var _BaseRepository2 = require('./BaseRepository');

var _BaseRepository3 = _interopRequireDefault(_BaseRepository2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ProductConfigDatabaseRepository = function (_BaseRepository) {
  (0, _inherits3.default)(ProductConfigDatabaseRepository, _BaseRepository);

  function ProductConfigDatabaseRepository(database) {
    var _this2 = this;

    (0, _classCallCheck3.default)(this, ProductConfigDatabaseRepository);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ProductConfigDatabaseRepository.__proto__ || (0, _getPrototypeOf2.default)(ProductConfigDatabaseRepository)).call(this, database, _collectionNames2.default.PRODUCT_CONFIGS));

    _this._collectionName = _collectionNames2.default.PRODUCT_CONFIGS;

    _this.create = function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(model) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', _this._database.insertOne(_this._collectionName, (0, _extends3.default)({}, model)));

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();

    _this.deleteByID = function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(id) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', _this._database.remove(_this._collectionName, { _id: id }));

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this2);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }();

    _this.getAll = function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var userID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var query;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // TODO - this should probably just query the organization
                query = userID ? { ownerID: userID } : {};
                return _context3.abrupt('return', _this._database.find(_this._collectionName, query));

              case 2:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2);
      }));

      return function () {
        return _ref3.apply(this, arguments);
      };
    }();

    _this.getByProductID = function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(productID) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt('return', _this._database.findOne(_this._collectionName, {
                  product_id: productID
                }));

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this2);
      }));

      return function (_x4) {
        return _ref4.apply(this, arguments);
      };
    }();

    _this.getByID = function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(id) {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt('return', _this._database.findOne(_this._collectionName, { _id: id }));

              case 1:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, _this2);
      }));

      return function (_x5) {
        return _ref5.apply(this, arguments);
      };
    }();

    _this.updateByID = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              throw new Error('The method is not implemented');

            case 1:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this2);
    }));

    _this._database = database;
    return _this;
  }

  return ProductConfigDatabaseRepository;
}(_BaseRepository3.default);

exports.default = ProductConfigDatabaseRepository;