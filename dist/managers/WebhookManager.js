'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _hogan = require('hogan.js');

var _hogan2 = _interopRequireDefault(_hogan);

var _HttpError = require('../lib/HttpError');

var _HttpError2 = _interopRequireDefault(_HttpError);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseEventData = function parseEventData(event) {
  try {
    if (event.data) {
      return JSON.parse(event.data);
    }
    return {};
  } catch (error) {
    return {};
  }
};

var splitBufferIntoChunks = function splitBufferIntoChunks(buffer, chunkSize) {
  var chunks = [];
  var ii = 0;
  while (ii < buffer.length) {
    chunks.push(buffer.slice(ii, ii += chunkSize));
  }

  return chunks;
};

var validateRequestType = function validateRequestType(requestType) {
  if (!REQUEST_TYPES.includes(requestType)) {
    throw new _HttpError2.default('wrong requestType');
  }
  return requestType;
};

var REQUEST_TYPES = ['DELETE', 'GET', 'POST', 'PUT'];
var MAX_WEBHOOK_ERRORS_COUNT = 10;
var WEBHOOK_THROTTLE_TIME = 1000 * 60; // 1min;
var MAX_RESPONSE_MESSAGE_CHUNK_SIZE = 512;
var MAX_RESPONSE_MESSAGE_SIZE = 100000;

var WebhookManager = function WebhookManager(webhookRepository, eventPublisher) {
  var _this = this;

  (0, _classCallCheck3.default)(this, WebhookManager);
  this._subscriptionIDsByWebhookID = new _map2.default();
  this._errorsCountByWebhookID = new _map2.default();

  this.create = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(model) {
      var webhook;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this._webhookRepository.create(model);

            case 2:
              webhook = _context.sent;

              _this._subscribeWebhook(webhook);
              return _context.abrupt('return', webhook);

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();

  this.deleteByID = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(webhookID, userID) {
      var webhook;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this._webhookRepository.getById(webhookID, userID);

            case 2:
              webhook = _context2.sent;

              if (webhook) {
                _context2.next = 5;
                break;
              }

              throw new _HttpError2.default('no webhook found', 404);

            case 5:
              _context2.next = 7;
              return _this._webhookRepository.deleteById(webhookID);

            case 7:
              _this._unsubscribeWebhookByID(webhookID);

            case 8:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }));

    return function (_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();

  this.getAll = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(userID) {
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this._webhookRepository.getAll(userID);

            case 2:
              return _context3.abrupt('return', _context3.sent);

            case 3:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this);
    }));

    return function (_x4) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.getByID = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(webhookID, userID) {
      var webhook;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _this._webhookRepository.getById(webhookID, userID);

            case 2:
              webhook = _context4.sent;

              if (webhook) {
                _context4.next = 5;
                break;
              }

              throw new _HttpError2.default('no webhook found', 404);

            case 5:
              return _context4.abrupt('return', webhook);

            case 6:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this);
    }));

    return function (_x5, _x6) {
      return _ref4.apply(this, arguments);
    };
  }();

  this._init = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
    var allWebhooks;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return _this._webhookRepository.getAll();

          case 2:
            allWebhooks = _context5.sent;

            allWebhooks.forEach(function (webhook) {
              return _this._subscribeWebhook(webhook);
            });

          case 4:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, _this);
  }));

  this._subscribeWebhook = function (webhook) {
    var subscriptionID = _this._eventPublisher.subscribe(webhook.event, _this._onNewWebhookEvent(webhook), {
      deviceID: webhook.deviceID,
      mydevices: webhook.mydevices,
      userID: webhook.ownerID
    });
    _this._subscriptionIDsByWebhookID.set(webhook.id, subscriptionID);
  };

  this._unsubscribeWebhookByID = function (webhookID) {
    var subscriptionID = _this._subscriptionIDsByWebhookID.get(webhookID);
    if (!subscriptionID) {
      return;
    }

    _this._eventPublisher.unsubscribe(subscriptionID);
    _this._subscriptionIDsByWebhookID.delete(webhookID);
  };

  this._onNewWebhookEvent = function (webhook) {
    return function (event) {
      try {
        var webhookErrorCount = _this._errorsCountByWebhookID.get(webhook.id) || 0;

        if (webhookErrorCount < MAX_WEBHOOK_ERRORS_COUNT) {
          _this.runWebhook(webhook, event);
          return;
        }

        _this._eventPublisher.publish({
          data: 'Too many errors, webhook disabled',
          isPublic: false,
          name: _this._compileErrorResponseTopic(webhook, event),
          userID: event.userID
        });

        _this.runWebhookThrottled(webhook, event);
      } catch (error) {
        _logger2.default.error('webhookError: ' + error);
      }
    };
  };

  this.runWebhook = function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(webhook, event) {
      var _ret;

      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              return _context7.delegateYield(_regenerator2.default.mark(function _callee6() {
                var webhookVariablesObject, requestAuth, requestJson, requestFormData, requestHeaders, requestUrl, requestQuery, responseTopic, requestType, isJsonRequest, requestOptions, responseBody, isResponseBodyAnObject, responseTemplate, responseEventData, chunks;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        webhookVariablesObject = _this._getEventVariables(event);
                        requestAuth = _this._compileJsonTemplate(webhook.auth, webhookVariablesObject);
                        requestJson = _this._compileJsonTemplate(webhook.json, webhookVariablesObject);
                        requestFormData = _this._compileJsonTemplate(webhook.form, webhookVariablesObject);
                        requestHeaders = _this._compileJsonTemplate(webhook.headers, webhookVariablesObject);
                        requestUrl = _this._compileTemplate(webhook.url, webhookVariablesObject);
                        requestQuery = _this._compileJsonTemplate(webhook.query, webhookVariablesObject);
                        responseTopic = _this._compileTemplate(webhook.responseTopic, webhookVariablesObject);
                        requestType = _this._compileTemplate(webhook.requestType, webhookVariablesObject);
                        isJsonRequest = !!requestJson;
                        requestOptions = {
                          auth: requestAuth,
                          body: isJsonRequest ? _this._getRequestData(requestJson, event, webhook.noDefaults) : undefined,
                          form: !isJsonRequest ? _this._getRequestData(requestFormData, event, webhook.noDefaults) : undefined,
                          headers: requestHeaders,
                          json: true,
                          method: validateRequestType(requestType),
                          qs: requestQuery,
                          strictSSL: webhook.rejectUnauthorized,
                          url: (0, _nullthrows2.default)(requestUrl)
                        };
                        _context6.next = 13;
                        return _this._callWebhook(webhook, event, requestOptions);

                      case 13:
                        responseBody = _context6.sent;

                        if (responseBody) {
                          _context6.next = 16;
                          break;
                        }

                        return _context6.abrupt('return', {
                          v: void 0
                        });

                      case 16:
                        isResponseBodyAnObject = responseBody === Object(responseBody);
                        responseTemplate = webhook.responseTemplate && isResponseBodyAnObject && _hogan2.default.compile(webhook.responseTemplate).render(responseBody);
                        responseEventData = responseTemplate || (isResponseBodyAnObject ? (0, _stringify2.default)(responseBody) : responseBody);
                        chunks = splitBufferIntoChunks(Buffer.from(responseEventData).slice(0, MAX_RESPONSE_MESSAGE_SIZE), MAX_RESPONSE_MESSAGE_CHUNK_SIZE);


                        chunks.forEach(function (chunk, index) {
                          var responseEventName = responseTopic && responseTopic + '/' + index || 'hook-response/' + event.name + '/' + index;

                          _this._eventPublisher.publish({
                            data: chunk,
                            isPublic: false,
                            name: responseEventName,
                            userID: event.userID
                          });
                        });

                      case 21:
                      case 'end':
                        return _context6.stop();
                    }
                  }
                }, _callee6, _this);
              })(), 't0', 2);

            case 2:
              _ret = _context7.t0;

              if (!((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object")) {
                _context7.next = 5;
                break;
              }

              return _context7.abrupt('return', _ret.v);

            case 5:
              _context7.next = 10;
              break;

            case 7:
              _context7.prev = 7;
              _context7.t1 = _context7['catch'](0);

              _logger2.default.error('webhookError: ' + _context7.t1);

            case 10:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, _this, [[0, 7]]);
    }));

    return function (_x7, _x8) {
      return _ref6.apply(this, arguments);
    };
  }();

  this.runWebhookThrottled = (0, _throttle2.default)(this.runWebhook, WEBHOOK_THROTTLE_TIME, { leading: false, trailing: true });

  this._callWebhook = function (webhook, event, requestOptions) {
    return new _promise2.default(function (resolve, reject) {
      return (0, _request2.default)(requestOptions, function (error, response, responseBody) {
        var onResponseError = function onResponseError(errorMessage) {
          _this._incrementWebhookErrorCounter(webhook.id);

          _this._eventPublisher.publish({
            data: errorMessage,
            isPublic: false,
            name: _this._compileErrorResponseTopic(webhook, event),
            userID: event.userID
          });

          reject(new Error(errorMessage));
        };

        if (error) {
          onResponseError(error.message);
          return;
        }
        if (response.statusCode >= 400) {
          onResponseError(response.statusMessage);
          return;
        }

        _this._resetWebhookErrorCounter(webhook.id);

        _this._eventPublisher.publish({
          isPublic: false,
          name: 'hook-sent/' + event.name,
          userID: event.userID
        });

        resolve(responseBody);
      });
    });
  };

  this._getEventVariables = function (event) {
    var defaultWebhookVariables = {
      PARTICLE_DEVICE_ID: event.deviceID,
      PARTICLE_EVENT_NAME: event.name,
      PARTICLE_EVENT_VALUE: event.data,
      PARTICLE_PUBLISHED_AT: event.publishedAt,
      // old event names, added for compatibility
      SPARK_CORE_ID: event.deviceID,
      SPARK_EVENT_NAME: event.name,
      SPARK_EVENT_VALUE: event.data,
      SPARK_PUBLISHED_AT: event.publishedAt
    };

    var eventDataVariables = parseEventData(event);

    return (0, _extends3.default)({}, defaultWebhookVariables, eventDataVariables);
  };

  this._getRequestData = function (customData, event, noDefaults) {
    var defaultEventData = {
      coreid: event.deviceID,
      data: event.data,
      event: event.name,
      published_at: event.publishedAt
    };

    return noDefaults ? customData : (0, _extends3.default)({}, defaultEventData, customData || {});
  };

  this._compileTemplate = function (template, variables) {
    return template && _hogan2.default.compile(template).render(variables);
  };

  this._compileJsonTemplate = function (template, variables) {
    if (!template) {
      return undefined;
    }

    var compiledTemplate = _this._compileTemplate((0, _stringify2.default)(template), variables);
    if (!compiledTemplate) {
      return undefined;
    }

    return JSON.parse(compiledTemplate);
  };

  this._compileErrorResponseTopic = function (webhook, event) {
    var variables = _this._getEventVariables(event);
    return _this._compileTemplate(webhook.errorResponseTopic, variables) || 'hook-error/' + event.name;
  };

  this._incrementWebhookErrorCounter = function (webhookID) {
    var errorsCount = _this._errorsCountByWebhookID.get(webhookID) || 0;
    _this._errorsCountByWebhookID.set(webhookID, errorsCount + 1);
  };

  this._resetWebhookErrorCounter = function (webhookID) {
    _this._errorsCountByWebhookID.set(webhookID, 0);
  };

  this._webhookRepository = webhookRepository;
  this._eventPublisher = eventPublisher;

  (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8() {
    return _regenerator2.default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return _this._init();

          case 2:
            return _context8.abrupt('return', _context8.sent);

          case 3:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, _this);
  }))();
};

exports.default = WebhookManager;