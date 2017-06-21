'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _BaseMongoDb2 = require('./BaseMongoDb');

var _BaseMongoDb3 = _interopRequireDefault(_BaseMongoDb2);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DB_READY_EVENT = 'dbReady';

var MongoDb = function (_BaseMongoDb) {
  (0, _inherits3.default)(MongoDb, _BaseMongoDb);

  function MongoDb(url) {
    var _this2 = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, MongoDb);

    var _this = (0, _possibleConstructorReturn3.default)(this, (MongoDb.__proto__ || (0, _getPrototypeOf2.default)(MongoDb)).call(this));

    _initialiseProps.call(_this);

    (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this._init(url, options);

            case 2:
              return _context.abrupt('return', _context.sent);

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this2);
    }))();
    return _this;
  }

  return MongoDb;
}(_BaseMongoDb3.default);

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this._database = null;
  this._statusEventEmitter = new _events2.default();

  this.insertOne = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(collectionName, entity) {
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(collection) {
                  var insertResult;
                  return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return collection.insertOne(entity);

                        case 2:
                          insertResult = _context2.sent;
                          return _context2.abrupt('return', _this3.__translateResultItem(insertResult.ops[0]));

                        case 4:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, _this3);
                }));

                return function (_x4) {
                  return _ref3.apply(this, arguments);
                };
              }());

            case 2:
              return _context3.abrupt('return', _context3.sent);

            case 3:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this3);
    }));

    return function (_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.find = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(collectionName, query) {
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(collection) {
                  var resultItems;
                  return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          _context4.next = 2;
                          return collection.find(_this3.__translateQuery(query), { timeout: false }).toArray();

                        case 2:
                          resultItems = _context4.sent;
                          return _context4.abrupt('return', resultItems.map(_this3.__translateResultItem));

                        case 4:
                        case 'end':
                          return _context4.stop();
                      }
                    }
                  }, _callee4, _this3);
                }));

                return function (_x7) {
                  return _ref5.apply(this, arguments);
                };
              }());

            case 2:
              return _context5.abrupt('return', _context5.sent);

            case 3:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this3);
    }));

    return function (_x5, _x6) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.findAndModify = function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(collectionName, query, updateQuery) {
      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(collection) {
                  var modifyResult;
                  return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                      switch (_context6.prev = _context6.next) {
                        case 0:
                          _context6.next = 2;
                          return collection.findAndModify(_this3.__translateQuery(query), null, _this3.__translateQuery(updateQuery), { new: true, upsert: true });

                        case 2:
                          modifyResult = _context6.sent;
                          return _context6.abrupt('return', _this3.__translateResultItem(modifyResult.value));

                        case 4:
                        case 'end':
                          return _context6.stop();
                      }
                    }
                  }, _callee6, _this3);
                }));

                return function (_x11) {
                  return _ref7.apply(this, arguments);
                };
              }());

            case 2:
              return _context7.abrupt('return', _context7.sent);

            case 3:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this3);
    }));

    return function (_x8, _x9, _x10) {
      return _ref6.apply(this, arguments);
    };
  }();

  this.findOne = function () {
    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(collectionName, query) {
      return _regenerator2.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(collection) {
                  var resultItem;
                  return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                      switch (_context8.prev = _context8.next) {
                        case 0:
                          _context8.next = 2;
                          return collection.findOne(_this3.__translateQuery(query));

                        case 2:
                          resultItem = _context8.sent;
                          return _context8.abrupt('return', _this3.__translateResultItem(resultItem));

                        case 4:
                        case 'end':
                          return _context8.stop();
                      }
                    }
                  }, _callee8, _this3);
                }));

                return function (_x14) {
                  return _ref9.apply(this, arguments);
                };
              }());

            case 2:
              return _context9.abrupt('return', _context9.sent);

            case 3:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, _this3);
    }));

    return function (_x12, _x13) {
      return _ref8.apply(this, arguments);
    };
  }();

  this.remove = function () {
    var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(collectionName, query) {
      return _regenerator2.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(collection) {
                  return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                      switch (_context10.prev = _context10.next) {
                        case 0:
                          _context10.next = 2;
                          return collection.remove(_this3.__translateQuery(query));

                        case 2:
                          return _context10.abrupt('return', _context10.sent);

                        case 3:
                        case 'end':
                          return _context10.stop();
                      }
                    }
                  }, _callee10, _this3);
                }));

                return function (_x17) {
                  return _ref11.apply(this, arguments);
                };
              }());

            case 2:
              return _context11.abrupt('return', _context11.sent);

            case 3:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this3);
    }));

    return function (_x15, _x16) {
      return _ref10.apply(this, arguments);
    };
  }();

  this.__runForCollection = function () {
    var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(collectionName, callback) {
      return _regenerator2.default.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return _this3._isDbReady();

            case 2:
              if (_this3._database) {
                _context12.next = 4;
                break;
              }

              throw new Error('database is not initialized');

            case 4:
              return _context12.abrupt('return', callback(_this3._database.collection(collectionName)).catch(function (error) {
                return _logger2.default.error(error);
              }));

            case 5:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this3);
    }));

    return function (_x18, _x19) {
      return _ref12.apply(this, arguments);
    };
  }();

  this._init = function () {
    var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(url, options) {
      var database;
      return _regenerator2.default.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return _mongodb.MongoClient.connect(url, options);

            case 2:
              database = _context13.sent;


              database.on('error', function (error) {
                return _logger2.default.error('DB connection Error: ', error);
              });

              database.on('open', function () {
                return _logger2.default.log('DB connected');
              });

              database.on('close', function (str) {
                return _logger2.default.log('DB disconnected: ', str);
              });

              _this3._database = database;
              _this3._statusEventEmitter.emit(DB_READY_EVENT);

            case 8:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this3);
    }));

    return function (_x20, _x21) {
      return _ref13.apply(this, arguments);
    };
  }();

  this._isDbReady = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14() {
    return _regenerator2.default.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            if (!_this3._database) {
              _context14.next = 2;
              break;
            }

            return _context14.abrupt('return', _promise2.default.resolve());

          case 2:
            return _context14.abrupt('return', new _promise2.default(function (resolve) {
              _this3._statusEventEmitter.once(DB_READY_EVENT, function () {
                return resolve();
              });
            }));

          case 3:
          case 'end':
            return _context14.stop();
        }
      }
    }, _callee14, _this3);
  }));
};

exports.default = MongoDb;