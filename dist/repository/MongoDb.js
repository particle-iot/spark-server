'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

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

var _mongodb = require('mongodb');

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = _logger2.default.createModuleLogger(module);

var DB_READY_EVENT = 'dbReady';

var MongoDb = function (_BaseMongoDb) {
  (0, _inherits3.default)(MongoDb, _BaseMongoDb);

  function MongoDb(url) {
    var _this2 = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, MongoDb);

    var _this = (0, _possibleConstructorReturn3.default)(this, (MongoDb.__proto__ || (0, _getPrototypeOf2.default)(MongoDb)).call(this));

    _initialiseProps.call(_this);

    (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
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

  this.count = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(collectionName) {
      var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(collection) {
                  return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return collection.count(_this3.__translateQuery(query), {
                            timeout: false
                          });

                        case 2:
                          return _context2.abrupt('return', _context2.sent);

                        case 3:
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
              _context3.t0 = _context3.sent;

              if (_context3.t0) {
                _context3.next = 5;
                break;
              }

              _context3.t0 = 0;

            case 5:
              return _context3.abrupt('return', _context3.t0);

            case 6:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this3);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.insertOne = function () {
    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(collectionName, entity) {
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(collection) {
                  var insertResult;
                  return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          _context4.next = 2;
                          return collection.insertOne(entity);

                        case 2:
                          insertResult = _context4.sent;
                          return _context4.abrupt('return', _this3.__translateResultItem(insertResult.ops[0]));

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

  this.find = function () {
    var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(collectionName, query) {
      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(collection) {
                  var page, _query$pageSize, pageSize, otherQuery, result, resultItems;

                  return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                      switch (_context6.prev = _context6.next) {
                        case 0:
                          page = query.page, _query$pageSize = query.pageSize, pageSize = _query$pageSize === undefined ? 25 : _query$pageSize, otherQuery = (0, _objectWithoutProperties3.default)(query, ['page', 'pageSize']);
                          result = collection.find(_this3.__translateQuery(otherQuery), {
                            timeout: false
                          });


                          if (page) {
                            result = result.skip((page - 1) * pageSize).limit(pageSize);
                          }

                          _context6.next = 5;
                          return result.toArray();

                        case 5:
                          resultItems = _context6.sent;
                          return _context6.abrupt('return', resultItems.map(_this3.__translateResultItem));

                        case 7:
                        case 'end':
                          return _context6.stop();
                      }
                    }
                  }, _callee6, _this3);
                }));

                return function (_x10) {
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

    return function (_x8, _x9) {
      return _ref6.apply(this, arguments);
    };
  }();

  this.findAndModify = function () {
    var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(collectionName, query, updateQuery) {
      return _regenerator2.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(collection) {
                  var modifyResult;
                  return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                      switch (_context8.prev = _context8.next) {
                        case 0:
                          _context8.next = 2;
                          return collection.findAndModify(_this3.__translateQuery(query), null, _this3.__translateQuery(updateQuery), { new: true, upsert: true });

                        case 2:
                          modifyResult = _context8.sent;
                          return _context8.abrupt('return', _this3.__translateResultItem(modifyResult.value));

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

    return function (_x11, _x12, _x13) {
      return _ref8.apply(this, arguments);
    };
  }();

  this.findOne = function () {
    var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(collectionName, query) {
      return _regenerator2.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(collection) {
                  var resultItem;
                  return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                      switch (_context10.prev = _context10.next) {
                        case 0:
                          _context10.next = 2;
                          return collection.findOne(_this3.__translateQuery(query));

                        case 2:
                          resultItem = _context10.sent;
                          return _context10.abrupt('return', _this3.__translateResultItem(resultItem));

                        case 4:
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

  this.remove = function () {
    var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(collectionName, query) {
      return _regenerator2.default.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return _this3.__runForCollection(collectionName, function () {
                var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(collection) {
                  return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                      switch (_context12.prev = _context12.next) {
                        case 0:
                          _context12.next = 2;
                          return collection.remove(_this3.__translateQuery(query));

                        case 2:
                          return _context12.abrupt('return', _context12.sent);

                        case 3:
                        case 'end':
                          return _context12.stop();
                      }
                    }
                  }, _callee12, _this3);
                }));

                return function (_x20) {
                  return _ref13.apply(this, arguments);
                };
              }());

            case 2:
              return _context13.abrupt('return', _context13.sent);

            case 3:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this3);
    }));

    return function (_x18, _x19) {
      return _ref12.apply(this, arguments);
    };
  }();

  this.__runForCollection = function () {
    var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(collectionName, callback) {
      return _regenerator2.default.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.next = 2;
              return _this3._isDbReady();

            case 2:
              if (_this3._database) {
                _context14.next = 4;
                break;
              }

              throw new Error('database is not initialized');

            case 4:
              return _context14.abrupt('return', callback(_this3._database.collection(collectionName)).catch(function (error) {
                return logger.error({ err: error }, 'Run for Collection');
              }));

            case 5:
            case 'end':
              return _context14.stop();
          }
        }
      }, _callee14, _this3);
    }));

    return function (_x21, _x22) {
      return _ref14.apply(this, arguments);
    };
  }();

  this._init = function () {
    var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(url, options) {
      var database;
      return _regenerator2.default.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              _context15.next = 2;
              return _mongodb.MongoClient.connect(url, options);

            case 2:
              database = _context15.sent;


              database.on('error', function (error) {
                return logger.error({ err: error }, 'DB connection Error: ');
              });

              database.on('open', function () {
                return logger.info('DB connected');
              });

              database.on('close', function (str) {
                return logger.info({ info: str }, 'DB disconnected: ');
              });

              _this3._database = database;
              _this3._statusEventEmitter.emit(DB_READY_EVENT);

            case 8:
            case 'end':
              return _context15.stop();
          }
        }
      }, _callee15, _this3);
    }));

    return function (_x23, _x24) {
      return _ref15.apply(this, arguments);
    };
  }();

  this._isDbReady = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16() {
    return _regenerator2.default.wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            if (!_this3._database) {
              _context16.next = 2;
              break;
            }

            return _context16.abrupt('return', _promise2.default.resolve());

          case 2:
            return _context16.abrupt('return', new _promise2.default(function (resolve) {
              _this3._statusEventEmitter.once(DB_READY_EVENT, function () {
                return resolve();
              });
            }));

          case 3:
          case 'end':
            return _context16.stop();
        }
      }
    }, _callee16, _this3);
  }));
};

exports.default = MongoDb;