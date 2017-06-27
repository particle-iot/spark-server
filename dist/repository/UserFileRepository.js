'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _desc, _value, _class;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _sparkProtocol = require('spark-protocol');

var _PasswordHasher = require('../lib/PasswordHasher');

var _PasswordHasher2 = _interopRequireDefault(_PasswordHasher);

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var UserFileRepository = (_dec = (0, _sparkProtocol.memoizeSet)(), _dec2 = (0, _sparkProtocol.memoizeSet)(['id']), _dec3 = (0, _sparkProtocol.memoizeGet)(), _dec4 = (0, _sparkProtocol.memoizeGet)(['id']), _dec5 = (0, _sparkProtocol.memoizeGet)(['username']), _dec6 = (0, _sparkProtocol.memoizeGet)(['username']), _dec7 = (0, _sparkProtocol.memoizeSet)(), (_class = function () {
  function UserFileRepository(path) {
    var _this = this;

    (0, _classCallCheck3.default)(this, UserFileRepository);

    this.createWithCredentials = function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(userCredentials) {
        var userRole = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var username, password, salt, passwordHash, modelToSave;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                username = userCredentials.username, password = userCredentials.password;
                _context.next = 3;
                return _PasswordHasher2.default.generateSalt();

              case 3:
                salt = _context.sent;
                _context.next = 6;
                return _PasswordHasher2.default.hash(password, salt);

              case 6:
                passwordHash = _context.sent;
                modelToSave = {
                  accessTokens: [],
                  passwordHash: passwordHash,
                  role: userRole,
                  salt: salt,
                  username: username
                };
                _context.next = 10;
                return _this.create(modelToSave);

              case 10:
                return _context.abrupt('return', _context.sent);

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();

    this.deleteAccessToken = function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(userID, token) {
        var user;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _this.getByID(userID);

              case 2:
                user = _context2.sent;

                if (user) {
                  _context2.next = 5;
                  break;
                }

                throw new Error("User doesn't exist");

              case 5:
                _context2.next = 7;
                return _this.updateByID(userID, {
                  accessTokens: user.accessTokens.filter(function (tokenObject) {
                    return tokenObject.accessToken !== token;
                  })
                });

              case 7:
                return _context2.abrupt('return', _context2.sent);

              case 8:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }();

    this.getByAccessToken = function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(accessToken) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _this.getAll();

              case 2:
                _context3.t0 = function (user) {
                  return user.accessTokens.some(function (tokenObject) {
                    return tokenObject.accessToken === accessToken;
                  });
                };

                return _context3.abrupt('return', _context3.sent.find(_context3.t0));

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this);
      }));

      return function (_x5) {
        return _ref3.apply(this, arguments);
      };
    }();

    this.getCurrentUser = function () {
      return _this._currentUser;
    };

    this.saveAccessToken = function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(userID, tokenObject) {
        var user;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return _this.getByID(userID);

              case 2:
                user = _context4.sent;

                if (user) {
                  _context4.next = 5;
                  break;
                }

                throw new _HttpError2.default('Could not find user for user ID');

              case 5:
                _context4.next = 7;
                return _this.updateByID(userID, {
                  accessTokens: [].concat((0, _toConsumableArray3.default)(user.accessTokens), [tokenObject])
                });

              case 7:
                return _context4.abrupt('return', _context4.sent);

              case 8:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this);
      }));

      return function (_x6, _x7) {
        return _ref4.apply(this, arguments);
      };
    }();

    this.setCurrentUser = function (user) {
      _this._currentUser = user;
    };

    this.validateLogin = function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(username, password) {
        var user, hash;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _context5.next = 3;
                return _this.getByUsername(username);

              case 3:
                user = _context5.sent;

                if (user) {
                  _context5.next = 6;
                  break;
                }

                throw new Error("User doesn't exist");

              case 6:
                _context5.next = 8;
                return _PasswordHasher2.default.hash(password, user.salt);

              case 8:
                hash = _context5.sent;

                if (!(hash !== user.passwordHash)) {
                  _context5.next = 11;
                  break;
                }

                throw new Error('Wrong password');

              case 11:
                return _context5.abrupt('return', user);

              case 14:
                _context5.prev = 14;
                _context5.t0 = _context5['catch'](0);
                throw _context5.t0;

              case 17:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, _this, [[0, 14]]);
      }));

      return function (_x8, _x9) {
        return _ref5.apply(this, arguments);
      };
    }();

    this._fileManager = new _sparkProtocol.JSONFileManager(path);
  }

  (0, _createClass3.default)(UserFileRepository, [{
    key: 'create',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(user) {
        var id, modelToSave;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                id = (0, _uuid2.default)();

              case 1:
                _context6.next = 3;
                return this._fileManager.hasFile(id + '.json');

              case 3:
                if (!_context6.sent) {
                  _context6.next = 7;
                  break;
                }

                id = (0, _uuid2.default)();
                _context6.next = 1;
                break;

              case 7:
                modelToSave = (0, _extends3.default)({}, user, {
                  created_at: new Date(),
                  created_by: null,
                  id: id
                });


                this._fileManager.createFile(modelToSave.id + '.json', modelToSave);
                return _context6.abrupt('return', modelToSave);

              case 10:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function create(_x10) {
        return _ref6.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'deleteByID',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(id) {
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                this._fileManager.deleteFile(id + '.json');

              case 1:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function deleteByID(_x11) {
        return _ref7.apply(this, arguments);
      }

      return deleteByID;
    }()
  }, {
    key: 'getAll',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                return _context8.abrupt('return', this._fileManager.getAllData());

              case 1:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function getAll() {
        return _ref8.apply(this, arguments);
      }

      return getAll;
    }()

    // This isn't a good one to memoize as we can't key off user ID and there
    // isn't a good way to clear the cache.

  }, {
    key: 'getByID',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(id) {
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                return _context9.abrupt('return', this._fileManager.getFile(id + '.json'));

              case 1:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function getByID(_x12) {
        return _ref9.apply(this, arguments);
      }

      return getByID;
    }()
  }, {
    key: 'getByUsername',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(username) {
        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.getAll();

              case 2:
                _context10.t0 = function (user) {
                  return user.username === username;
                };

                return _context10.abrupt('return', _context10.sent.find(_context10.t0));

              case 4:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function getByUsername(_x13) {
        return _ref10.apply(this, arguments);
      }

      return getByUsername;
    }()
  }, {
    key: 'isUserNameInUse',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(username) {
        return _regenerator2.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return this.getAll();

              case 2:
                _context11.t0 = function (user) {
                  return user.username === username;
                };

                return _context11.abrupt('return', _context11.sent.some(_context11.t0));

              case 4:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function isUserNameInUse(_x14) {
        return _ref11.apply(this, arguments);
      }

      return isUserNameInUse;
    }()
  }, {
    key: 'updateByID',
    value: function () {
      var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(id, props) {
        var user, modelToSave;
        return _regenerator2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.next = 2;
                return this.getByID(id);

              case 2:
                user = _context12.sent;
                modelToSave = (0, _extends3.default)({}, user || {}, props);


                this._fileManager.writeFile(id + '.json', modelToSave);
                return _context12.abrupt('return', modelToSave);

              case 6:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function updateByID(_x15, _x16) {
        return _ref12.apply(this, arguments);
      }

      return updateByID;
    }()
  }]);
  return UserFileRepository;
}(), (_applyDecoratedDescriptor(_class.prototype, 'create', [_dec], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'create'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'deleteByID', [_dec2], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'deleteByID'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getAll', [_dec3], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getAll'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getByID', [_dec4], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getByID'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getByUsername', [_dec5], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getByUsername'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'isUserNameInUse', [_dec6], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'isUserNameInUse'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'updateByID', [_dec7], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'updateByID'), _class.prototype)), _class));
exports.default = UserFileRepository;