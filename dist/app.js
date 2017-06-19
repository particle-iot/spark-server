'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _RouteConfig = require('./RouteConfig');

var _RouteConfig2 = _interopRequireDefault(_RouteConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (container, settings, existingApp) {
  var app = existingApp || (0, _express2.default)();

  var setCORSHeaders = function setCORSHeaders(request, response, next) {
    if (request.method === 'OPTIONS') {
      response.set({
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Max-Age': '300'
      });
      return response.sendStatus(204);
    }
    response.set({ 'Access-Control-Allow-Origin': '*' });
    return next();
  };

  if (settings.LOG_REQUESTS) {
    app.use((0, _morgan2.default)('[:date[iso]] :remote-addr - :remote-user ":method :url ' + 'HTTP/:http-version" :status :res[content-length] ":referrer" ' + '":user-agent"'));
  }

  app.use(_bodyParser2.default.json());
  app.use(_bodyParser2.default.urlencoded({ extended: true }));
  app.use(setCORSHeaders);

  (0, _RouteConfig2.default)(app, container, ['DeviceClaimsController',
  // to avoid routes collisions EventsController should be placed
  // before DevicesController
  'EventsController', 'DevicesController', 'OauthClientsController', 'ProductsController', 'ProvisioningController', 'UsersController', 'WebhooksController'], settings);

  return app;
};