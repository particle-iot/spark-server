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

var _promisify = require('../lib/promisify');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebhookDatabaseRepository = function WebhookDatabaseRepository(database) {
  var _this = this;

  (0, _classCallCheck3.default)(this, WebhookDatabaseRepository);

  this.create = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(model) {
      var webhook;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this._collection.insert((0, _extends3.default)({}, model, {
                created_at: new Date()
              }), { fullResult: true });

            case 2:
              webhook = _context.sent[0];
              return _context.abrupt('return', (0, _extends3.default)({}, webhook, { id: webhook._id.toString() }));

            case 4:
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

  this.deleteById = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(id) {
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt('return', _this._collection.remove({ _id: id }));

            case 1:
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
              _context3.t0 = _promisify.promisifyByPrototype;
              _context3.next = 4;
              return _this._collection.find(query);

            case 4:
              _context3.t1 = _context3.sent;
              _context3.next = 7;
              return (0, _context3.t0)(_context3.t1).toArray();

            case 7:
              return _context3.abrupt('return', _context3.sent);

            case 8:
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

  this.getById = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(id) {
      var userID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var query, webhook;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              query = userID ? { _id: id, ownerID: userID } : { _id: id };
              _context4.next = 3;
              return _this._collection.findOne(query);

            case 3:
              webhook = _context4.sent;
              return _context4.abrupt('return', webhook ? (0, _extends3.default)({}, webhook, { id: webhook._id.toString() }) : null);

            case 5:
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

  this.update = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
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

  this._collection = database.getCollection('webhooks');
};

exports.default = WebhookDatabaseRepository;