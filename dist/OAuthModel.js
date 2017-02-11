'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OAUTH_CLIENTS = [{
  clientId: 'CLI2',
  clientSecret: 'client_secret_here',
  grants: ['password']
}];

var OauthModel = function OauthModel(userRepository) {
  var _this = this;

  (0, _classCallCheck3.default)(this, OauthModel);

  this.getAccessToken = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(bearerToken) {
      var user, userTokenObject;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this._userRepository.getByAccessToken(bearerToken);

            case 2:
              user = _context.sent;

              if (user) {
                _context.next = 5;
                break;
              }

              return _context.abrupt('return', null);

            case 5:
              userTokenObject = user.accessTokens.find(function (tokenObject) {
                return tokenObject.accessToken === bearerToken;
              });

              if (userTokenObject) {
                _context.next = 8;
                break;
              }

              return _context.abrupt('return', null);

            case 8:
              return _context.abrupt('return', {
                accessToken: userTokenObject.accessToken,
                user: user
              });

            case 9:
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

  this.getClient = function (clientId, clientSecret) {
    return OAUTH_CLIENTS.find(function (client) {
      return client.clientId === clientId && client.clientSecret === clientSecret;
    });
  };

  this.getUser = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(username, password) {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this._userRepository.validateLogin(username, password);

            case 2:
              return _context2.abrupt('return', _context2.sent);

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.saveToken = function (tokenObject, client, user) {
    _this._userRepository.saveAccessToken(user.id, tokenObject);
    return {
      accessToken: tokenObject.accessToken,
      client: client,
      user: user
    };
  };

  this.validateScope = function (user, client, scope) {
    return 'true';
  };

  this._userRepository = userRepository;
}

// eslint-disable-next-line no-unused-vars
;

exports.default = OauthModel;