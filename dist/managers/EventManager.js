'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventManager = function EventManager(eventPublisher) {
  var _this = this;

  (0, _classCallCheck3.default)(this, EventManager);

  this.subscribe = function (eventNamePrefix, eventHandler, filterOptions) {
    return _this._eventPublisher.subscribe(eventNamePrefix, eventHandler, {
      filterOptions: filterOptions
    });
  };

  this.unsubscribe = function (subscriptionID) {
    return _this._eventPublisher.unsubscribe(subscriptionID);
  };

  this.publish = function (eventData) {
    return _this._eventPublisher.publish(eventData);
  };

  this._eventPublisher = eventPublisher;
};

exports.default = EventManager;