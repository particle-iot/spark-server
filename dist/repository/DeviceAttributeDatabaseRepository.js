'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DeviceAttributeDatabaseRepository = function DeviceAttributeDatabaseRepository(database) {
  var _this = this;

  (0, _classCallCheck3.default)(this, DeviceAttributeDatabaseRepository);
  this._collectionName = 'deviceAttributes';
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

  this.update = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(model) {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this._database.findAndModify(_this._collectionName, { _id: model.deviceID }, null, { $set: (0, _extends3.default)({}, model, { _id: model.deviceID, timeStamp: new Date() }) }, { new: true, upsert: true });

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

  this.deleteById = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(id) {
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this._database.remove(_this._collectionName, id);

            case 2:
              return _context3.abrupt('return', _context3.sent);

            case 3:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x2) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.doesUserHaveAccess = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(id, userID) {
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _this._database.findOne(_this._collectionName, { _id: id, ownerID: userID });

            case 2:
              return _context4.abrupt('return', !!_context4.sent);

            case 3:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x3, _x4) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.getAll = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
      var userID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var query;
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              query = userID ? { ownerID: userID } : {};
              _context5.next = 3;
              return _this._database.find(_this._collectionName, query);

            case 3:
              return _context5.abrupt('return', _context5.sent);

            case 4:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this);
    }));

    return function () {
      return _ref5.apply(this, arguments);
    };
  }();

  this.getById = function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(id) {
      var userID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var query;
      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              query = userID ? { _id: id, ownerID: userID } : { _id: id };
              return _context6.abrupt('return', _this._database.findOne(_this._collectionName, query));

            case 2:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, _this);
    }));

    return function (_x6) {
      return _ref6.apply(this, arguments);
    };
  }();

  this._database = database;
};

exports.default = DeviceAttributeDatabaseRepository;