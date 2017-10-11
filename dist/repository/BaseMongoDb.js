'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var deepToObjectIdCast = function deepToObjectIdCast(node) {
  (0, _keys2.default)(node).forEach(function (key) {
    if (node[key] === Object(node[key])) {
      deepToObjectIdCast(node[key]);
    }
    if (key === '_id') {
      // eslint-disable-next-line
      node[key] = new _mongodb.ObjectId(node[key]);
    }
  });
  return node;
};

var BaseMongoDb = function BaseMongoDb() {
  var _this = this;

  (0, _classCallCheck3.default)(this, BaseMongoDb);

  this.__filterID = function (_ref) {
    var id = _ref.id,
        otherProps = (0, _objectWithoutProperties3.default)(_ref, ['id']);
    return (0, _extends3.default)({}, otherProps);
  };

  this.__translateQuery = function (query) {
    return _this.__filterID(deepToObjectIdCast(query));
  };

  this.__translateResultItem = function (item) {
    if (!item) {
      return null;
    }
    var _id = item._id,
        otherProps = (0, _objectWithoutProperties3.default)(item, ['_id']);

    return (0, _extends3.default)({}, otherProps, { id: _id.toString() });
  };
}
// eslint-disable-next-line no-unused-vars
;

exports.default = BaseMongoDb;