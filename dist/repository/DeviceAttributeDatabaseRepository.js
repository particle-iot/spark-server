'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _collectionNames = require('./collectionNames');

var _collectionNames2 = _interopRequireDefault(_collectionNames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// getByID, deleteByID and update uses model.deviceID as ID for querying
var DeviceAttributeDatabaseRepository = function DeviceAttributeDatabaseRepository(database, permissionManager) {
  var _this = this;

  (0, _classCallCheck3.default)(this, DeviceAttributeDatabaseRepository);
  this._collectionName = _collectionNames2.default.DEVICE_ATTRIBUTES;
  this.create = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            throw new Error('The method is not implemented');

          case 1:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this);
  }));

  this.deleteByID = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(deviceID) {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this._database.remove(_this._collectionName, { deviceID: deviceID });

            case 2:
              return _context2.abrupt('return', _context2.sent);

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.getAll = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
      var userID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var query;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              query = userID ? { ownerID: userID } : {};
              _context3.next = 3;
              return _this._database.find(_this._collectionName, query);

            case 3:
              _context3.t0 = _this._parseVariables;
              return _context3.abrupt('return', _context3.sent.map(_context3.t0));

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function () {
      return _ref3.apply(this, arguments);
    };
  }();

  this.getByID = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(deviceID) {
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.t0 = _this;
              _context4.next = 3;
              return _this._database.findOne(_this._collectionName, { deviceID: deviceID });

            case 3:
              _context4.t1 = _context4.sent;
              return _context4.abrupt('return', _context4.t0._parseVariables.call(_context4.t0, _context4.t1));

            case 5:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x3) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.updateByID = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(deviceID, _ref6) {
      var variables = _ref6.variables,
          props = (0, _objectWithoutProperties3.default)(_ref6, ['variables']);
      var attributesToSave;
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              attributesToSave = (0, _extends3.default)({}, props, {
                variables: variables ? (0, _stringify2.default)(variables) : undefined
              });
              _context5.next = 3;
              return _this._database.findAndModify(_this._collectionName, { deviceID: deviceID }, { $set: (0, _extends3.default)({}, attributesToSave, { timeStamp: new Date() }) });

            case 3:
              return _context5.abrupt('return', _context5.sent);

            case 4:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this);
    }));

    return function (_x4, _x5) {
      return _ref5.apply(this, arguments);
    };
  }();

  this._parseVariables = function (attributesFromDB) {
    if (!attributesFromDB) {
      return null;
    }

    var variables = attributesFromDB.variables;

    try {
      return (0, _extends3.default)({}, attributesFromDB, {
        variables: variables ? JSON.parse(variables) : undefined
      });
    } catch (ignore) {
      return attributesFromDB;
    }
  };

  this._database = database;
  this._permissionManager = permissionManager;
}

// mongo and neDB don't support dots in variables names
// but some of the server users want to have dots in their device var names
// so we have to stringify them and parse back.
;

exports.default = DeviceAttributeDatabaseRepository;