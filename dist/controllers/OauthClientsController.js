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

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _desc, _value, _class;

var _Controller2 = require('./Controller');

var _Controller3 = _interopRequireDefault(_Controller2);

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

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

var OauthClientsController = (_dec = (0, _httpVerb2.default)('post'), _dec2 = (0, _route2.default)('/v1/products/:productIDorSlug/clients/'), _dec3 = (0, _httpVerb2.default)('put'), _dec4 = (0, _route2.default)('/v1/products/:productIDorSlug/clients/:clientID'), _dec5 = (0, _httpVerb2.default)('delete'), _dec6 = (0, _route2.default)('/v1/products/:productIDorSlug/clients/:clientID'), (_class = function (_Controller) {
  (0, _inherits3.default)(OauthClientsController, _Controller);

  function OauthClientsController() {
    (0, _classCallCheck3.default)(this, OauthClientsController);
    return (0, _possibleConstructorReturn3.default)(this, (OauthClientsController.__proto__ || (0, _getPrototypeOf2.default)(OauthClientsController)).apply(this, arguments));
  }

  (0, _createClass3.default)(OauthClientsController, [{
    key: 'createClient',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                throw new _HttpError2.default('not supported in the current server version');

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function createClient() {
        return _ref.apply(this, arguments);
      }

      return createClient;
    }()
  }, {
    key: 'editClient',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                throw new _HttpError2.default('not supported in the current server version');

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function editClient() {
        return _ref2.apply(this, arguments);
      }

      return editClient;
    }()
  }, {
    key: 'deleteClient',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                throw new _HttpError2.default('not supported in the current server version');

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function deleteClient() {
        return _ref3.apply(this, arguments);
      }

      return deleteClient;
    }()
  }]);
  return OauthClientsController;
}(_Controller3.default), (_applyDecoratedDescriptor(_class.prototype, 'createClient', [_dec, _dec2], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'createClient'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'editClient', [_dec3, _dec4], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'editClient'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'deleteClient', [_dec5, _dec6], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'deleteClient'), _class.prototype)), _class));
exports.default = OauthClientsController;