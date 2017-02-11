

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

const _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

const _extends2 = require('babel-runtime/helpers/extends');

const _extends3 = _interopRequireDefault(_extends2);

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
  _dec7,
  _dec8,
  _dec9,
  _dec10,
  _dec11,
  _dec12,
  _dec13,
  _dec14,
  _dec15,
  _dec16,
  _dec17,
  _dec18,
  _dec19,
  _dec20,
  _desc,
  _value,
  _class;

const _nullthrows = require('nullthrows');

const _nullthrows2 = _interopRequireDefault(_nullthrows);

const _Controller2 = require('./Controller');

const _Controller3 = _interopRequireDefault(_Controller2);

const _HttpError = require('../lib/HttpError');

const _HttpError2 = _interopRequireDefault(_HttpError);

const _FirmwareCompilationManager = require('../managers/FirmwareCompilationManager');

const _FirmwareCompilationManager2 = _interopRequireDefault(_FirmwareCompilationManager);

const _allowUpload = require('../decorators/allowUpload');

const _allowUpload2 = _interopRequireDefault(_allowUpload);

const _httpVerb = require('../decorators/httpVerb');

const _httpVerb2 = _interopRequireDefault(_httpVerb);

const _route = require('../decorators/route');

const _route2 = _interopRequireDefault(_route);

const _deviceToAPI = require('../lib/deviceToAPI');

const _deviceToAPI2 = _interopRequireDefault(_deviceToAPI);

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

const DevicesController = (_dec = (0, _httpVerb2.default)('post'), _dec2 = (0, _route2.default)('/v1/devices'), _dec3 = (0, _httpVerb2.default)('get'), _dec4 = (0, _route2.default)('/v1/binaries/:binaryID'), _dec5 = (0, _httpVerb2.default)('post'), _dec6 = (0, _route2.default)('/v1/binaries'), _dec7 = (0, _allowUpload2.default)(), _dec8 = (0, _httpVerb2.default)('delete'), _dec9 = (0, _route2.default)('/v1/devices/:deviceID'), _dec10 = (0, _httpVerb2.default)('get'), _dec11 = (0, _route2.default)('/v1/devices'), _dec12 = (0, _httpVerb2.default)('get'), _dec13 = (0, _route2.default)('/v1/devices/:deviceID'), _dec14 = (0, _httpVerb2.default)('get'), _dec15 = (0, _route2.default)('/v1/devices/:deviceID/:varName/'), _dec16 = (0, _httpVerb2.default)('put'), _dec17 = (0, _route2.default)('/v1/devices/:deviceID'), _dec18 = (0, _allowUpload2.default)('file', 1), _dec19 = (0, _httpVerb2.default)('post'), _dec20 = (0, _route2.default)('/v1/devices/:deviceID/:functionName'), (_class = (function (_Controller) {
  (0, _inherits3.default)(DevicesController, _Controller);

  function DevicesController(deviceManager) {
    (0, _classCallCheck3.default)(this, DevicesController);

    const _this = (0, _possibleConstructorReturn3.default)(this, (DevicesController.__proto__ || (0, _getPrototypeOf2.default)(DevicesController)).call(this));

    _this._deviceManager = deviceManager;
    return _this;
  }

  (0, _createClass3.default)(DevicesController, [{
    key: 'claimDevice',
    value: (function () {
      const _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(postBody) {
        let deviceID;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                deviceID = postBody.id;
                _context.next = 3;
                return this._deviceManager.claimDevice(deviceID, this.user.id);

              case 3:
                return _context.abrupt('return', this.ok({ ok: true }));

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function claimDevice(_x) {
        return _ref.apply(this, arguments);
      }

      return claimDevice;
    }()),
  }, {
    key: 'getAppFirmware',
    value: (function () {
      const _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(binaryID) {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', this.ok(_FirmwareCompilationManager2.default.getBinaryForID(binaryID)));

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getAppFirmware(_x2) {
        return _ref2.apply(this, arguments);
      }

      return getAppFirmware;
    }()),
  }, {
    key: 'compileSources',
    value: (function () {
      const _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(postBody) {
        let response;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _FirmwareCompilationManager2.default.compileSource((0, _nullthrows2.default)(postBody.platform_id || postBody.product_id), this.request.files);

              case 2:
                response = _context3.sent;

                if (response) {
                  _context3.next = 5;
                  break;
                }

                throw new _HttpError2.default('Error during compilation');

              case 5:
                return _context3.abrupt('return', this.ok((0, _extends3.default)({}, response, {
                  binary_url: `/v1/binaries/${response.binary_id}`,
                  ok: true,
                })));

              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function compileSources(_x3) {
        return _ref3.apply(this, arguments);
      }

      return compileSources;
    }()),
  }, {
    key: 'unclaimDevice',
    value: (function () {
      const _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(deviceID) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this._deviceManager.unclaimDevice(deviceID, this.user.id);

              case 2:
                return _context4.abrupt('return', this.ok({ ok: true }));

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function unclaimDevice(_x4) {
        return _ref4.apply(this, arguments);
      }

      return unclaimDevice;
    }()),
  }, {
    key: 'getDevices',
    value: (function () {
      const _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
        let devices;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _context5.next = 3;
                return this._deviceManager.getAll(this.user.id);

              case 3:
                devices = _context5.sent;
                return _context5.abrupt('return', this.ok(devices.map(device => (0, _deviceToAPI2.default)(device))));

              case 7:
                _context5.prev = 7;
                _context5.t0 = _context5.catch(0);
                return _context5.abrupt('return', this.ok([]));

              case 10:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[0, 7]]);
      }));

      function getDevices() {
        return _ref5.apply(this, arguments);
      }

      return getDevices;
    }()),
  }, {
    key: 'getDevice',
    value: (function () {
      const _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(deviceID) {
        let device;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this._deviceManager.getDetailsByID(deviceID, this.user.id);

              case 2:
                device = _context6.sent;
                return _context6.abrupt('return', this.ok((0, _deviceToAPI2.default)(device)));

              case 4:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getDevice(_x5) {
        return _ref6.apply(this, arguments);
      }

      return getDevice;
    }()),
  }, {
    key: 'getVariableValue',
    value: (function () {
      const _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(deviceID, varName) {
        let varValue,
          errorMessage;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.prev = 0;
                _context7.next = 3;
                return this._deviceManager.getVariableValue(deviceID, this.user.id, varName);

              case 3:
                varValue = _context7.sent;
                return _context7.abrupt('return', this.ok({ result: varValue }));

              case 7:
                _context7.prev = 7;
                _context7.t0 = _context7.catch(0);
                errorMessage = _context7.t0.message;

                if (!errorMessage.match('Variable not found')) {
                  _context7.next = 12;
                  break;
                }

                throw new _HttpError2.default('Variable not found', 404);

              case 12:
                throw _context7.t0;

              case 13:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this, [[0, 7]]);
      }));

      function getVariableValue(_x6, _x7) {
        return _ref7.apply(this, arguments);
      }

      return getVariableValue;
    }()),
  }, {
    key: 'updateDevice',
    value: (function () {
      const _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(deviceID, postBody) {
        let updatedAttributes,
          flashStatus,
          file,
          _flashStatus;

        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!postBody.name) {
                  _context8.next = 5;
                  break;
                }

                _context8.next = 3;
                return this._deviceManager.renameDevice(deviceID, this.user.id, postBody.name);

              case 3:
                updatedAttributes = _context8.sent;
                return _context8.abrupt('return', this.ok({ name: updatedAttributes.name, ok: true }));

              case 5:
                if (!postBody.app_id) {
                  _context8.next = 10;
                  break;
                }

                _context8.next = 8;
                return this._deviceManager.flashKnownApp(deviceID, this.user.id, postBody.app_id);

              case 8:
                flashStatus = _context8.sent;
                return _context8.abrupt('return', this.ok({ id: deviceID, status: flashStatus }));

              case 10:
                if (!(this.request.files && !this.request.files.file)) {
                  _context8.next = 12;
                  break;
                }

                throw new Error('Firmware file not provided');

              case 12:
                file = this.request.files && this.request.files.file[0];

                if (!(file && file.originalname.endsWith('.bin'))) {
                  _context8.next = 18;
                  break;
                }

                _context8.next = 16;
                return this._deviceManager.flashBinary(deviceID, file);

              case 16:
                _flashStatus = _context8.sent;
                return _context8.abrupt('return', this.ok({ id: deviceID, status: _flashStatus }));

              case 18:
                if (!postBody.signal) {
                  _context8.next = 24;
                  break;
                }

                if (['1', '0'].includes(postBody.signal)) {
                  _context8.next = 21;
                  break;
                }

                throw new _HttpError2.default('Wrong signal value');

              case 21:
                _context8.next = 23;
                return this._deviceManager.raiseYourHand(deviceID, this.user.id, !!parseInt(postBody.signal, 10));

              case 23:
                return _context8.abrupt('return', this.ok({ id: deviceID, ok: true }));

              case 24:
                throw new _HttpError2.default('Did not update device');

              case 25:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function updateDevice(_x8, _x9) {
        return _ref8.apply(this, arguments);
      }

      return updateDevice;
    }()),
  }, {
    key: 'callDeviceFunction',
    value: (function () {
      const _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(deviceID, functionName, postBody) {
        let result,
          device,
          errorMessage;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.prev = 0;
                _context9.next = 3;
                return this._deviceManager.callFunction(deviceID, this.user.id, functionName, postBody);

              case 3:
                result = _context9.sent;
                _context9.next = 6;
                return this._deviceManager.getByID(deviceID, this.user.id);

              case 6:
                device = _context9.sent;
                return _context9.abrupt('return', this.ok((0, _deviceToAPI2.default)(device, result)));

              case 10:
                _context9.prev = 10;
                _context9.t0 = _context9.catch(0);
                errorMessage = _context9.t0.message;

                if (!(errorMessage.indexOf('Unknown Function') >= 0)) {
                  _context9.next = 15;
                  break;
                }

                throw new _HttpError2.default('Function not found', 404);

              case 15:
                throw _context9.t0;

              case 16:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this, [[0, 10]]);
      }));

      function callDeviceFunction(_x10, _x11, _x12) {
        return _ref9.apply(this, arguments);
      }

      return callDeviceFunction;
    }()),
  }]);
  return DevicesController;
}(_Controller3.default)), (_applyDecoratedDescriptor(_class.prototype, 'claimDevice', [_dec, _dec2], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'claimDevice'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getAppFirmware', [_dec3, _dec4], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getAppFirmware'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'compileSources', [_dec5, _dec6, _dec7], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'compileSources'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'unclaimDevice', [_dec8, _dec9], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'unclaimDevice'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getDevices', [_dec10, _dec11], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getDevices'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getDevice', [_dec12, _dec13], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getDevice'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getVariableValue', [_dec14, _dec15], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getVariableValue'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'updateDevice', [_dec16, _dec17, _dec18], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'updateDevice'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'callDeviceFunction', [_dec19, _dec20], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'callDeviceFunction'), _class.prototype)), _class));
exports.default = DevicesController;
