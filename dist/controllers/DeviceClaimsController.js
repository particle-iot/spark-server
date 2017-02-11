

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
  _desc,
  _value,
  _class;

const _Controller2 = require('./Controller');

const _Controller3 = _interopRequireDefault(_Controller2);

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

const DeviceClaimsController = (_dec = (0, _httpVerb2.default)('post'), _dec2 = (0, _route2.default)('/v1/device_claims'), (_class = (function (_Controller) {
  (0, _inherits3.default)(DeviceClaimsController, _Controller);

  function DeviceClaimsController(deviceManager, claimCodeManager) {
    (0, _classCallCheck3.default)(this, DeviceClaimsController);

    const _this = (0, _possibleConstructorReturn3.default)(this, (DeviceClaimsController.__proto__ || (0, _getPrototypeOf2.default)(DeviceClaimsController)).call(this));

    _this._deviceManager = deviceManager;
    _this._claimCodeManager = claimCodeManager;
    return _this;
  }

  (0, _createClass3.default)(DeviceClaimsController, [{
    key: 'createClaimCode',
    value: (function () {
      const _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        let claimCode,
          devices,
          deviceIDs;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                claimCode = this._claimCodeManager.createClaimCode(this.user.id);
                _context.next = 3;
                return this._deviceManager.getAll(this.user.id);

              case 3:
                devices = _context.sent;
                deviceIDs = devices.map(device => device.deviceID);
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
    }()),
  }]);
  return DeviceClaimsController;
}(_Controller3.default)), (_applyDecoratedDescriptor(_class.prototype, 'createClaimCode', [_dec, _dec2], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'createClaimCode'), _class.prototype)), _class));
exports.default = DeviceClaimsController;
