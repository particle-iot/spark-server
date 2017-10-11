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

var _dec, _dec2, _desc, _value, _class;

var _Controller2 = require('./Controller');

var _Controller3 = _interopRequireDefault(_Controller2);

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

var DeviceClaimsController = (_dec = (0, _httpVerb2.default)('post'), _dec2 = (0, _route2.default)('/v1/device_claims'), (_class = function (_Controller) {
  (0, _inherits3.default)(DeviceClaimsController, _Controller);

  function DeviceClaimsController(deviceManager, claimCodeManager) {
    (0, _classCallCheck3.default)(this, DeviceClaimsController);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DeviceClaimsController.__proto__ || (0, _getPrototypeOf2.default)(DeviceClaimsController)).call(this));

    _this._deviceManager = deviceManager;
    _this._claimCodeManager = claimCodeManager;
    return _this;
  }

  (0, _createClass3.default)(DeviceClaimsController, [{
    key: 'createClaimCode',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var claimCode, devices, deviceIDs;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                claimCode = this._claimCodeManager.createClaimCode(this.user.id);
                _context.next = 3;
                return this._deviceManager.getAll();

              case 3:
                devices = _context.sent;
                deviceIDs = devices.map(function (device) {
                  return device.deviceID;
                });
                return _context.abrupt('return', this.ok({ claim_code: claimCode, device_ids: deviceIDs }));

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function createClaimCode() {
        return _ref.apply(this, arguments);
      }

      return createClaimCode;
    }()
  }]);
  return DeviceClaimsController;
}(_Controller3.default), (_applyDecoratedDescriptor(_class.prototype, 'createClaimCode', [_dec, _dec2], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'createClaimCode'), _class.prototype)), _class));
exports.default = DeviceClaimsController;