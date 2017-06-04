'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _ursa = require('ursa');

var _ursa2 = _interopRequireDefault(_ursa);

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DeviceManager = function DeviceManager(deviceAttributeRepository, deviceFirmwareRepository, deviceKeyRepository, deviceServer) {
  var _this = this;

  (0, _classCallCheck3.default)(this, DeviceManager);

  this.claimDevice = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(deviceID, userID) {
      var deviceAttributes, attributesToSave;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this._deviceAttributeRepository.getById(deviceID);

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
              attributesToSave = (0, _extends3.default)({}, deviceAttributes, {
                ownerID: userID
              });
              _context.next = 12;
              return _this._deviceAttributeRepository.update(attributesToSave);

            case 12:
              return _context.abrupt('return', _context.sent);

            case 13:
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
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(deviceID, userID) {
      var deviceAttributes, attributesToSave;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this._deviceAttributeRepository.getById(deviceID, userID);

            case 2:
              deviceAttributes = _context2.sent;

              if (deviceAttributes) {
                _context2.next = 5;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 5:
              attributesToSave = (0, _extends3.default)({}, deviceAttributes, {
                ownerID: null
              });
              _context2.next = 8;
              return _this._deviceAttributeRepository.update(attributesToSave);

            case 8:
              return _context2.abrupt('return', _context2.sent);

            case 9:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.getByID = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(deviceID, userID) {
      var attributes, device;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this._deviceAttributeRepository.getById(deviceID, userID);

            case 2:
              attributes = _context3.sent;

              if (attributes) {
                _context3.next = 5;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 5:
              device = _this._deviceServer.getDevice(attributes.deviceID);
              return _context3.abrupt('return', (0, _extends3.default)({}, attributes, {
                connected: device && device.ping().connected || false,
                lastFlashedAppName: null,
                lastHeard: device && device.ping().lastPing || attributes.lastHeard
              }));

            case 7:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.getDetailsByID = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(deviceID, userID) {
      var device, _ref5, _ref6, attributes, description;

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              device = _this._deviceServer.getDevice(deviceID);
              _context4.next = 3;
              return _promise2.default.all([_this._deviceAttributeRepository.getById(deviceID, userID), device && device.getDescription()]);

            case 3:
              _ref5 = _context4.sent;
              _ref6 = (0, _slicedToArray3.default)(_ref5, 2);
              attributes = _ref6[0];
              description = _ref6[1];

              if (attributes) {
                _context4.next = 9;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 9:
              return _context4.abrupt('return', (0, _extends3.default)({}, attributes, {
                connected: device && device.ping().connected || false,
                functions: description ? description.state.f : null,
                lastFlashedAppName: null,
                lastHeard: device && device.ping().lastPing || attributes.lastHeard,
                variables: description ? description.state.v : null
              }));

            case 10:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x7, _x8) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.getAll = function () {
    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(userID) {
      var devicesAttributes, devicePromises;
      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _this._deviceAttributeRepository.getAll(userID);

            case 2:
              devicesAttributes = _context6.sent;
              devicePromises = devicesAttributes.map(function () {
                var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(attributes) {
                  var device;
                  return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
                        case 0:
                          device = _this._deviceServer.getDevice(attributes.deviceID);
                          return _context5.abrupt('return', (0, _extends3.default)({}, attributes, {
                            connected: device && device.ping().connected || false,
                            lastFlashedAppName: null,
                            lastHeard: device && device.ping().lastPing || attributes.lastHeard
                          }));

                        case 2:
                        case 'end':
                          return _context5.stop();
                      }
                    }
                  }, _callee5, _this);
                }));

                return function (_x10) {
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

    return function (_x9) {
      return _ref7.apply(this, arguments);
    };
  }();

  this.callFunction = function () {
    var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(deviceID, userID, functionName, functionArguments) {
      var doesUserHaveAccess, device;
      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _this._deviceAttributeRepository.doesUserHaveAccess(deviceID, userID);

            case 2:
              doesUserHaveAccess = _context7.sent;

              if (doesUserHaveAccess) {
                _context7.next = 5;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 5:
              device = _this._deviceServer.getDevice(deviceID);

              if (device) {
                _context7.next = 8;
                break;
              }

              throw new _HttpError2.default('Could not get device for ID', 404);

            case 8:
              _context7.next = 10;
              return device.callFunction(functionName, functionArguments);

            case 10:
              return _context7.abrupt('return', _context7.sent);

            case 11:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this);
    }));

    return function (_x11, _x12, _x13, _x14) {
      return _ref9.apply(this, arguments);
    };
  }();

  this.getVariableValue = function () {
    var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(deviceID, userID, varName) {
      var doesUserHaveAccess, device;
      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _this._deviceAttributeRepository.doesUserHaveAccess(deviceID, userID);

            case 2:
              doesUserHaveAccess = _context8.sent;

              if (doesUserHaveAccess) {
                _context8.next = 5;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 5:
              device = _this._deviceServer.getDevice(deviceID);

              if (device) {
                _context8.next = 8;
                break;
              }

              throw new _HttpError2.default('Could not get device for ID', 404);

            case 8:
              _context8.next = 10;
              return device.getVariableValue(varName);

            case 10:
              return _context8.abrupt('return', _context8.sent);

            case 11:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, _this);
    }));

    return function (_x15, _x16, _x17) {
      return _ref10.apply(this, arguments);
    };
  }();

  this.flashBinary = function () {
    var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(deviceID, file) {
      var device;
      return _regenerator2.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              device = _this._deviceServer.getDevice(deviceID);

              if (device) {
                _context9.next = 3;
                break;
              }

              throw new _HttpError2.default('Could not get device for ID', 404);

            case 3:
              _context9.next = 5;
              return device.flash(file.buffer);

            case 5:
              return _context9.abrupt('return', _context9.sent);

            case 6:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, _this);
    }));

    return function (_x18, _x19) {
      return _ref11.apply(this, arguments);
    };
  }();

  this.flashKnownApp = function () {
    var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(deviceID, userID, appName) {
      var knownFirmware, device;
      return _regenerator2.default.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return !_this._deviceAttributeRepository.doesUserHaveAccess(deviceID, userID);

            case 2:
              if (!_context10.sent) {
                _context10.next = 4;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 4:
              knownFirmware = _this._deviceFirmwareRepository.getByName(appName);

              if (knownFirmware) {
                _context10.next = 7;
                break;
              }

              throw new _HttpError2.default('No firmware ' + appName + ' found', 404);

            case 7:
              device = _this._deviceServer.getDevice(deviceID);

              if (device) {
                _context10.next = 10;
                break;
              }

              throw new _HttpError2.default('Could not get device for ID', 404);

            case 10:
              _context10.next = 12;
              return device.flash(knownFirmware);

            case 12:
              return _context10.abrupt('return', _context10.sent);

            case 13:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, _this);
    }));

    return function (_x20, _x21, _x22) {
      return _ref12.apply(this, arguments);
    };
  }();

  this.provision = function () {
    var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(deviceID, userID, publicKey, algorithm) {
      var createdKey, existingAttributes, attributes;
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
              createdKey = _ursa2.default.createPublicKey(publicKey);

              if (_ursa2.default.isPublicKey(createdKey)) {
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
              return _this._deviceKeyRepository.update(deviceID, publicKey);

            case 13:
              _context11.next = 15;
              return _this._deviceAttributeRepository.getById(deviceID);

            case 15:
              existingAttributes = _context11.sent;
              attributes = (0, _extends3.default)({
                deviceID: deviceID
              }, existingAttributes, {
                ownerID: userID,
                registrar: userID,
                timestamp: new Date()
              });
              _context11.next = 19;
              return _this._deviceAttributeRepository.update(attributes);

            case 19:
              _context11.next = 21;
              return _this.getByID(deviceID, userID);

            case 21:
              return _context11.abrupt('return', _context11.sent);

            case 22:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, _this, [[2, 8]]);
    }));

    return function (_x23, _x24, _x25, _x26) {
      return _ref13.apply(this, arguments);
    };
  }();

  this.raiseYourHand = function () {
    var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(deviceID, userID, shouldShowSignal) {
      var device;
      return _regenerator2.default.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return !_this._deviceAttributeRepository.doesUserHaveAccess(deviceID, userID);

            case 2:
              if (!_context12.sent) {
                _context12.next = 4;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 4:
              device = _this._deviceServer.getDevice(deviceID);

              if (device) {
                _context12.next = 7;
                break;
              }

              throw new _HttpError2.default('Could not get device for ID', 404);

            case 7:
              _context12.next = 9;
              return device.raiseYourHand(shouldShowSignal);

            case 9:
              return _context12.abrupt('return', _context12.sent);

            case 10:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this);
    }));

    return function (_x27, _x28, _x29) {
      return _ref14.apply(this, arguments);
    };
  }();

  this.renameDevice = function () {
    var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(deviceID, userID, name) {
      var attributes, attributesToSave;
      return _regenerator2.default.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return _this._deviceAttributeRepository.getById(deviceID, userID);

            case 2:
              attributes = _context13.sent;

              if (attributes) {
                _context13.next = 5;
                break;
              }

              throw new _HttpError2.default('No device found', 404);

            case 5:
              attributesToSave = (0, _extends3.default)({}, attributes, {
                name: name
              });
              _context13.next = 8;
              return _this._deviceAttributeRepository.update(attributesToSave);

            case 8:
              return _context13.abrupt('return', _context13.sent);

            case 9:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this);
    }));

    return function (_x30, _x31, _x32) {
      return _ref15.apply(this, arguments);
    };
  }();

  this._deviceAttributeRepository = deviceAttributeRepository;
  this._deviceFirmwareRepository = deviceFirmwareRepository;
  this._deviceKeyRepository = deviceKeyRepository;
  this._deviceServer = deviceServer;
};

exports.default = DeviceManager;