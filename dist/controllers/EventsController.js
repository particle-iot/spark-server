'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _desc, _value, _class;

var _Controller2 = require('./Controller');

var _Controller3 = _interopRequireDefault(_Controller2);

var _anonymous = require('../decorators/anonymous');

var _anonymous2 = _interopRequireDefault(_anonymous);

var _route = require('../decorators/route');

var _route2 = _interopRequireDefault(_route);

var _httpVerb = require('../decorators/httpVerb');

var _httpVerb2 = _interopRequireDefault(_httpVerb);

var _serverSentEvents = require('../decorators/serverSentEvents');

var _serverSentEvents2 = _interopRequireDefault(_serverSentEvents);

var _eventToApi = require('../lib/eventToApi');

var _eventToApi2 = _interopRequireDefault(_eventToApi);

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

var KEEP_ALIVE_INTERVAL = 9000;

var EventsController = (_dec = (0, _httpVerb2.default)('post'), _dec2 = (0, _route2.default)('/v1/ping'), _dec3 = (0, _anonymous2.default)(), _dec4 = (0, _httpVerb2.default)('get'), _dec5 = (0, _route2.default)('/v1/events/:eventNamePrefix?*'), _dec6 = (0, _serverSentEvents2.default)(), _dec7 = (0, _httpVerb2.default)('get'), _dec8 = (0, _route2.default)('/v1/devices/events/:eventNamePrefix?*'), _dec9 = (0, _serverSentEvents2.default)(), _dec10 = (0, _httpVerb2.default)('get'), _dec11 = (0, _route2.default)('/v1/devices/:deviceID/events/:eventNamePrefix?*'), _dec12 = (0, _serverSentEvents2.default)(), _dec13 = (0, _httpVerb2.default)('post'), _dec14 = (0, _route2.default)('/v1/devices/events'), (_class = function (_Controller) {
  (0, _inherits3.default)(EventsController, _Controller);

  function EventsController(eventManager) {
    (0, _classCallCheck3.default)(this, EventsController);

    var _this = (0, _possibleConstructorReturn3.default)(this, (EventsController.__proto__ || (0, _getPrototypeOf2.default)(EventsController)).call(this));

    _this._keepAliveIntervalID = null;
    _this._lastEventDate = new Date();


    _this._eventManager = eventManager;
    return _this;
  }

  (0, _createClass3.default)(EventsController, [{
    key: 'ping',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(payload) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', this.ok((0, _extends3.default)({}, payload, {
                  serverPayload: Math.random()
                })));

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function ping(_x) {
        return _ref.apply(this, arguments);
      }

      return ping;
    }()
  }, {
    key: 'getEvents',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(eventNamePrefix) {
        var _eventManager;

        var subscriptionID, keepAliveIntervalID;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                subscriptionID = (_eventManager = this._eventManager).subscribe.apply(_eventManager, [eventNamePrefix, this._pipeEvent.bind(this)].concat((0, _toConsumableArray3.default)(this._getUserFilter())));
                keepAliveIntervalID = this._startKeepAlive();
                _context2.next = 4;
                return this._closeStream(subscriptionID, keepAliveIntervalID);

              case 4:
                return _context2.abrupt('return', this.ok());

              case 5:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getEvents(_x2) {
        return _ref2.apply(this, arguments);
      }

      return getEvents;
    }()
  }, {
    key: 'getMyEvents',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(eventNamePrefix) {
        var subscriptionID, keepAliveIntervalID;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                subscriptionID = this._eventManager.subscribe(eventNamePrefix, this._pipeEvent.bind(this), (0, _extends3.default)({
                  mydevices: true
                }, this._getUserFilter()));
                keepAliveIntervalID = this._startKeepAlive();
                _context3.next = 4;
                return this._closeStream(subscriptionID, keepAliveIntervalID);

              case 4:
                return _context3.abrupt('return', this.ok());

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getMyEvents(_x3) {
        return _ref3.apply(this, arguments);
      }

      return getMyEvents;
    }()
  }, {
    key: 'getDeviceEvents',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(deviceID, eventNamePrefix) {
        var subscriptionID, keepAliveIntervalID;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                subscriptionID = this._eventManager.subscribe(eventNamePrefix, this._pipeEvent.bind(this), (0, _extends3.default)({
                  deviceID: deviceID
                }, this._getUserFilter()));
                keepAliveIntervalID = this._startKeepAlive();
                _context4.next = 4;
                return this._closeStream(subscriptionID, keepAliveIntervalID);

              case 4:
                return _context4.abrupt('return', this.ok());

              case 5:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function getDeviceEvents(_x4, _x5) {
        return _ref4.apply(this, arguments);
      }

      return getDeviceEvents;
    }()
  }, {
    key: 'publish',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(postBody) {
        var eventData;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                eventData = (0, _extends3.default)({
                  data: postBody.data,
                  isPublic: !postBody.private,
                  name: postBody.name,
                  ttl: postBody.ttl
                }, this._getUserFilter());


                this._eventManager.publish(eventData);
                return _context5.abrupt('return', this.ok({ ok: true }));

              case 3:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function publish(_x6) {
        return _ref5.apply(this, arguments);
      }

      return publish;
    }()
  }, {
    key: '_closeStream',
    value: function _closeStream(subscriptionID, keepAliveIntervalID) {
      var _this2 = this;

      return new _promise2.default(function (resolve) {
        var closeStreamHandler = function closeStreamHandler() {
          _this2._eventManager.unsubscribe(subscriptionID);
          clearInterval(keepAliveIntervalID);
          resolve();
        };

        _this2.request.on('close', closeStreamHandler);
        _this2.request.on('end', closeStreamHandler);
        _this2.response.on('finish', closeStreamHandler);
        _this2.response.on('end', closeStreamHandler);
      });
    }
  }, {
    key: '_getUserFilter',
    value: function _getUserFilter() {
      return this.user.role === 'administrator' ? {} : { userID: this.user.id };
    }
  }, {
    key: '_startKeepAlive',
    value: function _startKeepAlive() {
      var _this3 = this;

      return setInterval(function () {
        if (new Date() - _this3._lastEventDate >= KEEP_ALIVE_INTERVAL) {
          _this3.response.write('\n');
          _this3._updateLastEventDate();
        }
      }, KEEP_ALIVE_INTERVAL);
    }
  }, {
    key: '_pipeEvent',
    value: function _pipeEvent(event) {
      try {
        this.response.write('event: ' + event.name + '\n');
        this.response.write('data: ' + (0, _stringify2.default)((0, _eventToApi2.default)(event)) + '\n\n');
        this._updateLastEventDate();
      } catch (error) {
        logger.error({ err: error }, 'pipeEvents - write error');
        throw error;
      }
    }
  }, {
    key: '_updateLastEventDate',
    value: function _updateLastEventDate() {
      this._lastEventDate = new Date();
    }
  }]);
  return EventsController;
}(_Controller3.default), (_applyDecoratedDescriptor(_class.prototype, 'ping', [_dec, _dec2, _dec3], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'ping'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getEvents', [_dec4, _dec5, _dec6], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getEvents'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getMyEvents', [_dec7, _dec8, _dec9], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getMyEvents'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'getDeviceEvents', [_dec10, _dec11, _dec12], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'getDeviceEvents'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'publish', [_dec13, _dec14], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'publish'), _class.prototype)), _class));
exports.default = EventsController;