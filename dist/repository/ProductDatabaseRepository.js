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

var ProductDatabaseRepository = function (_BaseRepository) {
  (0, _inherits3.default)(ProductDatabaseRepository, _BaseRepository);

  function ProductDatabaseRepository(database) {
    var _this2 = this;

    (0, _classCallCheck3.default)(this, ProductDatabaseRepository);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ProductDatabaseRepository.__proto__ || (0, _getPrototypeOf2.default)(ProductDatabaseRepository)).call(this, database, _collectionNames2.default.PRODUCTS));

    _this._collectionName = _collectionNames2.default.PRODUCTS;

    _this.create = function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(model) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.t0 = _this._database;
                _context.t1 = _this._collectionName;
                _context.t2 = _extends3.default;
                _context.t3 = {};
                _context.next = 6;
                return _this._formatProduct(model);

              case 6:
                _context.t4 = _context.sent;
                _context.t5 = new Date();
                _context.next = 10;
                return _this._database.count(_this._collectionName);

              case 10:
                _context.t6 = _context.sent;
                _context.t7 = _context.t6 + 1;
                _context.t8 = {
                  created_at: _context.t5,
                  product_id: _context.t7
                };
                _context.t9 = (0, _context.t2)(_context.t3, _context.t4, _context.t8);
                _context.next = 16;
                return _context.t0.insertOne.call(_context.t0, _context.t1, _context.t9);

              case 16:
                return _context.abrupt('return', _context.sent);

              case 17:
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
                return _context3.abrupt('return', _context3.sent);

              case 4:
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

    _this.getByID = function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(id) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _this._database.findOne(_this._collectionName, { _id: id });

              case 2:
                return _context4.abrupt('return', _context4.sent);

              case 3:
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

    _this.getByIDOrSlug = function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(productIDOrSlug) {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return _this._database.findOne(_this._collectionName, {
                  $or: [{
                    product_id: !isNaN(productIDOrSlug) ? parseInt(productIDOrSlug, 10) : null
                  }, { slug: productIDOrSlug }]
                });

              case 2:
                return _context5.abrupt('return', _context5.sent);

              case 3:
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

    _this.updateByID = function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(id, product) {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.t0 = _this._database;
                _context6.t1 = _this._collectionName;
                _context6.t2 = { _id: id };
                _context6.t3 = _extends3.default;
                _context6.t4 = {};
                _context6.next = 7;
                return _this._formatProduct(product);

              case 7:
                _context6.t5 = _context6.sent;
                _context6.t6 = (0, _context6.t3)(_context6.t4, _context6.t5);
                _context6.t7 = {
                  $set: _context6.t6
                };
                _context6.next = 12;
                return _context6.t0.findAndModify.call(_context6.t0, _context6.t1, _context6.t2, _context6.t7);

              case 12:
                return _context6.abrupt('return', _context6.sent);

              case 13:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, _this2);
      }));

      return function (_x6, _x7) {
        return _ref6.apply(this, arguments);
      };
    }();

    _this._formatProduct = function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(product) {
        var slug, existingProduct;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                slug = (product.name.trim() + ' ' + product.hardware_version.trim()).toLowerCase().replace(/\s+/g, '-') // Replace spaces with -
                .replace(/[^\w-]+/g, '') // Remove all non-word chars
                .replace(/--+/g, '-') // Replace multiple - with single -
                .replace(/^-+/, '') // Trim - from start of text
                .replace(/-+$/, ''); // Trim - from end of text

                _context7.next = 3;
                return _this._database.findOne(_this._collectionName, {
                  slug: slug
                });

              case 3:
                existingProduct = _context7.sent;

                if (!(existingProduct && existingProduct.product_id !== product.product_id)) {
                  _context7.next = 6;
                  break;
                }

                throw new Error('Product name or version already in use');

              case 6:
                return _context7.abrupt('return', (0, _extends3.default)({}, product, {
                  slug: slug
                }));

              case 7:
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

    _this._database = database;
    return _this;
  }

  return ProductDatabaseRepository;
}(_BaseRepository3.default);

exports.default = ProductDatabaseRepository;