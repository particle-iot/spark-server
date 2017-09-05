'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _nedbCore = require('nedb-core');

var _nedbCore2 = _interopRequireDefault(_nedbCore);

var _collectionNames = require('./collectionNames');

var _collectionNames2 = _interopRequireDefault(_collectionNames);

var _promisify = require('../lib/promisify');

var _BaseMongoDb2 = require('./BaseMongoDb');

var _BaseMongoDb3 = _interopRequireDefault(_BaseMongoDb2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NeDb = function (_BaseMongoDb) {
  (0, _inherits3.default)(NeDb, _BaseMongoDb);

  function NeDb(path) {
    var _this2 = this;

    (0, _classCallCheck3.default)(this, NeDb);

    var _this = (0, _possibleConstructorReturn3.default)(this, (NeDb.__proto__ || (0, _getPrototypeOf2.default)(NeDb)).call(this));

    _this.count = function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(collectionName, query) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _this.__runForCollection(collectionName, function () {
                  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(collection) {
                    return _regenerator2.default.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return (0, _promisify.promisify)(collection, 'count', query);

                          case 2:
                            return _context.abrupt('return', _context.sent);

                          case 3:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, _this2);
                  }));

                  return function (_x3) {
                    return _ref2.apply(this, arguments);
                  };
                }());

              case 2:
                _context2.t0 = _context2.sent;

                if (_context2.t0) {
                  _context2.next = 5;
                  break;
                }

                _context2.t0 = 0;

              case 5:
                return _context2.abrupt('return', _context2.t0);

              case 6:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this2);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }();

    _this.insertOne = function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(collectionName, entity) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _this.__runForCollection(collectionName, function () {
                  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(collection) {
                    var insertResult;
                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            _context3.next = 2;
                            return (0, _promisify.promisify)(collection, 'insert', entity);

                          case 2:
                            insertResult = _context3.sent;
                            return _context3.abrupt('return', _this.__translateResultItem(insertResult));

                          case 4:
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee3, _this2);
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
        }, _callee4, _this2);
      }));

      return function (_x4, _x5) {
        return _ref3.apply(this, arguments);
      };
    }();

    _this.find = function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(collectionName, query) {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return _this.__runForCollection(collectionName, function () {
                  var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(collection) {
                    var page, _query$pageSize, pageSize, otherQuery, boundFunction, resultItems;

                    return _regenerator2.default.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            page = query.page, _query$pageSize = query.pageSize, pageSize = _query$pageSize === undefined ? 25 : _query$pageSize, otherQuery = (0, _objectWithoutProperties3.default)(query, ['page', 'pageSize']);
                            boundFunction = collection.find(otherQuery);

                            if (page) {
                              boundFunction = boundFunction.skip((page - 1) * pageSize).limit(pageSize);
                            }
                            _context5.next = 5;
                            return (0, _promisify.promisify)(boundFunction, 'exec');

                          case 5:
                            resultItems = _context5.sent;
                            return _context5.abrupt('return', resultItems.map(_this.__translateResultItem));

                          case 7:
                          case 'end':
                            return _context5.stop();
                        }
                      }
                    }, _callee5, _this2);
                  }));

                  return function (_x9) {
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
        }, _callee6, _this2);
      }));

      return function (_x7, _x8) {
        return _ref5.apply(this, arguments);
      };
    }();

    _this.findAndModify = function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(collectionName, query, updateQuery) {
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return _this.__runForCollection(collectionName, function () {
                  var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(collection) {
                    var _ref9, _ref10, count, resultItem;

                    return _regenerator2.default.wrap(function _callee7$(_context7) {
                      while (1) {
                        switch (_context7.prev = _context7.next) {
                          case 0:
                            _context7.next = 2;
                            return (0, _promisify.promisify)(collection, 'update', query, updateQuery, {
                              returnUpdatedDocs: true,
                              upsert: true
                            });

                          case 2:
                            _ref9 = _context7.sent;
                            _ref10 = (0, _slicedToArray3.default)(_ref9, 2);
                            count = _ref10[0];
                            // eslint-disable-line no-unused-vars
                            resultItem = _ref10[1];
                            return _context7.abrupt('return', _this.__translateResultItem(resultItem));

                          case 7:
                          case 'end':
                            return _context7.stop();
                        }
                      }
                    }, _callee7, _this2);
                  }));

                  return function (_x13) {
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
        }, _callee8, _this2);
      }));

      return function (_x10, _x11, _x12) {
        return _ref7.apply(this, arguments);
      };
    }();

    _this.findOne = function () {
      var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(collectionName, query) {
        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return _this.__runForCollection(collectionName, function () {
                  var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(collection) {
                    var resultItem;
                    return _regenerator2.default.wrap(function _callee9$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            _context9.next = 2;
                            return (0, _promisify.promisify)(collection, 'findOne', query);

                          case 2:
                            resultItem = _context9.sent;
                            return _context9.abrupt('return', _this.__translateResultItem(resultItem));

                          case 4:
                          case 'end':
                            return _context9.stop();
                        }
                      }
                    }, _callee9, _this2);
                  }));

                  return function (_x16) {
                    return _ref12.apply(this, arguments);
                  };
                }());

              case 2:
                return _context10.abrupt('return', _context10.sent);

              case 3:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, _this2);
      }));

      return function (_x14, _x15) {
        return _ref11.apply(this, arguments);
      };
    }();

    _this.remove = function () {
      var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(collectionName, query) {
        return _regenerator2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.next = 2;
                return _this.__runForCollection(collectionName, function () {
                  var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(collection) {
                    return _regenerator2.default.wrap(function _callee11$(_context11) {
                      while (1) {
                        switch (_context11.prev = _context11.next) {
                          case 0:
                            _context11.next = 2;
                            return (0, _promisify.promisify)(collection, 'remove', query);

                          case 2:
                            return _context11.abrupt('return', _context11.sent);

                          case 3:
                          case 'end':
                            return _context11.stop();
                        }
                      }
                    }, _callee11, _this2);
                  }));

                  return function (_x19) {
                    return _ref14.apply(this, arguments);
                  };
                }());

              case 2:
                return _context12.abrupt('return', _context12.sent);

              case 3:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, _this2);
      }));

      return function (_x17, _x18) {
        return _ref13.apply(this, arguments);
      };
    }();

    _this.__runForCollection = function () {
      var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(collectionName, callback) {
        return _regenerator2.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                return _context13.abrupt('return', callback(_this._database[collectionName]));

              case 1:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, _this2);
      }));

      return function (_x20, _x21) {
        return _ref15.apply(this, arguments);
      };
    }();

    if (!_fs2.default.existsSync(path)) {
      _mkdirp2.default.sync(path);
    }

    _this._database = {};

    (0, _values2.default)(_collectionNames2.default).forEach(function (collectionName) {
      var colName = collectionName;
      _this._database[collectionName] = new _nedbCore2.default({
        autoload: true,
        filename: path + '/' + colName + '.db'
      });
    });
    return _this;
  }

  return NeDb;
}(_BaseMongoDb3.default);

exports.default = NeDb;