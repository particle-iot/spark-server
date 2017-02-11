

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

const _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

const _regenerator = require('babel-runtime/regenerator');

const _regenerator2 = _interopRequireDefault(_regenerator);

const _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

const _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

const _stringify = require('babel-runtime/core-js/json/stringify');

const _stringify2 = _interopRequireDefault(_stringify);

const _promise = require('babel-runtime/core-js/promise');

const _promise2 = _interopRequireDefault(_promise);

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
  _desc,
  _value,
  _class;

const _Controller2 = require('./Controller');

const _Controller3 = _interopRequireDefault(_Controller2);

const _route = require('../decorators/route');

const _route2 = _interopRequireDefault(_route);

const _httpVerb = require('../decorators/httpVerb');

const _httpVerb2 = _interopRequireDefault(_httpVerb);

const _serverSentEvents = require('../decorators/serverSentEvents');

const _serverSentEvents2 = _interopRequireDefault(_serverSentEvents);

const _logger = require('../lib/logger');

const _logger2 = _interopRequireDefault(_logger);

const _eventToApi = require('../lib/eventToApi');

const _eventToApi2 = _interopRequireDefault(_eventToApi);

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

const EventsController = (_dec = (0, _httpVerb2.default)('get'), _dec2 = (0, _route2.default)('/v1/events/:eventNamePrefix?*'), _dec3 = (0, _serverSentEvents2.default)(), _dec4 = (0, _httpVerb2.default)('get'), _dec5 = (0, _route2.default)('/v1/devices/events/:eventNamePrefix?*'), _dec6 = (0, _serverSentEvents2.default)(), _dec7 = (0, _httpVerb2.default)('get'), _dec8 = (0, _route2.default)('/v1/devices/:deviceID/events/:eventNamePrefix?*'), _dec9 = (0, _serverSentEvents2.default)(), _dec10 = (0, _httpVerb2.default)('post'), _dec11 = (0, _route2.default)('/v1/devices/events'), (_class = (function (_Controller) {
  (0, _inherits3.default)(EventsController, _Controller);

  function EventsController(eventManager) {
    (0, _classCallCheck3.default)(this, EventsController);

    const _this = (0, _possibleConstructorReturn3.default)(this, (EventsController.__proto__ || (0, _getPrototypeOf2.default)(EventsController)).call(this));

    _this._eventManager = eventManager;
    return _this;
  }

  (0, _createClass3.default)(EventsController, [{
    key: '_closeStream',
    value: function _closeStream(subscriptionID) {
      const _this2 = this;

      return new _promise2.default((resolve) => {
        const closeStreamHandler = function closeStreamHandler() {
          _this2._eventManager.unsubscribe(subscriptionID);
          resolve();
        };

        _this2.request.on('close', closeStreamHandler);
        _this2.request.on('end', closeStreamHandler);
        _this2.response.on('finish', closeStreamHandler);
        _this2.response.on('end', closeStreamHandler);
      });
    },
  }, {
    key: '_pipeEvent',
    value: function _pipeEvent(event) {
      try {
        this.response.write(`event: ${event.name}\n`);
        this.response.write(`data: ${(0, _stringify2.default)((0, _eventToApi2.default)(event))}\n\n`);
      } catch (error) {
        _logger2.default.error(`pipeEvents - write error: ${error}`);
        throw error;
      }
    },
  }, {
    key: 'getEvents',
    value: (function () {
      const _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(eventNamePrefix) {
        let subscriptionID;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                subscriptionID = this._eventManager.subscribe(eventNamePrefix, this._pipeEvent.bind(this), { userID: this.user.id });
                _context.next = 3;
                return this._closeStream(subscriptionID);

              case 3:
                return _context.abrupt('return', this.ok());

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getEvents(_x) {
        return _ref.apply(this, arguments);
      }

      return getEvents;
    }()),
  }, {
    key: 'getMyEvents',
    value: (function () {
      const _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(eventNamePrefix) {
        let subscriptionID;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                subscriptionID = this._eventManager.subscribe(eventNamePrefix, this._pipeEvent.bind(this), {
                  mydevices: true,
                  userID: this.user.id,
                });
                _context2.next = 3;
                return this._closeStream(subscriptionID);

              case 3:
                return _context2.abrupt('return', this.ok());

              case 4:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getMyEvents(_x2) {
        return _ref2.apply(this, arguments);
      }

      return getMyEvents;
    }()),
  }, {
    key: 'getDeviceEvents',
    value: (function () {
      const _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(deviceID, eventNamePrefix) {
        let subscriptionID;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                subscriptionID = this._eventManager.subscribe(eventNamePrefix, this._pipeEvent.bind(this), {
                  deviceID,
                  userID: this.user.id,
                });
                _context3.next = 3;
                return this._closeStream(subscriptionID);

              case 3:
                return _context3.abrupt('return', this.ok());

              case 4:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getDeviceEvents(_x3, _x4) {
        return _ref3.apply(this, arguments);
      }

      return getDeviceEvents;
    }()),
  }, {
    key: 'publish',
    value: (function () {
      const _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(postBody) {
        let eventData;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                eventData = {
                  data: postBody.data,
                  isPublic: !postBody.private,
                  name: postBody.name,
                  ttl: postBody.ttl,
                  userID: this.user.id,
                };


                this._eventManager.publish(eventData);
                return _context4.abrupt('return', this.ok({ ok: true }));

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function publish(_x5) {
        return _ref4.apply(this, arguments);
      }

      return publish;
    }()),
  }]);
  return EventsController;
}(_Controller3.default)), (_applyDecoratedDescriptor(_class.prototype, 'getEvents', [_dec, _dec2, _dec3], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getEvents'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getMyEvents', [_dec4, _dec5, _dec6], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getMyEvents'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getDeviceEvents', [_dec7, _dec8, _dec9], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getDeviceEvents'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'publish', [_dec10, _dec11], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'publish'), _class.prototype)), _class));
exports.default = EventsController;
