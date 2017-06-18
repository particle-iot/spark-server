'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _collectionNames = require('./collectionNames');

var _collectionNames2 = _interopRequireDefault(_collectionNames);

var _PasswordHasher = require('../lib/PasswordHasher');

var _PasswordHasher2 = _interopRequireDefault(_PasswordHasher);

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserDatabaseRepository = function UserDatabaseRepository(database) {
  var _this = this;

  (0, _classCallCheck3.default)(this, UserDatabaseRepository);
  this._collectionName = _collectionNames2.default.USERS;

  this.create = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(user) {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this._database.insertOne(_this._collectionName, user);

            case 2:
              return _context.abrupt('return', _context.sent);

            case 3:
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

  this.createWithCredentials = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(userCredentials) {
      var userRole = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var username, password, salt, passwordHash, modelToSave;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              username = userCredentials.username, password = userCredentials.password;
              _context2.next = 3;
              return _PasswordHasher2.default.generateSalt();

            case 3:
              salt = _context2.sent;
              _context2.next = 6;
              return _PasswordHasher2.default.hash(password, salt);

            case 6:
              passwordHash = _context2.sent;
              modelToSave = {
                accessTokens: [],
                created_at: new Date(),
                passwordHash: passwordHash,
                role: userRole,
                salt: salt,
                username: username
              };
              _context2.next = 10;
              return _this._database.insertOne(_this._collectionName, modelToSave);

            case 10:
              return _context2.abrupt('return', _context2.sent);

            case 11:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.deleteAccessToken = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(userID, accessToken) {
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this._database.findAndModify(_this._collectionName, { _id: userID }, { $pull: { accessTokens: { accessToken: accessToken } } });

            case 2:
              return _context3.abrupt('return', _context3.sent);

            case 3:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x4, _x5) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.deleteByID = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(id) {
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _this._database.remove(_this._collectionName, { _id: id });

            case 2:
              return _context4.abrupt('return', _context4.sent);

            case 3:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x6) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.getAll = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            throw new Error('The method is not implemented');

          case 1:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, _this);
  }));

  this.getByAccessToken = function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(accessToken) {
      var user;
      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _this._database.findOne(_this._collectionName, { accessTokens: { $elemMatch: { accessToken: accessToken } } });

            case 2:
              user = _context6.sent;

              if (user) {
                _context6.next = 7;
                break;
              }

              _context6.next = 6;
              return _this._database.findOne(_this._collectionName, { 'accessTokens.accessToken': accessToken });

            case 6:
              user = _context6.sent;

            case 7:
              return _context6.abrupt('return', user);

            case 8:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this);
    }));

    return function (_x7) {
      return _ref6.apply(this, arguments);
    };
  }();

  this.getByID = function () {
    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(id) {
      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              throw new Error('The method is not implemented');

            case 1:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this);
    }));

    return function (_x8) {
      return _ref7.apply(this, arguments);
    };
  }();

  this.getByUsername = function () {
    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(username) {
      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _this._database.findOne(_this._collectionName, { username: username });

            case 2:
              return _context8.abrupt('return', _context8.sent);

            case 3:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this);
    }));

    return function (_x9) {
      return _ref8.apply(this, arguments);
    };
  }();

  this.getCurrentUser = function () {
    return _this._currentUser;
  };

  this.isUserNameInUse = function () {
    var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(username) {
      return _regenerator2.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _this.getByUsername(username);

            case 2:
              return _context9.abrupt('return', !!_context9.sent);

            case 3:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, _this);
    }));

    return function (_x10) {
      return _ref9.apply(this, arguments);
    };
  }();

  this.saveAccessToken = function () {
    var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(userID, tokenObject) {
      return _regenerator2.default.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return _this._database.findAndModify(_this._collectionName, { _id: userID }, { $push: { accessTokens: tokenObject } });

            case 2:
              return _context10.abrupt('return', _context10.sent);

            case 3:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, _this);
    }));

    return function (_x11, _x12) {
      return _ref10.apply(this, arguments);
    };
  }();

  this.setCurrentUser = function (user) {
    _this._currentUser = user;
  };

  this.updateByID = function () {
    var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(id, props) {
      return _regenerator2.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _this._database.findAndModify(_this._collectionName, { _id: id }, { $set: (0, _extends3.default)({}, props) });

            case 2:
              return _context11.abrupt('return', _context11.sent);

            case 3:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this);
    }));

    return function (_x13, _x14) {
      return _ref11.apply(this, arguments);
    };
  }();

  this.validateLogin = function () {
    var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(username, password) {
      var user, hash;
      return _regenerator2.default.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.prev = 0;
              _context12.next = 3;
              return _this._database.findOne(_this._collectionName, { username: username });

            case 3:
              user = _context12.sent;

              if (user) {
                _context12.next = 6;
                break;
              }

              throw new _HttpError2.default('User doesn\'t exist', 404);

            case 6:
              _context12.next = 8;
              return _PasswordHasher2.default.hash(password, user.salt);

            case 8:
              hash = _context12.sent;

              if (!(hash !== user.passwordHash)) {
                _context12.next = 11;
                break;
              }

              throw new _HttpError2.default('Wrong password');

            case 11:
              return _context12.abrupt('return', user);

            case 14:
              _context12.prev = 14;
              _context12.t0 = _context12['catch'](0);
              throw _context12.t0;

            case 17:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this, [[0, 14]]);
    }));

    return function (_x15, _x16) {
      return _ref12.apply(this, arguments);
    };
  }();

  this._database = database;
}

// eslint-disable-next-line no-unused-vars


// eslint-disable-next-line no-unused-vars
;

exports.default = UserDatabaseRepository;