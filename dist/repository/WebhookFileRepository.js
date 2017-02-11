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

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _dec, _dec2, _dec3, _dec4, _desc, _value, _class;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _sparkProtocol = require('spark-protocol');

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

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

var WebhookFileRepository = (_dec = (0, _sparkProtocol.memoizeSet)(), _dec2 = (0, _sparkProtocol.memoizeSet)(['id']), _dec3 = (0, _sparkProtocol.memoizeGet)(), _dec4 = (0, _sparkProtocol.memoizeGet)(['id']), (_class = function () {
  function WebhookFileRepository(path) {
    var _this = this;

    (0, _classCallCheck3.default)(this, WebhookFileRepository);

    this.getAll = function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var userID = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var allData;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this._getAll();

              case 2:
                allData = _context.sent;

                if (!userID) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt('return', allData.filter(function (webhook) {
                  return webhook.ownerID === userID;
                }));

              case 5:
                return _context.abrupt('return', allData);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function () {
        return _ref.apply(this, arguments);
      };
    }();

    this.getById = function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(id) {
        var userID = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var webhook;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _this._getByID(id);

              case 2:
                webhook = _context2.sent;

                if (!(!webhook || webhook.ownerID !== userID)) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt('return', null);

              case 5:
                return _context2.abrupt('return', webhook);

              case 6:
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

    this.update = function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(model) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                throw new _HttpError2.default('Not implemented');

              case 1:
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

    this._fileManager = new _sparkProtocol.JSONFileManager(path);
  }

  (0, _createClass3.default)(WebhookFileRepository, [{
    key: 'create',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(model) {
        var id, modelToSave;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                id = (0, _uuid2.default)();

              case 1:
                _context4.next = 3;
                return this._fileManager.hasFile(id + '.json');

              case 3:
                if (!_context4.sent) {
                  _context4.next = 7;
                  break;
                }

                id = (0, _uuid2.default)();
                _context4.next = 1;
                break;

              case 7:
                modelToSave = (0, _extends3.default)({}, model, {
                  created_at: new Date(),
                  id: id
                });


                this._fileManager.createFile(modelToSave.id + '.json', modelToSave);
                return _context4.abrupt('return', modelToSave);

              case 10:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function create(_x5) {
        return _ref4.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'deleteById',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(id) {
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this._fileManager.deleteFile(id + '.json');

              case 1:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function deleteById(_x6) {
        return _ref5.apply(this, arguments);
      }

      return deleteById;
    }()

    // eslint-disable-next-line no-unused-vars

  }, {
    key: '_getAll',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt('return', this._fileManager.getAllData());

              case 1:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function _getAll() {
        return _ref6.apply(this, arguments);
      }

      return _getAll;
    }()
  }, {
    key: '_getByID',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(id) {
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt('return', this._fileManager.getFile(id + '.json'));

              case 1:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function _getByID(_x7) {
        return _ref7.apply(this, arguments);
      }

      return _getByID;
    }()
  }]);
  return WebhookFileRepository;
}(), (_applyDecoratedDescriptor(_class.prototype, 'create', [_dec], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'create'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'deleteById', [_dec2], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'deleteById'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_getAll', [_dec3], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, '_getAll'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_getByID', [_dec4], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, '_getByID'), _class.prototype)), _class));
exports.default = WebhookFileRepository;