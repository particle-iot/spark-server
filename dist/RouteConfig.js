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

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

var _multer = require('multer');

var _multer2 = _interopRequireDefault(_multer);

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

var injectUserMiddleware = function injectUserMiddleware(container) {
  return function (request, response, next) {
    var oauthInfo = response.locals.oauth;
    if (oauthInfo) {
      var token = oauthInfo.token;
      var user = token && token.user;
      // eslint-disable-next-line no-param-reassign
      request.user = user;
      container.constitute('IUserRepository').setCurrentUser(user);
    }
    next();
  };
};

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
  var filesMiddleware = function filesMiddleware() {
    var allowedUploads = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return (0, _nullthrows2.default)(allowedUploads).length ? (0, _multer2.default)().fields(allowedUploads) : (0, _multer2.default)().any();
  };

  var oauth = container.constitute('OAuthServer');

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
      app[httpVerb](route, maybe(oauth.authenticate(), !anonymous), maybe(serverSentEventsMiddleware(), serverSentEvents), injectUserMiddleware(container), maybe(filesMiddleware(allowedUploads), allowedUploads), function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(request, response) {
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

                  (allowedUploads || []).forEach(function (_ref2) {
                    var maxCount = _ref2.maxCount,
                        name = _ref2.name;

                    if (!name || !request.files) {
                      return;
                    }
                    var file = request.files[name];
                    if (!file) {
                      return;
                    }
                    body[name] = maxCount === 1 ? file[0] : file;
                  });
                  functionResult = mappedFunction.call.apply(mappedFunction, [controllerInstance].concat((0, _toConsumableArray3.default)(values), [body]));

                  if (!functionResult.then) {
                    _context.next = 25;
                    break;
                  }

                  if (serverSentEvents) {
                    _context.next = 18;
                    break;
                  }

                  _context.next = 15;
                  return _promise2.default.race([functionResult, new _promise2.default(function (resolve, reject) {
                    return setTimeout(function () {
                      return reject(new Error('timeout'));
                    }, settings.API_TIMEOUT);
                  })]);

                case 15:
                  _context.t0 = _context.sent;
                  _context.next = 21;
                  break;

                case 18:
                  _context.next = 20;
                  return functionResult;

                case 20:
                  _context.t0 = _context.sent;

                case 21:
                  result = _context.t0;


                  response.status((0, _nullthrows2.default)(result).status).json((0, _nullthrows2.default)(result).data);
                  _context.next = 26;
                  break;

                case 25:
                  response.status(functionResult.status).json(functionResult.data);

                case 26:
                  _context.next = 32;
                  break;

                case 28:
                  _context.prev = 28;
                  _context.t1 = _context['catch'](8);
                  httpError = new _HttpError2.default(_context.t1);

                  response.status(httpError.status).json({
                    error: httpError.message,
                    ok: false
                  });

                case 32:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined, [[8, 28]]);
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