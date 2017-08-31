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

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _collectionNames = require('./collectionNames');

var _collectionNames2 = _interopRequireDefault(_collectionNames);

var _BaseRepository2 = require('./BaseRepository');

var _BaseRepository3 = _interopRequireDefault(_BaseRepository2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var formatProductFirmwareFromDb = function formatProductFirmwareFromDb(productFirmware) {
  return (0, _extends3.default)({}, productFirmware, {
    // todo right now its hack for getting right buffer from different dbs
    data: productFirmware.data.buffer ? productFirmware.data.buffer // for mongo
    : Buffer.from((0, _values2.default)(productFirmware.data)) // for nedb,
  });
};

var ProductFirmwareDatabaseRepository = function (_BaseRepository) {
  (0, _inherits3.default)(ProductFirmwareDatabaseRepository, _BaseRepository);

  function ProductFirmwareDatabaseRepository(database) {
    var _this2 = this;

    (0, _classCallCheck3.default)(this, ProductFirmwareDatabaseRepository);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ProductFirmwareDatabaseRepository.__proto__ || (0, _getPrototypeOf2.default)(ProductFirmwareDatabaseRepository)).call(this, database, _collectionNames2.default.PRODUCT_FIRMWARE));

    _this._collectionName = _collectionNames2.default.PRODUCT_FIRMWARE;

    _this.create = function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(model) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this._database.insertOne(_this._collectionName, (0, _extends3.default)({}, model, {
                  updated_at: new Date()
                }));

              case 2:
                return _context.abrupt('return', _context.sent);

              case 3:
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
                _context2.next = 2;
                return _this._database.remove(_this._collectionName, { _id: id });

              case 2:
                return _context2.abrupt('return', _context2.sent);

              case 3:
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
                _context3.next = 3;
                return _this._database.find(_this._collectionName, query);

              case 3:
                _context3.t0 = formatProductFirmwareFromDb;
                return _context3.abrupt('return', _context3.sent.map(_context3.t0));

              case 5:
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

    _this.getAllByProductID = function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(productID) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _this._database.find(_this._collectionName, {
                  product_id: productID
                });

              case 2:
                _context4.t0 = formatProductFirmwareFromDb;
                return _context4.abrupt('return', _context4.sent.map(_context4.t0));

              case 4:
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

    _this.getByVersionForProduct = function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(productID, version) {
        var productFirmware;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return _this._database.findOne(_this._collectionName, {
                  product_id: productID,
                  version: version
                });

              case 2:
                productFirmware = _context5.sent;
                return _context5.abrupt('return', productFirmware ? formatProductFirmwareFromDb(productFirmware) : null);

              case 4:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, _this2);
      }));

      return function (_x5, _x6) {
        return _ref5.apply(this, arguments);
      };
    }();

    _this.getCurrentForProduct = function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(productID) {
        var productFirmware;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return _this._database.findOne(_this._collectionName, {
                  current: true,
                  product_id: productID
                });

              case 2:
                productFirmware = _context6.sent;
                return _context6.abrupt('return', productFirmware ? formatProductFirmwareFromDb(productFirmware) : null);

              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, _this2);
      }));

      return function (_x7) {
        return _ref6.apply(this, arguments);
      };
    }();

    _this.getByID = function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(id) {
        var productFirmware;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return _this._database.findOne(_this._collectionName, {
                  _id: id
                });

              case 2:
                productFirmware = _context7.sent;
                return _context7.abrupt('return', productFirmware ? formatProductFirmwareFromDb(productFirmware) : null);

              case 4:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, _this2);
      }));

      return function (_x8) {
        return _ref7.apply(this, arguments);
      };
    }();

    _this.updateByID = function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(productFirmwareID, productFirmware) {
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return _this._database.findAndModify(_this._collectionName, { _id: productFirmwareID }, {
                  $set: (0, _extends3.default)({}, productFirmware, {
                    updated_at: new Date()
                  })
                }).then(formatProductFirmwareFromDb);

              case 2:
                return _context8.abrupt('return', _context8.sent);

              case 3:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, _this2);
      }));

      return function (_x9, _x10) {
        return _ref8.apply(this, arguments);
      };
    }();

    _this._database = database;
    return _this;
  }

  return ProductFirmwareDatabaseRepository;
}(_BaseRepository3.default);

exports.default = ProductFirmwareDatabaseRepository;