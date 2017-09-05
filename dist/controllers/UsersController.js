'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _desc, _value, _class;

var _basicAuthParser3 = require('basic-auth-parser');

var _basicAuthParser4 = _interopRequireDefault(_basicAuthParser3);

var _Controller2 = require('./Controller');

var _Controller3 = _interopRequireDefault(_Controller2);

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

var _anonymous = require('../decorators/anonymous');

var _anonymous2 = _interopRequireDefault(_anonymous);

var _httpVerb = require('../decorators/httpVerb');

var _httpVerb2 = _interopRequireDefault(_httpVerb);

var _route = require('../decorators/route');

var _route2 = _interopRequireDefault(_route);

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

var UsersController = (_dec = (0, _httpVerb2.default)('post'), _dec2 = (0, _route2.default)('/v1/users'), _dec3 = (0, _anonymous2.default)(), _dec4 = (0, _httpVerb2.default)('delete'), _dec5 = (0, _route2.default)('/v1/access_tokens/:token'), _dec6 = (0, _anonymous2.default)(), _dec7 = (0, _httpVerb2.default)('get'), _dec8 = (0, _route2.default)('/v1/access_tokens'), _dec9 = (0, _anonymous2.default)(), (_class = function (_Controller) {
  (0, _inherits3.default)(UsersController, _Controller);

  function UsersController(userRepository) {
    (0, _classCallCheck3.default)(this, UsersController);

    var _this = (0, _possibleConstructorReturn3.default)(this, (UsersController.__proto__ || (0, _getPrototypeOf2.default)(UsersController)).call(this));

    _this._userRepository = userRepository;
    return _this;
  }

  (0, _createClass3.default)(UsersController, [{
    key: 'createUser',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(userCredentials) {
        var isUserNameInUse;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return this._userRepository.isUserNameInUse(userCredentials.username);

              case 3:
                isUserNameInUse = _context.sent;

                if (!isUserNameInUse) {
                  _context.next = 6;
                  break;
                }

                throw new _HttpError2.default('user with the username already exists');

              case 6:
                _context.next = 8;
                return this._userRepository.createWithCredentials(userCredentials);

              case 8:
                return _context.abrupt('return', this.ok({ ok: true }));

              case 11:
                _context.prev = 11;
                _context.t0 = _context['catch'](0);
                return _context.abrupt('return', this.bad(_context.t0.message));

              case 14:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 11]]);
      }));

      function createUser(_x) {
        return _ref.apply(this, arguments);
      }

      return createUser;
    }()
  }, {
    key: 'deleteAccessToken',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(token) {
        var _basicAuthParser, username, password, user;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _basicAuthParser = (0, _basicAuthParser4.default)(this.request.get('authorization')), username = _basicAuthParser.username, password = _basicAuthParser.password;
                _context2.next = 3;
                return this._userRepository.validateLogin(username, password);

              case 3:
                user = _context2.sent;


                this._userRepository.deleteAccessToken(user.id, token);

                return _context2.abrupt('return', this.ok({ ok: true }));

              case 6:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function deleteAccessToken(_x2) {
        return _ref2.apply(this, arguments);
      }

      return deleteAccessToken;
    }()
  }, {
    key: 'getAccessTokens',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var _basicAuthParser2, username, password, user;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _basicAuthParser2 = (0, _basicAuthParser4.default)(this.request.get('authorization')), username = _basicAuthParser2.username, password = _basicAuthParser2.password;
                _context3.next = 3;
                return this._userRepository.validateLogin(username, password);

              case 3:
                user = _context3.sent;
                return _context3.abrupt('return', this.ok(user.accessTokens));

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getAccessTokens() {
        return _ref3.apply(this, arguments);
      }

      return getAccessTokens;
    }()
  }]);
  return UsersController;
}(_Controller3.default), (_applyDecoratedDescriptor(_class.prototype, 'createUser', [_dec, _dec2, _dec3], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'createUser'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'deleteAccessToken', [_dec4, _dec5, _dec6], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'deleteAccessToken'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getAccessTokens', [_dec7, _dec8, _dec9], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getAccessTokens'), _class.prototype)), _class));
exports.default = UsersController;