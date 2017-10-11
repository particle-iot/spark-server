'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _ecKey = require('ec-key');

var _ecKey2 = _interopRequireDefault(_ecKey);

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
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(deviceID, userID) {
      var attributes;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this._deviceAttributeRepository.getByID(deviceID);

            case 2:
              attributes = _context.sent;

              if (attributes) {
                _context.next = 5;
                break;
              }

              return _context.abrupt('return', _this._deviceAttributeRepository.updateByID(deviceID, {
                deviceID: deviceID,
                ownerID: userID,
                registrar: userID
              }));

            case 5:
              if (!(attributes.ownerID && attributes.ownerID !== userID)) {
                _context.next = 7;
                break;
              }

              throw new _HttpError2.default('The device belongs to someone else.');

            case 7:
              if (!(attributes.ownerID && attributes.ownerID === userID)) {
                _context.next = 9;
                break;
              }

              throw new _HttpError2.default('The device is already claimed.');

            case 9:
              _context.next = 11;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { attributes: { ownerID: userID }, deviceID: deviceID },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.UPDATE_DEVICE_ATTRIBUTES
              });

            case 11:
              return _context.abrupt('return', _this._deviceAttributeRepository.updateByID(deviceID, {
                ownerID: userID
              }));

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
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(deviceID) {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this.getByID(deviceID);

            case 2:
              _context2.next = 4;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { attributes: { ownerID: null }, deviceID: deviceID },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.UPDATE_DEVICE_ATTRIBUTES
              });

            case 4:
              return _context2.abrupt('return', _this._deviceAttributeRepository.updateByID(deviceID, {
                ownerID: null
              }));

            case 5:
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

  this.getAttributesByID = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(deviceID) {
      var _ref4, connected, attributes;

      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this.getByID(deviceID);

            case 2:
              _ref4 = _context3.sent;
              connected = _ref4.connected;
              attributes = (0, _objectWithoutProperties3.default)(_ref4, ['connected']);
              return _context3.abrupt('return', attributes);

            case 6:
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

  this.getByID = function () {
    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(deviceID) {
      var connectedDeviceAttributes, attributes;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.GET_DEVICE_ATTRIBUTES
              });

            case 2:
              connectedDeviceAttributes = _context4.sent;

              if (!(!connectedDeviceAttributes.error && _this._permissionManager.doesUserHaveAccess(connectedDeviceAttributes))) {
                _context4.next = 7;
                break;
              }

              _context4.t0 = connectedDeviceAttributes;
              _context4.next = 10;
              break;

            case 7:
              _context4.next = 9;
              return _this._permissionManager.getEntityByID('deviceAttributes', deviceID);

            case 9:
              _context4.t0 = _context4.sent;

            case 10:
              attributes = _context4.t0;

              if (attributes) {
                _context4.next = 13;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 13:
              return _context4.abrupt('return', (0, _extends3.default)({}, attributes, {
                connected: !connectedDeviceAttributes.error,
                lastFlashedAppName: null
              }));

            case 14:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x5) {
      return _ref5.apply(this, arguments);
    };
  }();

  this.getAll = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
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
              var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(attributes) {
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
                          lastHeard: pingResponse.lastHeard || attributes.lastHeard
                        }));

                      case 4:
                      case 'end':
                        return _context5.stop();
                    }
                  }
                }, _callee5, _this);
              }));

              return function (_x6) {
                return _ref7.apply(this, arguments);
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
    var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(deviceID, functionName, functionArguments) {
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
      return _ref8.apply(this, arguments);
    };
  }();

  this.getVariableValue = function () {
    var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(deviceID, variableName) {
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
      return _ref9.apply(this, arguments);
    };
  }();

  this.flashBinary = function () {
    var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(deviceID, file) {
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
      return _ref10.apply(this, arguments);
    };
  }();

  this.flashKnownApp = function () {
    var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(deviceID, appName) {
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
      return _ref11.apply(this, arguments);
    };
  }();

  this.flashProductFirmware = function (productID, fileBuffer) {
    return _this._eventPublisher.publish({
      context: { fileBuffer: fileBuffer, productID: productID },
      name: _sparkProtocol.SPARK_SERVER_EVENTS.FLASH_PRODUCT_FIRMWARE
    });
  };

  this.ping = function () {
    var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(deviceID) {
      return _regenerator2.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return _this._permissionManager.checkPermissionsForEntityByID('deviceAttributes', deviceID);

            case 2:
              return _context11.abrupt('return', _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.PING_DEVICE
              }));

            case 3:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this);
    }));

    return function (_x16) {
      return _ref12.apply(this, arguments);
    };
  }();

  this.provision = function () {
    var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(deviceID, userID, publicKey, algorithm) {
      var eccKey, createdKey;
      return _regenerator2.default.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              if (!(algorithm === 'ecc')) {
                _context12.next = 12;
                break;
              }

              _context12.prev = 1;
              eccKey = new _ecKey2.default(publicKey, 'pem');

              if (!eccKey.isPrivateECKey) {
                _context12.next = 5;
                break;
              }

              throw new _HttpError2.default('Not a public key');

            case 5:
              _context12.next = 10;
              break;

            case 7:
              _context12.prev = 7;
              _context12.t0 = _context12['catch'](1);
              throw new _HttpError2.default('Key error ' + _context12.t0);

            case 10:
              _context12.next = 21;
              break;

            case 12:
              _context12.prev = 12;
              createdKey = new _nodeRsa2.default(publicKey);

              if (createdKey.isPublic()) {
                _context12.next = 16;
                break;
              }

              throw new _HttpError2.default('Not a public key');

            case 16:
              _context12.next = 21;
              break;

            case 18:
              _context12.prev = 18;
              _context12.t1 = _context12['catch'](12);
              throw new _HttpError2.default('Key error ' + _context12.t1);

            case 21:

              _this._deviceKeyRepository.updateByID(deviceID, {
                algorithm: algorithm,
                deviceID: deviceID,
                key: publicKey
              });

              _this._deviceAttributeRepository.updateByID(deviceID, {
                ownerID: userID,
                registrar: userID
              });
              return _context12.abrupt('return', _this.getByID(deviceID));

            case 24:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this, [[1, 7], [12, 18]]);
    }));

    return function (_x17, _x18, _x19, _x20) {
      return _ref13.apply(this, arguments);
    };
  }();

  this.raiseYourHand = function () {
    var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(deviceID, shouldShowSignal) {
      var raiseYourHandResponse, error;
      return _regenerator2.default.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return _this._permissionManager.checkPermissionsForEntityByID('deviceAttributes', deviceID);

            case 2:
              _context13.next = 4;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { deviceID: deviceID, shouldShowSignal: shouldShowSignal },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.RAISE_YOUR_HAND
              });

            case 4:
              raiseYourHandResponse = _context13.sent;
              error = raiseYourHandResponse.error;

              if (!error) {
                _context13.next = 8;
                break;
              }

              throw new _HttpError2.default(error);

            case 8:
              return _context13.abrupt('return', raiseYourHandResponse);

            case 9:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this);
    }));

    return function (_x21, _x22) {
      return _ref14.apply(this, arguments);
    };
  }();

  this.renameDevice = function () {
    var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(deviceID, name) {
      var attributes;
      return _regenerator2.default.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.next = 2;
              return _this.getAttributesByID(deviceID);

            case 2:
              attributes = _context14.sent;
              _context14.next = 5;
              return _this._eventPublisher.publishAndListenForResponse({
                context: { attributes: { name: name }, deviceID: deviceID },
                name: _sparkProtocol.SPARK_SERVER_EVENTS.UPDATE_DEVICE_ATTRIBUTES
              });

            case 5:
              return _context14.abrupt('return', _this._deviceAttributeRepository.updateByID(deviceID, { name: name }));

            case 6:
            case 'end':
              return _context14.stop();
          }
        }
      }, _callee14, _this);
    }));

    return function (_x23, _x24) {
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