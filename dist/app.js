'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _logger = require('./lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _RouteConfig = require('./RouteConfig');

var _RouteConfig2 = _interopRequireDefault(_RouteConfig);

var _bunyanMiddleware = require('bunyan-middleware');

var _bunyanMiddleware2 = _interopRequireDefault(_bunyanMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = _logger2.default.createModuleLogger(module);

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
    response.set({
      'Access-Control-Allow-Origin': '*'
    });
    return next();
  };

  if (logger.debug()) {
    app.use((0, _bunyanMiddleware2.default)({
      headerName: 'X-Request-Id',
      level: 'debug',
      logger: logger,
      logName: 'req_id',
      obscureHeaders: [],
      propertyName: 'reqId'
    }));
    logger.warn('Request logging enabled');
  }

  app.use(_bodyParser2.default.json());
  app.use(_bodyParser2.default.urlencoded({
    extended: true
  }));
  app.use(setCORSHeaders);

  (0, _RouteConfig2.default)(app, container, ['DeviceClaimsController',
  // to avoid routes collisions EventsController should be placed
  // before DevicesController
  'EventsController', 'DevicesController', 'OauthClientsController', 'ProductsController', 'ProvisioningController', 'UsersController', 'WebhooksController'], settings);

  return app;
};