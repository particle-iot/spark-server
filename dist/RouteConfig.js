

Object.defineProperty(exports, '__esModule', {
  value: true,
});

const _regenerator = require('babel-runtime/regenerator');

const _regenerator2 = _interopRequireDefault(_regenerator);

const _promise = require('babel-runtime/core-js/promise');

const _promise2 = _interopRequireDefault(_promise);

const _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

const _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

const _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

const _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

const _create = require('babel-runtime/core-js/object/create');

const _create2 = _interopRequireDefault(_create);

const _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

const _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

const _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

const _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

const _getOwnPropertyNames = require('babel-runtime/core-js/object/get-own-property-names');

const _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

const _expressOauthServer = require('express-oauth-server');

const _expressOauthServer2 = _interopRequireDefault(_expressOauthServer);

const _nullthrows = require('nullthrows');

const _nullthrows2 = _interopRequireDefault(_nullthrows);

const _multer = require('multer');

const _multer2 = _interopRequireDefault(_multer);

const _OAuthModel = require('./OAuthModel');

const _OAuthModel2 = _interopRequireDefault(_OAuthModel);

const _HttpError = require('./lib/HttpError');

const _HttpError2 = _interopRequireDefault(_HttpError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const maybe = function maybe(middleware, condition) {
  return function (request, response, next) {
    if (condition) {
      middleware(request, response, next);
    } else {
      next();
    }
  };
};

const injectUserMiddleware = function injectUserMiddleware() {
  return function (request, response, next) {
    const oauthInfo = response.locals.oauth;
    if (oauthInfo) {
      const token = oauthInfo.token;
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
const serverSentEventsMiddleware = function serverSentEventsMiddleware() {
  return function (request, response, next) {
    request.socket.setNoDelay();
    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    });

    next();
  };
};

exports.default = function (app, container, controllers, settings) {
  const oauth = new _expressOauthServer2.default({
    ACCESS_TOKEN_LIFETIME: settings.ACCESS_TOKEN_LIFETIME,
    allowBearerTokensInQueryString: true,
    model: new _OAuthModel2.default(container.constitute('UserRepository')),
  });

  const filesMiddleware = function filesMiddleware() {
    const allowedUploads = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return (0, _nullthrows2.default)(allowedUploads).length ? (0, _multer2.default)().fields(allowedUploads) : (0, _multer2.default)().any();
  };

  app.post(settings.LOGIN_ROUTE, oauth.token());

  controllers.forEach((controllerName) => {
    const controller = container.constitute(controllerName);
    (0, _getOwnPropertyNames2.default)((0, _getPrototypeOf2.default)(controller)).forEach((functionName) => {
      const mappedFunction = controller[functionName];
      let allowedUploads = mappedFunction.allowedUploads,
        anonymous = mappedFunction.anonymous,
        httpVerb = mappedFunction.httpVerb,
        route = mappedFunction.route,
        serverSentEvents = mappedFunction.serverSentEvents;


      if (!httpVerb) {
        return;
      }
      app[httpVerb](route, maybe(oauth.authenticate(), !anonymous), maybe(serverSentEventsMiddleware(), serverSentEvents), injectUserMiddleware(), maybe(filesMiddleware(allowedUploads), allowedUploads), (function () {
        const _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(request, response) {
          let argumentNames,
            values,
            controllerInstance,
            _request$body,
            access_token,
            body,
            functionResult,
            result,
            httpError;

          return _regenerator2.default.wrap((_context) => {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  argumentNames = (route.match(/:[\w]*/g) || []).map(argumentName => argumentName.replace(':', ''));
                  values = argumentNames.map(argument => request.params[argument]);
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
                  functionResult = mappedFunction.call(...[controllerInstance].concat((0, _toConsumableArray3.default)(values), [body]));

                  if (!functionResult.then) {
                    _context.next = 17;
                    break;
                  }

                  _context.next = 13;
                  return _promise2.default.race([functionResult, !serverSentEvents ? new _promise2.default((resolve, reject) => setTimeout(() => reject(new Error('timeout')), settings.API_TIMEOUT)) : null]);

                case 13:
                  result = _context.sent;

                  response.status((0, _nullthrows2.default)(result).status).json((0, _nullthrows2.default)(result).data);
                  _context.next = 18;
                  break;

                case 17:
                  response.status(functionResult.status).json(functionResult.data);

                case 18:
                  _context.next = 24;
                  break;

                case 20:
                  _context.prev = 20;
                  _context.t0 = _context.catch(8);
                  httpError = new _HttpError2.default(_context.t0);

                  response.status(httpError.status).json({
                    error: httpError.message,
                    ok: false,
                  });

                case 24:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, undefined, [[8, 20]]);
        }));

        return function (_x2, _x3) {
          return _ref.apply(this, arguments);
        };
      }()));
    });
  });

  app.all('*', (request, response) => {
    response.sendStatus(404);
  });

  app.use((error, request, response, next, // eslint-disable-line no-unused-vars
  ) => {
    response.status(400).json({
      error: error.code ? error.code : error,
      ok: false,
    });
  });
};
