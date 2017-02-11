

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

const _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EventManager = function EventManager(eventPublisher) {
  const _this = this;

  (0, _classCallCheck3.default)(this, EventManager);

  this.subscribe = function (eventNamePrefix, eventHandler, filterOptions) {
    return _this._eventPublisher.subscribe(eventNamePrefix, eventHandler, filterOptions);
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
