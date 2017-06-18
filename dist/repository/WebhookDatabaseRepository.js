'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _collectionNames = require('./collectionNames');

var _collectionNames2 = _interopRequireDefault(_collectionNames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebhookDatabaseRepository = function WebhookDatabaseRepository(database) {
  var _this = this;

  (0, _classCallCheck3.default)(this, WebhookDatabaseRepository);
  this._collectionName = _collectionNames2.default.WEBHOOKS;

  this.create = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(model) {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this._database.insertOne(_this._collectionName, (0, _extends3.default)({}, model, {
                created_at: new Date()
              }));

            case 2:
              return _context.abrupt('return', _context.sent);

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();

  this.deleteByID = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(id) {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this._database.remove(_this._collectionName, { _id: id });

            case 2:
              return _context2.abrupt('return', _context2.sent);

            case 3:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x2) {
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
              return _context3.abrupt('return', _context3.sent);

            case 4:
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
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(id) {
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _this._database.findOne(_this._collectionName, { _id: id });

            case 2:
              return _context4.abrupt('return', _context4.sent);

            case 3:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.updateByID = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            throw new Error('The method is not implemented');

          case 1:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, _this);
  }));

  this._database = database;
};

exports.default = WebhookDatabaseRepository;