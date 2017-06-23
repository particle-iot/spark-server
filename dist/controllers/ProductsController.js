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

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _desc, _value, _class;
/* eslint-disable */

var _Controller2 = require('./Controller');

var _Controller3 = _interopRequireDefault(_Controller2);

var _httpVerb = require('../decorators/httpVerb');

var _httpVerb2 = _interopRequireDefault(_httpVerb);

var _route = require('../decorators/route');

var _route2 = _interopRequireDefault(_route);

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

var ProductsController = (_dec = (0, _httpVerb2.default)('get'), _dec2 = (0, _route2.default)('/v1/products/:productIdOrSlug'), _dec3 = (0, _httpVerb2.default)('get'), _dec4 = (0, _route2.default)('/v1/products/:productIdOrSlug/firmware'), _dec5 = (0, _httpVerb2.default)('post'), _dec6 = (0, _route2.default)('/v1/products/:productIdOrSlug/firmware'), _dec7 = (0, _httpVerb2.default)('get'), _dec8 = (0, _route2.default)('/v1/products/:productIdOrSlug/devices'), _dec9 = (0, _httpVerb2.default)('put'), _dec10 = (0, _route2.default)('/v1/products/:productIdOrSlug/devices/:deviceID'), _dec11 = (0, _httpVerb2.default)('get'), _dec12 = (0, _route2.default)('/v1/products/:productIdOrSlug/config'), _dec13 = (0, _httpVerb2.default)('get'), _dec14 = (0, _route2.default)('/v1/products/:productIdOrSlug/events/:eventPrefix?*'), (_class = function (_Controller) {
  (0, _inherits3.default)(ProductsController, _Controller);

  function ProductsController(deviceManager) {
    (0, _classCallCheck3.default)(this, ProductsController);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ProductsController.__proto__ || (0, _getPrototypeOf2.default)(ProductsController)).call(this));

    _this._deviceManager = deviceManager;
    return _this;
  }

  (0, _createClass3.default)(ProductsController, [{
    key: 'getProducts',
    // eslint-disable-next-line class-methods-use-this
    value: function getProducts() {
      throw new _HttpError2.default('not supported in the current server version');
    }
  }, {
    key: 'createProduct',
    // eslint-disable-next-line class-methods-use-this
    value: function createProduct() {
      throw new _HttpError2.default('not supported in the current server version');
    }
  }, {
    key: 'getProduct',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(productIdOrSlug) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                throw new _HttpError2.default('Not implemented');

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getProduct(_x) {
        return _ref.apply(this, arguments);
      }

      return getProduct;
    }()
  }, {
    key: 'generateClaimCode',
    // eslint-disable-next-line class-methods-use-this
    value: function generateClaimCode(productIdOrSlug) {
      throw new _HttpError2.default('not supported in the current server version');
    }
  }, {
    key: 'getFirmware',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(productIdOrSlug) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                throw new _HttpError2.default('Not implemented');

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getFirmware(_x2) {
        return _ref2.apply(this, arguments);
      }

      return getFirmware;
    }()

    // {version: number, name: 'current', binary: File, title: string, description: string}

  }, {
    key: 'getFirmware',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(productIdOrSlug) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                throw new _HttpError2.default('Not implemented');

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getFirmware(_x3) {
        return _ref3.apply(this, arguments);
      }

      return getFirmware;
    }()
  }, {
    key: 'getDevices',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(productIdOrSlug) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                throw new _HttpError2.default('Not implemented');

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getDevices(_x4) {
        return _ref4.apply(this, arguments);
      }

      return getDevices;
    }()
  }, {
    key: 'setFirmwareVersion',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(productIdOrSlug, deviceID, body) {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                throw new _HttpError2.default('Not implemented');

              case 1:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function setFirmwareVersion(_x5, _x6, _x7) {
        return _ref5.apply(this, arguments);
      }

      return setFirmwareVersion;
    }()
  }, {
    key: 'removeDeviceFromProduct',
    // eslint-disable-next-line class-methods-use-this
    value: function removeDeviceFromProduct(productIdOrSlug, deviceID) {
      throw new _HttpError2.default('not supported in the current server version');
    }
  }, {
    key: 'getConfig',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(productIdOrSlug) {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                throw new _HttpError2.default('Not implemented');

              case 1:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getConfig(_x8) {
        return _ref6.apply(this, arguments);
      }

      return getConfig;
    }()
  }, {
    key: 'getEvents',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(productIdOrSlug, eventName) {
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                throw new _HttpError2.default('Not implemented');

              case 1:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function getEvents(_x9, _x10) {
        return _ref7.apply(this, arguments);
      }

      return getEvents;
    }()
  }, {
    key: 'removeTeamMember',
    // eslint-disable-next-line class-methods-use-this
    value: function removeTeamMember(productIdOrSlug, username) {
      throw new _HttpError2.default('not supported in the current server version');
    }
  }]);
  return ProductsController;
}(_Controller3.default), (_applyDecoratedDescriptor(_class.prototype, 'getProduct', [_dec, _dec2], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getProduct'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getFirmware', [_dec3, _dec4], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getFirmware'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getFirmware', [_dec5, _dec6], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getFirmware'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getDevices', [_dec7, _dec8], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getDevices'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'setFirmwareVersion', [_dec9, _dec10], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'setFirmwareVersion'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getConfig', [_dec11, _dec12], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getConfig'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getEvents', [_dec13, _dec14], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getEvents'), _class.prototype)), _class));
exports.default = ProductsController;
/* eslint-enable */