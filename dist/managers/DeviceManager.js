'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _sparkProtocol = require('spark-protocol');

var _nodeRsa = require('node-rsa');

var _nodeRsa2 = _interopRequireDefault(_nodeRsa);

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DeviceManager = function DeviceManager(deviceAttributeRepository, deviceFirmwareRepository, deviceKeyRepository, permissionManager, eventPublisher) {
  var _this = this;

  (0, _classCallCheck3.default)(this, DeviceManager);

  this.claimDevice = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(deviceID, userID) {
      var deviceAttributes;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this._deviceAttributeRepository.getByID(deviceID);

            case 2:
              deviceAttributes = _context.sent;

              if (deviceAttributes) {
                _context.next = 5;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 5:
              if (!(deviceAttributes.ownerID && deviceAttributes.ownerID !== userID)) {
                _context.next = 7;
                break;
              }

              throw new _HttpError2.default('The device belongs to someone else.');

            case 7:
              if (!(deviceAttributes.ownerID && deviceAttributes.ownerID === userID)) {
                _context.next = 9;
                break;
              }

              throw new _HttpError2.default('The device is already claimed.');

            case 9:
              _context.next = 11;
              return _this._deviceAttributeRepository.updateByID(deviceID, { ownerID: userID });

            case 11:
              return _context.abrupt('return', _context.sent);

            case 12:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  this.unclaimDevice = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(deviceID) {
      var deviceAttributes;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this._permissionManager.getEntityByID('deviceAttributes', deviceID);

            case 2:
              deviceAttributes = _context2.sent;

              if (deviceAttributes) {
                _context2.next = 5;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 5:
              _context2.next = 7;
              return _this._deviceAttributeRepository.updateByID(deviceID, { ownerID: null });

            case 7:
              return _context2.abrupt('return', _context2.sent);

            case 8:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x3) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.getByID = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(deviceID) {
      var attributes, pingResponse;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this._permissionManager.getEntityByID('deviceAttributes', deviceID);

            case 2:
              attributes = _context3.sent;

              if (attributes) {
                _context3.next = 5;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 5:
              _context3.next = 7;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.PING_DEVICE
              });

            case 7:
              pingResponse = _context3.sent;
              return _context3.abrupt('return', (0, _extends3.default)({}, attributes, {
                connected: pingResponse.connected || false,
                lastFlashedAppName: null,
                lastHeard: pingResponse.lastPing || attributes.lastHeard
              }));

            case 9:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x4) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.getDetailsByID = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(deviceID) {
      var _ref5, _ref6, attributes, description, pingResponse;

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _promise2.default.all([_this._permissionManager.getEntityByID('deviceAttributes', deviceID), _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.GET_DEVICE_DESCRIPTION
              }), _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.PING_DEVICE })]);

            case 2:
              _ref5 = _context4.sent;
              _ref6 = (0, _slicedToArray3.default)(_ref5, 3);
              attributes = _ref6[0];
              description = _ref6[1];
              pingResponse = _ref6[2];

              if (attributes) {
                _context4.next = 9;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 9:
              return _context4.abrupt('return', (0, _extends3.default)({}, attributes, {
                connected: pingResponse.connected,
                functions: description.state ? description.state.f : null,
                lastFlashedAppName: null,
                lastHeard: pingResponse.lastPing || attributes.lastHeard,
                variables: description.state ? description.state.v : null
              }));

            case 10:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x5) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.getAll = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
    var devicesAttributes, devicePromises;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return _this._permissionManager.getAllEntitiesForCurrentUser('deviceAttributes');

          case 2:
            devicesAttributes = _context6.sent;
            devicePromises = devicesAttributes.map(function () {
              var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(attributes) {
                var pingResponse;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        _context5.next = 2;
                        return _this._eventPublisher.publishAndListenForResponse({
                          context: { deviceID: attributes.deviceID },
                          name: _sparkProtocol.SPARK_SERVER_EVENTS.PING_DEVICE
                        });

                      case 2:
                        pingResponse = _context5.sent;
                        return _context5.abrupt('return', (0, _extends3.default)({}, attributes, {
                          connected: pingResponse.connected || false,
                          lastFlashedAppName: null,
                          lastHeard: pingResponse.lastPing || attributes.lastHeard
                        }));

                      case 4:
                      case 'end':
                        return _context5.stop();
                    }
                  }
                }, _callee5, _this);
              }));

              return function (_x6) {
                return _ref8.apply(this, arguments);
              };
            }());
            return _context6.abrupt('return', _promise2.default.all(devicePromises));

          case 5:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, _this);
  }));

  this.callFunction = function () {
    var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(deviceID, functionName, functionArguments) {
      var callFunctionResponse, error;
      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _this._permissionManager.checkPermissionsForEntityByID('deviceAttributes', deviceID);

            case 2:
              _context7.next = 4;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID, functionArguments: functionArguments, functionName: functionName },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.CALL_DEVICE_FUNCTION
              });

            case 4:
              callFunctionResponse = _context7.sent;
              error = callFunctionResponse.error;

              if (!error) {
                _context7.next = 8;
                break;
              }

              throw new _HttpError2.default(error);

            case 8:
              return _context7.abrupt('return', callFunctionResponse);

            case 9:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this);
    }));

    return function (_x7, _x8, _x9) {
      return _ref9.apply(this, arguments);
    };
  }();

  this.getVariableValue = function () {
    var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(deviceID, variableName) {
      var getVariableResponse, error, result;
      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _this._permissionManager.checkPermissionsForEntityByID('deviceAttributes', deviceID);

            case 2:
              _context8.next = 4;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID, variableName: variableName },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.GET_DEVICE_VARIABLE_VALUE
              });

            case 4:
              getVariableResponse = _context8.sent;
              error = getVariableResponse.error, result = getVariableResponse.result;

              if (!error) {
                _context8.next = 8;
                break;
              }

              throw new _HttpError2.default(error);

            case 8:
              return _context8.abrupt('return', result);

            case 9:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this);
    }));

    return function (_x10, _x11) {
      return _ref10.apply(this, arguments);
    };
  }();

  this.flashBinary = function () {
    var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(deviceID, file) {
      var flashResponse, error;
      return _regenerator2.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return _this._permissionManager.checkPermissionsForEntityByID('deviceAttributes', deviceID);

            case 2:
              _context9.next = 4;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID, fileBuffer: file.buffer },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.FLASH_DEVICE
              });

            case 4:
              flashResponse = _context9.sent;
              error = flashResponse.error;

              if (!error) {
                _context9.next = 8;
                break;
              }

              throw new _HttpError2.default(error);

            case 8:
              return _context9.abrupt('return', flashResponse);

            case 9:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, _this);
    }));

    return function (_x12, _x13) {
      return _ref11.apply(this, arguments);
    };
  }();

  this.flashKnownApp = function () {
    var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(deviceID, appName) {
      var knownFirmware, flashResponse, error;
      return _regenerator2.default.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return _this._permissionManager.checkPermissionsForEntityByID('deviceAttributes', deviceID);

            case 2:
              knownFirmware = _this._deviceFirmwareRepository.getByName(appName);

              if (knownFirmware) {
                _context10.next = 5;
                break;
              }

              throw new _HttpError2.default('No firmware ' + appName + ' found', 404);

            case 5:
              _context10.next = 7;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID, fileBuffer: knownFirmware },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.FLASH_DEVICE
              });

            case 7:
              flashResponse = _context10.sent;
              error = flashResponse.error;

              if (!error) {
                _context10.next = 11;
                break;
              }

              throw new _HttpError2.default(error);

            case 11:
              return _context10.abrupt('return', flashResponse);

            case 12:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, _this);
    }));

    return function (_x14, _x15) {
      return _ref12.apply(this, arguments);
    };
  }();

  this.provision = function () {
    var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(deviceID, userID, publicKey, algorithm) {
      var createdKey;
      return _regenerator2.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              if (!(algorithm === 'ecc')) {
                _context11.next = 2;
                break;
              }

              return _context11.abrupt('return', null);

            case 2:
              _context11.prev = 2;
              createdKey = new _nodeRsa2.default(publicKey, 'pkcs1-public-pem', {
                encryptionScheme: 'pkcs1',
                signingScheme: 'pkcs1'
              });

              if (createdKey.isPublic()) {
                _context11.next = 6;
                break;
              }

              throw new _HttpError2.default('Not a public key');

            case 6:
              _context11.next = 11;
              break;

            case 8:
              _context11.prev = 8;
              _context11.t0 = _context11['catch'](2);
              throw new _HttpError2.default('Key error ' + _context11.t0);

            case 11:
              _context11.next = 13;
              return _this._deviceKeyRepository.updateByID(deviceID, {
                deviceID: deviceID,
                key: publicKey
              });

            case 13:
              _context11.next = 15;
              return _this._deviceAttributeRepository.updateByID(deviceID, {
                ownerID: userID,
                registrar: userID,
                timestamp: new Date()
              });

            case 15:
              _context11.next = 17;
              return _this.getByID(deviceID);

            case 17:
              return _context11.abrupt('return', _context11.sent);

            case 18:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this, [[2, 8]]);
    }));

    return function (_x16, _x17, _x18, _x19) {
      return _ref13.apply(this, arguments);
    };
  }();

  this.raiseYourHand = function () {
    var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(deviceID, shouldShowSignal) {
      var raiseYourHandResponse, error;
      return _regenerator2.default.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return _this._permissionManager.checkPermissionsForEntityByID('deviceAttributes', deviceID);

            case 2:
              _context12.next = 4;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID, shouldShowSignal: shouldShowSignal },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.RAISE_YOUR_HAND
              });

            case 4:
              raiseYourHandResponse = _context12.sent;
              error = raiseYourHandResponse.error;

              if (!error) {
                _context12.next = 8;
                break;
              }

              throw new _HttpError2.default(error);

            case 8:
              return _context12.abrupt('return', raiseYourHandResponse);

            case 9:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this);
    }));

    return function (_x20, _x21) {
      return _ref14.apply(this, arguments);
    };
  }();

  this.renameDevice = function () {
    var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(deviceID, name) {
      var attributes;
      return _regenerator2.default.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return _this._permissionManager.getEntityByID('deviceAttributes', deviceID);

            case 2:
              attributes = _context13.sent;

              if (attributes) {
                _context13.next = 5;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 5:
              _context13.next = 7;
              return _this._deviceAttributeRepository.updateByID(deviceID, { name: name });

            case 7:
              return _context13.abrupt('return', _context13.sent);

            case 8:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this);
    }));

    return function (_x22, _x23) {
      return _ref15.apply(this, arguments);
    };
  }();

  this._deviceAttributeRepository = deviceAttributeRepository;
  this._deviceFirmwareRepository = deviceFirmwareRepository;
  this._deviceKeyRepository = deviceKeyRepository;
  this._permissionManager = permissionManager;
  this._eventPublisher = eventPublisher;
};

exports.default = DeviceManager;