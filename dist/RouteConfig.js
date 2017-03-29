'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyNames = require('babel-runtime/core-js/object/get-own-property-names');

var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

var _expressOauthServer = require('express-oauth-server');

var _expressOauthServer2 = _interopRequireDefault(_expressOauthServer);

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

var _OAuthModel = require('./OAuthModel');

var _OAuthModel2 = _interopRequireDefault(_OAuthModel);

var _HttpError = require('./lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var maybe = function maybe(middleware, condition) {
  return function (request, response, next) {
    if (condition) {
      middleware(request, response, next);
    } else {
      next();
    }
  };
};

var injectUserMiddleware = function injectUserMiddleware() {
  return function (request, response, next) {
    var oauthInfo = response.locals.oauth;
    if (oauthInfo) {
      var token = oauthInfo.token;
      // eslint-disable-next-line no-param-reassign
      request.user = token && token.user;
    }
    next();
  };
};

// in old codebase there was _keepAlive() function in controllers , which
// prevents of closing server-sent-events stream if there aren't events for
// a long time, but according to the docs sse keep connection alive automatically.
// if there will be related issues in the future, we can return _keepAlive() back.
var serverSentEventsMiddleware = function serverSentEventsMiddleware() {
  return function (request, response, next) {
    request.socket.setNoDelay();
    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream'
    });

    next();
  };
};

exports.default = function (app, container, controllers, settings) {
  var oauth = new _expressOauthServer2.default({
    ACCESS_TOKEN_LIFETIME: settings.ACCESS_TOKEN_LIFETIME,
    allowBearerTokensInQueryString: true,
    model: new _OAuthModel2.default(container.constitute('UserRepository'))
  });

  var filesMiddleware = function filesMiddleware() {
    var allowedUploads = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return (0, _nullthrows2.default)(allowedUploads).length ? (0, _multer2.default)().fields(allowedUploads) : (0, _multer2.default)().any();
  };

  app.post(settings.LOGIN_ROUTE, oauth.token());

  controllers.forEach(function (controllerName) {
    var controller = container.constitute(controllerName);
    (0, _getOwnPropertyNames2.default)((0, _getPrototypeOf2.default)(controller)).forEach(function (functionName) {
      var mappedFunction = controller[functionName];
      var allowedUploads = mappedFunction.allowedUploads,
          anonymous = mappedFunction.anonymous,
          httpVerb = mappedFunction.httpVerb,
          route = mappedFunction.route,
          serverSentEvents = mappedFunction.serverSentEvents;


      if (!httpVerb) {
        return;
      }
      app[httpVerb](route, maybe(oauth.authenticate(), !anonymous), maybe(serverSentEventsMiddleware(), serverSentEvents), injectUserMiddleware(), maybe(filesMiddleware(allowedUploads), allowedUploads), function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(request, response) {
          var argumentNames, values, controllerInstance, _request$body, access_token, body, functionResult, result, httpError;

          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  argumentNames = (route.match(/:[\w]*/g) || []).map(function (argumentName) {
                    return argumentName.replace(':', '');
                  });
                  values = argumentNames.map(function (argument) {
                    return request.params[argument];
                  });
                  controllerInstance = container.constitute(controllerName);

                  // In order parallel requests on the controller, the state
                  // (request/response/user) must be added to the controller.

                  if (controllerInstance === controller) {
                    // throw new Error(
                    //   '`Transient.with` must be used when binding controllers',
                    // );
                    controllerInstance = (0, _create2.default)(controllerInstance);
                  }

                  controllerInstance.request = request;
                  controllerInstance.response = response;
                  controllerInstance.user = request.user;

                  // Take access token out if it's posted.
                  _request$body = request.body, access_token = _request$body.access_token, body = (0, _objectWithoutProperties3.default)(_request$body, ['access_token']);
                  _context.prev = 8;
                  functionResult = mappedFunction.call.apply(mappedFunction, [controllerInstance].concat((0, _toConsumableArray3.default)(values), [body]));

                  if (!functionResult.then) {
                    _context.next = 24;
                    break;
                  }

                  if (serverSentEvents) {
                    _context.next = 17;
                    break;
                  }

                  _context.next = 14;
                  return _promise2.default.race([functionResult, new _promise2.default(function (resolve, reject) {
                    return setTimeout(function () {
                      return reject(new Error('timeout'));
                    }, settings.API_TIMEOUT);
                  })]);

                case 14:
                  _context.t0 = _context.sent;
                  _context.next = 20;
                  break;

                case 17:
                  _context.next = 19;
                  return functionResult;

                case 19:
                  _context.t0 = _context.sent;

                case 20:
                  result = _context.t0;


                  response.status((0, _nullthrows2.default)(result).status).json((0, _nullthrows2.default)(result).data);
                  _context.next = 25;
                  break;

                case 24:
                  response.status(functionResult.status).json(functionResult.data);

                case 25:
                  _context.next = 31;
                  break;

                case 27:
                  _context.prev = 27;
                  _context.t1 = _context['catch'](8);
                  httpError = new _HttpError2.default(_context.t1);

                  response.status(httpError.status).json({
                    error: httpError.message,
                    ok: false
                  });

                case 31:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined, [[8, 27]]);
        }));

        return function (_x2, _x3) {
          return _ref.apply(this, arguments);
        };
      }());
    });
  });

  app.all('*', function (request, response) {
    response.sendStatus(404);
  });

  app.use(function (error, request, response, next) {
    response.status(400).json({
      error: error.code ? error.code : error,
      ok: false
    });
  });
};