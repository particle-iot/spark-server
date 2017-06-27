'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _Controller2 = require('./Controller');

var _Controller3 = _interopRequireDefault(_Controller2);

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

var _httpVerb = require('../decorators/httpVerb');

var _httpVerb2 = _interopRequireDefault(_httpVerb);

var _route = require('../decorators/route');

var _route2 = _interopRequireDefault(_route);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OauthClientsController = function (_Controller) {
  (0, _inherits3.default)(OauthClientsController, _Controller);

  function OauthClientsController() {
    (0, _classCallCheck3.default)(this, OauthClientsController);
    return (0, _possibleConstructorReturn3.default)(this, (OauthClientsController.__proto__ || (0, _getPrototypeOf2.default)(OauthClientsController)).apply(this, arguments));
  }

  (0, _createClass3.default)(OauthClientsController, [{
    key: 'createClient',
    // eslint-disable-next-line class-methods-use-this
    value: function createClient() {
      throw new _HttpError2.default('not supported in the current server version');
    }
  }, {
    key: 'editClient',
    // eslint-disable-next-line class-methods-use-this
    value: function editClient() {
      throw new _HttpError2.default('not supported in the current server version');
    }
  }, {
    key: 'deleteClient',
    // eslint-disable-next-line class-methods-use-this
    value: function deleteClient() {
      throw new _HttpError2.default('not supported in the current server version');
    }
  }]);
  return OauthClientsController;
}(_Controller3.default);

exports.default = OauthClientsController;