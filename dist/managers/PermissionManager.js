'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

var _oauth2Server = require('oauth2-server');

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = _logger2.default.createModuleLogger(module);

var PermissionManager = function PermissionManager(deviceAttributeRepository, userRepository, webhookRepository, oauthServer) {
  var _this = this;

  (0, _classCallCheck3.default)(this, PermissionManager);
  this._repositoriesByEntityName = new _map2.default();

  this.checkPermissionsForEntityByID = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(entityName, id) {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this.getEntityByID(entityName, id);

            case 2:
              return _context.abrupt('return', !!_context.sent);

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  this.getAllEntitiesForCurrentUser = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(entityName) {
      var currentUser;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              currentUser = _this._userRepository.getCurrentUser();
              _context2.next = 3;
              return (0, _nullthrows2.default)(_this._repositoriesByEntityName.get(entityName)).getAll(currentUser.id);

            case 3:
              return _context2.abrupt('return', _context2.sent);

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x3) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.getEntityByID = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(entityName, id) {
      var entity;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return (0, _nullthrows2.default)(_this._repositoriesByEntityName.get(entityName)).getByID(id);

            case 2:
              entity = _context3.sent;

              if (entity) {
                _context3.next = 5;
                break;
              }

              return _context3.abrupt('return', null);

            case 5:
              if (_this.doesUserHaveAccess(entity)) {
                _context3.next = 7;
                break;
              }

              throw new _HttpError2.default("User doesn't have access", 403);

            case 7:
              return _context3.abrupt('return', entity);

            case 8:
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

  this._createDefaultAdminUser = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
    var token;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return _this._userRepository.createWithCredentials({
              password: _settings2.default.DEFAULT_ADMIN_PASSWORD,
              username: _settings2.default.DEFAULT_ADMIN_USERNAME
            }, 'administrator');

          case 3:
            _context4.next = 5;
            return _this._generateAdminToken();

          case 5:
            token = _context4.sent;


            logger.info({ token: token }, 'New default admin user created');
            _context4.next = 12;
            break;

          case 9:
            _context4.prev = 9;
            _context4.t0 = _context4['catch'](0);

            logger.error({ err: _context4.t0 }, 'Error during default admin user creating');

          case 12:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, _this, [[0, 9]]);
  }));

  this.doesUserHaveAccess = function (_ref5) {
    var ownerID = _ref5.ownerID;

    var currentUser = _this._userRepository.getCurrentUser();
    return currentUser.role === 'administrator' || currentUser.id === ownerID;
  };

  this._generateAdminToken = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
    var request, response, tokenPayload;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            request = new _oauth2Server.Request({
              body: {
                client_id: 'spark-server',
                client_secret: 'spark-server',
                grant_type: 'password',
                password: _settings2.default.DEFAULT_ADMIN_PASSWORD,
                username: _settings2.default.DEFAULT_ADMIN_USERNAME
              },
              headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'transfer-encoding': 'chunked'
              },
              method: 'POST',
              query: {}
            });
            response = new _oauth2Server.Response({ body: {}, headers: {} });
            _context5.next = 4;
            return _this._oauthServer.server.token(request, response,
            // oauth server doesn't allow us to use infinite access token
            // so we pass some big value here
            { accessTokenLifetime: 9999999999 });

          case 4:
            tokenPayload = _context5.sent;
            return _context5.abrupt('return', tokenPayload.accessToken);

          case 6:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, _this);
  }));
  this._init = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
    var defaultAdminUser;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return _this._userRepository.getByUsername(_settings2.default.DEFAULT_ADMIN_USERNAME);

          case 2:
            defaultAdminUser = _context6.sent;

            if (!defaultAdminUser) {
              _context6.next = 7;
              break;
            }

            logger.info({ token: defaultAdminUser.accessTokens[0].accessToken }, 'Default Admin token');
            _context6.next = 9;
            break;

          case 7:
            _context6.next = 9;
            return _this._createDefaultAdminUser();

          case 9:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, _this);
  }));

  this._userRepository = userRepository;
  this._repositoriesByEntityName.set('deviceAttributes', deviceAttributeRepository);
  this._repositoriesByEntityName.set('webhook', webhookRepository);
  this._oauthServer = oauthServer;

  (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7() {
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return _this._init();

          case 2:
            return _context7.abrupt('return', _context7.sent);

          case 3:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, _this);
  }))();
};

exports.default = PermissionManager;