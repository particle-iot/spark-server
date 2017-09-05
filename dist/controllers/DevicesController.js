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

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _desc, _value, _class;

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

var _Controller2 = require('./Controller');

var _Controller3 = _interopRequireDefault(_Controller2);

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

var _FirmwareCompilationManager = require('../managers/FirmwareCompilationManager');

var _FirmwareCompilationManager2 = _interopRequireDefault(_FirmwareCompilationManager);

var _allowUpload = require('../decorators/allowUpload');

var _allowUpload2 = _interopRequireDefault(_allowUpload);

var _httpVerb = require('../decorators/httpVerb');

var _httpVerb2 = _interopRequireDefault(_httpVerb);

var _route = require('../decorators/route');

var _route2 = _interopRequireDefault(_route);

var _deviceToAPI = require('../lib/deviceToAPI');

var _deviceToAPI2 = _interopRequireDefault(_deviceToAPI);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

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

var logger = _logger2.default.createModuleLogger(module);

var DevicesController = (_dec = (0, _httpVerb2.default)('post'), _dec2 = (0, _route2.default)('/v1/devices'), _dec3 = (0, _httpVerb2.default)('get'), _dec4 = (0, _route2.default)('/v1/binaries/:binaryID'), _dec5 = (0, _httpVerb2.default)('post'), _dec6 = (0, _route2.default)('/v1/binaries'), _dec7 = (0, _allowUpload2.default)(), _dec8 = (0, _httpVerb2.default)('delete'), _dec9 = (0, _route2.default)('/v1/devices/:deviceID'), _dec10 = (0, _httpVerb2.default)('get'), _dec11 = (0, _route2.default)('/v1/devices'), _dec12 = (0, _httpVerb2.default)('get'), _dec13 = (0, _route2.default)('/v1/devices/:deviceID'), _dec14 = (0, _httpVerb2.default)('get'), _dec15 = (0, _route2.default)('/v1/devices/:deviceID/:varName/'), _dec16 = (0, _httpVerb2.default)('put'), _dec17 = (0, _route2.default)('/v1/devices/:deviceID'), _dec18 = (0, _allowUpload2.default)('file', 1), _dec19 = (0, _httpVerb2.default)('post'), _dec20 = (0, _route2.default)('/v1/devices/:deviceID/:functionName'), _dec21 = (0, _httpVerb2.default)('put'), _dec22 = (0, _route2.default)('/v1/devices/:deviceID/ping'), (_class = function (_Controller) {
  (0, _inherits3.default)(DevicesController, _Controller);

  function DevicesController(deviceManager) {
    (0, _classCallCheck3.default)(this, DevicesController);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DevicesController.__proto__ || (0, _getPrototypeOf2.default)(DevicesController)).call(this));

    _this._deviceManager = deviceManager;
    return _this;
  }

  (0, _createClass3.default)(DevicesController, [{
    key: 'claimDevice',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(postBody) {
        var deviceID;
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
    }()
  }, {
    key: 'getAppFirmware',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(binaryID) {
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
    }()
  }, {
    key: 'compileSources',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(postBody) {
        var response;
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
                  binary_url: '/v1/binaries/' + response.binary_id,
                  ok: true
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
    }()
  }, {
    key: 'unclaimDevice',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(deviceID) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this._deviceManager.unclaimDevice(deviceID);

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
    }()
  }, {
    key: 'getDevices',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var devices;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.prev = 0;
                _context5.next = 3;
                return this._deviceManager.getAll();

              case 3:
                devices = _context5.sent;
                return _context5.abrupt('return', this.ok(devices.map(function (device) {
                  return (0, _deviceToAPI2.default)(device);
                })));

              case 7:
                _context5.prev = 7;
                _context5.t0 = _context5['catch'](0);

                // I wish we could return no devices found but meh :/
                // at least we should issue a warning
                logger.warn({ err: _context5.t0 }, 'get devices throws error, possibly no devices found?');
                return _context5.abrupt('return', this.ok([]));

              case 11:
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
    }()
  }, {
    key: 'getDevice',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(deviceID) {
        var device;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this._deviceManager.getByID(deviceID);

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
    }()
  }, {
    key: 'getVariableValue',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(deviceID, varName) {
        var varValue, errorMessage;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.prev = 0;
                _context7.next = 3;
                return this._deviceManager.getVariableValue(deviceID, varName);

              case 3:
                varValue = _context7.sent;
                return _context7.abrupt('return', this.ok({ result: varValue }));

              case 7:
                _context7.prev = 7;
                _context7.t0 = _context7['catch'](0);
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
    }()
  }, {
    key: 'updateDevice',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(deviceID, postBody) {
        var updatedAttributes, flashResult, file, _flashResult;

        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (!postBody.name) {
                  _context8.next = 5;
                  break;
                }

                _context8.next = 3;
                return this._deviceManager.renameDevice(deviceID, postBody.name);

              case 3:
                updatedAttributes = _context8.sent;
                return _context8.abrupt('return', this.ok({ name: updatedAttributes.name, ok: true }));

              case 5:
                if (!postBody.signal) {
                  _context8.next = 11;
                  break;
                }

                if (['1', '0'].includes(postBody.signal)) {
                  _context8.next = 8;
                  break;
                }

                throw new _HttpError2.default('Wrong signal value');

              case 8:
                _context8.next = 10;
                return this._deviceManager.raiseYourHand(deviceID, !!parseInt(postBody.signal, 10));

              case 10:
                return _context8.abrupt('return', this.ok({ id: deviceID, ok: true }));

              case 11:
                if (!postBody.app_id) {
                  _context8.next = 16;
                  break;
                }

                _context8.next = 14;
                return this._deviceManager.flashKnownApp(deviceID, postBody.app_id);

              case 14:
                flashResult = _context8.sent;
                return _context8.abrupt('return', this.ok({ id: deviceID, status: flashResult.status }));

              case 16:

                // 4 flash device with custom application
                file = postBody.file;

                if (file) {
                  _context8.next = 19;
                  break;
                }

                throw new Error('Firmware file not provided');

              case 19:
                if (!(file.originalname === 'binary' || file.originalname.endsWith('.bin'))) {
                  _context8.next = 24;
                  break;
                }

                _context8.next = 22;
                return this._deviceManager.flashBinary(deviceID, file);

              case 22:
                _flashResult = _context8.sent;
                return _context8.abrupt('return', this.ok({ id: deviceID, status: _flashResult.status }));

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
    }()
  }, {
    key: 'callDeviceFunction',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(deviceID, functionName, postBody) {
        var result, device, errorMessage;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.prev = 0;
                _context9.next = 3;
                return this._deviceManager.callFunction(deviceID, functionName, postBody);

              case 3:
                result = _context9.sent;
                _context9.next = 6;
                return this._deviceManager.getByID(deviceID);

              case 6:
                device = _context9.sent;
                return _context9.abrupt('return', this.ok((0, _deviceToAPI2.default)(device, result)));

              case 10:
                _context9.prev = 10;
                _context9.t0 = _context9['catch'](0);
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
    }()
  }, {
    key: 'pingDevice',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(deviceID) {
        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.t0 = this;
                _context10.next = 3;
                return this._deviceManager.ping(deviceID);

              case 3:
                _context10.t1 = _context10.sent;
                return _context10.abrupt('return', _context10.t0.ok.call(_context10.t0, _context10.t1));

              case 5:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function pingDevice(_x13) {
        return _ref10.apply(this, arguments);
      }

      return pingDevice;
    }()
  }]);
  return DevicesController;
}(_Controller3.default), (_applyDecoratedDescriptor(_class.prototype, 'claimDevice', [_dec, _dec2], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'claimDevice'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getAppFirmware', [_dec3, _dec4], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getAppFirmware'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'compileSources', [_dec5, _dec6, _dec7], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'compileSources'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'unclaimDevice', [_dec8, _dec9], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'unclaimDevice'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getDevices', [_dec10, _dec11], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getDevices'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getDevice', [_dec12, _dec13], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getDevice'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getVariableValue', [_dec14, _dec15], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getVariableValue'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'updateDevice', [_dec16, _dec17, _dec18], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'updateDevice'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'callDeviceFunction', [_dec19, _dec20], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'callDeviceFunction'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'pingDevice', [_dec21, _dec22], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'pingDevice'), _class.prototype)), _class));
exports.default = DevicesController;