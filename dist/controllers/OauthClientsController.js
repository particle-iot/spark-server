

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

const _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

const _regenerator = require('babel-runtime/regenerator');

const _regenerator2 = _interopRequireDefault(_regenerator);

const _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

const _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

const _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

const _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

const _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

const _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

const _createClass2 = require('babel-runtime/helpers/createClass');

const _createClass3 = _interopRequireDefault(_createClass2);

const _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

const _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

const _inherits2 = require('babel-runtime/helpers/inherits');

const _inherits3 = _interopRequireDefault(_inherits2);

let _dec,
  _dec2,
  _dec3,
  _dec4,
  _dec5,
  _dec6,
  _desc,
  _value,
  _class;

const _Controller2 = require('./Controller');

const _Controller3 = _interopRequireDefault(_Controller2);

const _HttpError = require('../lib/HttpError');

const _HttpError2 = _interopRequireDefault(_HttpError);

const _httpVerb = require('../decorators/httpVerb');

const _httpVerb2 = _interopRequireDefault(_httpVerb);

const _route = require('../decorators/route');

const _route2 = _interopRequireDefault(_route);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  let desc = {};
  Object['ke' + 'ys'](descriptor).forEach((key) => {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce((desc, decorator) => decorator(target, property, desc) || desc, desc);

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

const OauthClientsController = (_dec = (0, _httpVerb2.default)('post'), _dec2 = (0, _route2.default)('/v1/products/:productIDorSlug/clients/'), _dec3 = (0, _httpVerb2.default)('put'), _dec4 = (0, _route2.default)('/v1/products/:productIDorSlug/clients/:clientID'), _dec5 = (0, _httpVerb2.default)('delete'), _dec6 = (0, _route2.default)('/v1/products/:productIDorSlug/clients/:clientID'), (_class = (function (_Controller) {
  (0, _inherits3.default)(OauthClientsController, _Controller);

  function OauthClientsController() {
    (0, _classCallCheck3.default)(this, OauthClientsController);
    return (0, _possibleConstructorReturn3.default)(this, (OauthClientsController.__proto__ || (0, _getPrototypeOf2.default)(OauthClientsController)).apply(this, arguments));
  }

  (0, _createClass3.default)(OauthClientsController, [{
    key: 'createClient',

    // eslint-disable-next-line class-methods-use-this
    value: (function () {
      const _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap((_context) => {
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
    }()),
  }, {
    key: 'editClient',

    // eslint-disable-next-line class-methods-use-this
    value: (function () {
      const _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap((_context2) => {
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
    }()),
  }, {
    key: 'deleteClient',

    // eslint-disable-next-line class-methods-use-this
    value: (function () {
      const _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap((_context3) => {
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
    }()),
  }]);
  return OauthClientsController;
}(_Controller3.default)), (_applyDecoratedDescriptor(_class.prototype, 'createClient', [_dec, _dec2], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'createClient'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'editClient', [_dec3, _dec4], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'editClient'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'deleteClient', [_dec5, _dec6], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'deleteClient'), _class.prototype)), _class));
exports.default = OauthClientsController;
