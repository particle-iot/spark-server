'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _desc, _value, _class;

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

var validateWebhookMutator = function validateWebhookMutator(webhookMutator) {
  if (!webhookMutator.event) {
    return new _HttpError2.default('no event name provided');
  }
  if (!webhookMutator.url) {
    return new _HttpError2.default('no url provided');
  }
  if (!webhookMutator.requestType) {
    return new _HttpError2.default('no requestType provided');
  }

  return null;
};

var WebhooksController = (_dec = (0, _httpVerb2.default)('get'), _dec2 = (0, _route2.default)('/v1/webhooks'), _dec3 = (0, _httpVerb2.default)('get'), _dec4 = (0, _route2.default)('/v1/webhooks/:webhookID'), _dec5 = (0, _httpVerb2.default)('post'), _dec6 = (0, _route2.default)('/v1/webhooks'), _dec7 = (0, _httpVerb2.default)('delete'), _dec8 = (0, _route2.default)('/v1/webhooks/:webhookID'), (_class = function (_Controller) {
  (0, _inherits3.default)(WebhooksController, _Controller);

  function WebhooksController(webhookManager) {
    (0, _classCallCheck3.default)(this, WebhooksController);

    var _this = (0, _possibleConstructorReturn3.default)(this, (WebhooksController.__proto__ || (0, _getPrototypeOf2.default)(WebhooksController)).call(this));

    _this._webhookManager = webhookManager;
    return _this;
  }

  (0, _createClass3.default)(WebhooksController, [{
    key: 'getAll',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.t0 = this;
                _context.next = 3;
                return this._webhookManager.getAll();

              case 3:
                _context.t1 = _context.sent;
                return _context.abrupt('return', _context.t0.ok.call(_context.t0, _context.t1));

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getAll() {
        return _ref.apply(this, arguments);
      }

      return getAll;
    }()
  }, {
    key: 'getByID',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(webhookID) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.t0 = this;
                _context2.next = 3;
                return this._webhookManager.getByID(webhookID);

              case 3:
                _context2.t1 = _context2.sent;
                return _context2.abrupt('return', _context2.t0.ok.call(_context2.t0, _context2.t1));

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getByID(_x) {
        return _ref2.apply(this, arguments);
      }

      return getByID;
    }()
  }, {
    key: 'create',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(model) {
        var validateError, newWebhook;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                validateError = validateWebhookMutator(model);

                if (!validateError) {
                  _context3.next = 3;
                  break;
                }

                throw validateError;

              case 3:
                _context3.next = 5;
                return this._webhookManager.create((0, _extends3.default)({}, model, {
                  ownerID: this.user.id
                }));

              case 5:
                newWebhook = _context3.sent;
                return _context3.abrupt('return', this.ok({
                  created_at: newWebhook.created_at,
                  event: newWebhook.event,
                  id: newWebhook.id,
                  ok: true,
                  url: newWebhook.url
                }));

              case 7:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function create(_x2) {
        return _ref3.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'deleteByID',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(webhookID) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this._webhookManager.deleteByID(webhookID);

              case 2:
                return _context4.abrupt('return', this.ok({ ok: true }));

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function deleteByID(_x3) {
        return _ref4.apply(this, arguments);
      }

      return deleteByID;
    }()
  }]);
  return WebhooksController;
}(_Controller3.default), (_applyDecoratedDescriptor(_class.prototype, 'getAll', [_dec, _dec2], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getAll'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getByID', [_dec3, _dec4], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getByID'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'create', [_dec5, _dec6], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'create'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'deleteByID', [_dec7, _dec8], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'deleteByID'), _class.prototype)), _class));
exports.default = WebhooksController;