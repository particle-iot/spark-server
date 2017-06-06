'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var deepToObjectIdCast = function deepToObjectIdCast(node) {
  (0, _keys2.default)(node).forEach(function (key) {
    if (node[key] === Object(node[key])) {
      deepToObjectIdCast(node[key]);
    }
    if (key === '_id') {
      // eslint-disable-next-line
      node[key] = new _mongodb.ObjectId(node[key]);
    }
  });
  return node;
};

var BaseMongoDb = function BaseMongoDb() {
  var _this = this;

  (0, _classCallCheck3.default)(this, BaseMongoDb);

  this.insertOne = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(collectionName, entity) {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this.__runForCollection(collectionName, function () {
                var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(collection) {
                  var insertResult;
                  return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.next = 2;
                          return collection.insertOne(entity);

                        case 2:
                          insertResult = _context.sent;
                          return _context.abrupt('return', _this.__translateResultItem(insertResult.ops[0]));

                        case 4:
                        case 'end':
                          return _context.stop();
                      }
                    }
                  }, _callee, _this);
                }));

                return function (_x3) {
                  return _ref2.apply(this, arguments);
                };
              }());

            case 2:
              return _context2.abrupt('return', _context2.sent);

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  this.find = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(collectionName, query) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _this.__runForCollection(collectionName, function () {
                var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(collection) {
                  var resultItems;
                  return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          _context3.next = 2;
                          return collection.find.apply(collection, [_this.__translateQuery(query)].concat(args)).toArray();

                        case 2:
                          resultItems = _context3.sent;
                          return _context3.abrupt('return', resultItems.map(_this.__translateResultItem));

                        case 4:
                        case 'end':
                          return _context3.stop();
                      }
                    }
                  }, _callee3, _this);
                }));

                return function (_x6) {
                  return _ref4.apply(this, arguments);
                };
              }());

            case 2:
              return _context4.abrupt('return', _context4.sent);

            case 3:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x4, _x5) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.findAndModify = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(collectionName, query, sort, updateQuery) {
      for (var _len2 = arguments.length, args = Array(_len2 > 4 ? _len2 - 4 : 0), _key2 = 4; _key2 < _len2; _key2++) {
        args[_key2 - 4] = arguments[_key2];
      }

      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _this.__runForCollection(collectionName, function () {
                var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(collection) {
                  var modifyResult;
                  return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
                        case 0:
                          _context5.next = 2;
                          return collection.findAndModify.apply(collection, [_this.__translateQuery(query), sort, _this.__translateQuery(updateQuery)].concat(args));

                        case 2:
                          modifyResult = _context5.sent;
                          return _context5.abrupt('return', _this.__translateResultItem(modifyResult.value));

                        case 4:
                        case 'end':
                          return _context5.stop();
                      }
                    }
                  }, _callee5, _this);
                }));

                return function (_x11) {
                  return _ref6.apply(this, arguments);
                };
              }());

            case 2:
              return _context6.abrupt('return', _context6.sent);

            case 3:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this);
    }));

    return function (_x7, _x8, _x9, _x10) {
      return _ref5.apply(this, arguments);
    };
  }();

  this.findOne = function () {
    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(collectionName, query) {
      for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _this.__runForCollection(collectionName, function () {
                var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(collection) {
                  var resultItem;
                  return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                      switch (_context7.prev = _context7.next) {
                        case 0:
                          _context7.next = 2;
                          return collection.findOne.apply(collection, [_this.__translateQuery(query)].concat(args));

                        case 2:
                          resultItem = _context7.sent;
                          return _context7.abrupt('return', _this.__translateResultItem(resultItem));

                        case 4:
                        case 'end':
                          return _context7.stop();
                      }
                    }
                  }, _callee7, _this);
                }));

                return function (_x14) {
                  return _ref8.apply(this, arguments);
                };
              }());

            case 2:
              return _context8.abrupt('return', _context8.sent);

            case 3:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this);
    }));

    return function (_x12, _x13) {
      return _ref7.apply(this, arguments);
    };
  }();

  this.remove = function () {
    var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(collectionName, id) {
      return _regenerator2.default.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return _this.__runForCollection(collectionName, function () {
                var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(collection) {
                  return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                      switch (_context9.prev = _context9.next) {
                        case 0:
                          _context9.next = 2;
                          return collection.remove(_this.__translateQuery({ _id: id }));

                        case 2:
                          return _context9.abrupt('return', _context9.sent);

                        case 3:
                        case 'end':
                          return _context9.stop();
                      }
                    }
                  }, _callee9, _this);
                }));

                return function (_x17) {
                  return _ref10.apply(this, arguments);
                };
              }());

            case 2:
              return _context10.abrupt('return', _context10.sent);

            case 3:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, _this);
    }));

    return function (_x15, _x16) {
      return _ref9.apply(this, arguments);
    };
  }();

  this.__filterID = function (_ref11) {
    var id = _ref11.id,
        otherProps = (0, _objectWithoutProperties3.default)(_ref11, ['id']);
    return (0, _extends3.default)({}, otherProps);
  };

  this.__runForCollection = function () {
    var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(collectionName, callback) {
      return _regenerator2.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              throw new Error('Not implemented ' + callback.toString());

            case 1:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this);
    }));

    return function (_x18, _x19) {
      return _ref12.apply(this, arguments);
    };
  }();

  this.__translateQuery = function (query) {
    return _this.__filterID(deepToObjectIdCast(query));
  };

  this.__translateResultItem = function (item) {
    if (!item) {
      return null;
    }
    var _id = item._id,
        otherProps = (0, _objectWithoutProperties3.default)(item, ['_id']);

    return (0, _extends3.default)({}, otherProps, { id: _id.toString() });
  };
}

// eslint-disable-next-line no-unused-vars
;

exports.default = BaseMongoDb;