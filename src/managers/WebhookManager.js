// @flow

import type { EventPublisher } from 'spark-protocol';
import type PermissionManager from './PermissionManager';
import type {
  Event,
  IWebhookLogger,
  IWebhookRepository,
  RequestOptions,
  RequestType,
  Webhook,
  WebhookMutator,
} from '../types';

import hogan from 'hogan.js';
import HttpError from '../lib/HttpError';
import nullthrows from 'nullthrows';
import request from 'request';
import settings from '../settings';
import throttle from 'lodash/throttle';
import Logger from '../lib/logger';
const logger = Logger.createModuleLogger(module);

const parseEventData = (event: Event): Object => {
  try {
    if (event.data) {
      return JSON.parse(event.data);
    }
    return {};
  } catch (error) {
    logger.warn({ err: error, evdata: event.data }, 'parseEventData failed');
    return {};
  }
};

const splitBufferIntoChunks = (
  buffer: Buffer,
  chunkSize: number,
): Array<Buffer> => {
  const chunks = [];
  let ii = 0;
  while (ii < buffer.length) {
    chunks.push(buffer.slice(ii, (ii += chunkSize)));
  }

  return chunks;
};

const validateRequestType = (requestType: string): RequestType => {
  const upperRequestType = ((requestType.toUpperCase(): any): RequestType);
  if (!REQUEST_TYPES.includes(upperRequestType)) {
    throw new HttpError('wrong requestType');
  }

  return upperRequestType;
};

const REQUEST_TYPES: Array<RequestType> = ['DELETE', 'GET', 'POST', 'PUT'];
const MAX_WEBHOOK_ERRORS_COUNT = 10;
const WEBHOOK_THROTTLE_TIME = 1000 * 60; // 1min;
const MAX_RESPONSE_MESSAGE_CHUNK_SIZE = 512;
const MAX_RESPONSE_MESSAGE_SIZE = 100000;

const WEBHOOK_DEFAULTS = {
  rejectUnauthorized: true,
};

class WebhookManager {
  _eventPublisher: EventPublisher;
  _subscriptionIDsByWebhookID: Map<string, string> = new Map();
  _errorsCountByWebhookID: Map<string, number> = new Map();
  _webhookRepository: IWebhookRepository;
  _webhookLogger: IWebhookLogger;
  _permissonManager: PermissionManager;

  constructor(
    eventPublisher: EventPublisher,
    permissionManager: PermissionManager,
    webhookLogger: IWebhookLogger,
    webhookRepository: IWebhookRepository,
  ) {
    this._eventPublisher = eventPublisher;
    this._permissonManager = permissionManager;
    this._webhookLogger = webhookLogger;
    this._webhookRepository = webhookRepository;

    (async (): Promise<void> => await this._init())();
  }

  create = async (model: WebhookMutator): Promise<Webhook> => {
    const webhook = await this._webhookRepository.create({
      ...WEBHOOK_DEFAULTS,
      ...model,
    });
    this._subscribeWebhook(webhook);
    return webhook;
  };

  deleteByID = async (webhookID: string): Promise<void> => {
    const webhook = await this._permissonManager.getEntityByID(
      'webhook',
      webhookID,
    );
    if (!webhook) {
      throw new HttpError('no webhook found', 404);
    }

    await this._webhookRepository.deleteByID(webhookID);
    this._unsubscribeWebhookByID(webhookID);
  };

  getAll = async (): Promise<Array<Webhook>> =>
    await this._permissonManager.getAllEntitiesForCurrentUser('webhook');

  getByID = async (webhookID: string): Promise<Webhook> => {
    const webhook = await this._permissonManager.getEntityByID(
      'webhook',
      webhookID,
    );
    if (!webhook) {
      throw new HttpError('no webhook found', 404);
    }

    return webhook;
  };

  _init = async (): Promise<void> => {
    const allWebhooks = await this._webhookRepository.getAll();
    allWebhooks.forEach((webhook: Webhook): void =>
      this._subscribeWebhook(webhook),
    );
  };

  _subscribeWebhook = (webhook: Webhook) => {
    const subscriptionID = this._eventPublisher.subscribe(
      webhook.event,
      this._onNewWebhookEvent(webhook),
      {
        filterOptions: {
          deviceID: webhook.deviceID,
          listenToBroadcastedEvents: false,
          mydevices: webhook.mydevices,
          userID: webhook.ownerID,
        },
      },
    );
    this._subscriptionIDsByWebhookID.set(webhook.id, subscriptionID);
  };

  _unsubscribeWebhookByID = (webhookID: string) => {
    const subscriptionID = this._subscriptionIDsByWebhookID.get(webhookID);
    if (!subscriptionID) {
      return;
    }

    this._eventPublisher.unsubscribe(subscriptionID);
    this._subscriptionIDsByWebhookID.delete(webhookID);
  };

  _onNewWebhookEvent = (webhook: Webhook): ((event: Event) => void) => (
    event: Event,
  ) => {
    try {
      const webhookErrorCount =
        this._errorsCountByWebhookID.get(webhook.id) || 0;

      if (webhookErrorCount < MAX_WEBHOOK_ERRORS_COUNT) {
        this.runWebhook(webhook, event);
        return;
      }

      this._eventPublisher.publish({
        data: 'Too many errors, webhook disabled',
        isPublic: false,
        name: this._compileErrorResponseTopic(webhook, event),
        userID: event.userID,
      });

      this.runWebhookThrottled(webhook, event);
    } catch (error) {
      logger.error({ err: error }, 'webhookError');
    }
  };

  runWebhook = async (webhook: Webhook, event: Event): Promise<void> => {
    try {
      const webhookVariablesObject = this._getEventVariables(event);

      const requestAuth = this._compileJsonTemplate(
        webhook.auth,
        webhookVariablesObject,
      );

      const requestJson = this._compileJsonTemplate(
        webhook.json,
        webhookVariablesObject,
      );

      const requestFormData = this._compileJsonTemplate(
        webhook.form,
        webhookVariablesObject,
      );

      const requestHeaders = this._compileJsonTemplate(
        webhook.headers,
        webhookVariablesObject,
      );

      const requestUrl = this._compileTemplate(
        webhook.url,
        webhookVariablesObject,
      );

      const requestQuery = this._compileJsonTemplate(
        webhook.query,
        webhookVariablesObject,
      );

      const responseTopic = this._compileTemplate(
        webhook.responseTopic,
        webhookVariablesObject,
      );

      const requestType = this._compileTemplate(
        webhook.requestType,
        webhookVariablesObject,
      );

      const isJsonRequest = !!requestJson || !requestFormData;
      const requestOptions = {
        auth: (requestAuth: any),
        body: isJsonRequest && requestJson
          ? this._getRequestData(requestJson, event, webhook.noDefaults)
          : undefined,
        form: !isJsonRequest && requestFormData
          ? this._getRequestData(requestFormData, event, webhook.noDefaults)
          : undefined,
        headers: requestHeaders,
        json: true,
        method: validateRequestType(nullthrows(requestType)),
        qs: requestQuery,
        strictSSL: webhook.rejectUnauthorized,
        url: nullthrows(requestUrl),
      };

      const responseBody = await this._callWebhook(
        webhook,
        event,
        requestOptions,
      );

      if (!responseBody) {
        return;
      }

      const isResponseBodyAnObject = responseBody === Object(responseBody);

      const responseTemplate =
        webhook.responseTemplate &&
        isResponseBodyAnObject &&
        hogan.compile(webhook.responseTemplate).render(responseBody);

      const responseEventData =
        responseTemplate ||
        (isResponseBodyAnObject ? JSON.stringify(responseBody) : responseBody);

      const chunks = splitBufferIntoChunks(
        Buffer.from(responseEventData).slice(0, MAX_RESPONSE_MESSAGE_SIZE),
        MAX_RESPONSE_MESSAGE_CHUNK_SIZE,
      );

      chunks.forEach((chunk: Buffer, index: number) => {
        const responseEventName =
          (responseTopic && `${responseTopic}/${index}`) ||
          `hook-response/${event.name}/${index}`;

        this._eventPublisher.publish({
          data: chunk.toString(),
          isPublic: false,
          name: responseEventName,
          userID: event.userID,
        });
      });

      this._webhookLogger.log(
        event,
        webhook,
        requestOptions,
        responseBody,
        responseEventData,
      );
    } catch (error) {
      logger.error({ err: error }, 'webhookError');
    }
  };

  runWebhookThrottled = throttle(this.runWebhook, WEBHOOK_THROTTLE_TIME, {
    leading: false,
    trailing: true,
  });

  _callWebhook = (
    webhook: Webhook,
    event: Event,
    requestOptions: RequestOptions,
  ): Promise<*> =>
    new Promise(
      (
        resolve: (responseBody: string | Buffer | Object) => void,
        reject: (error: Error) => void,
      ): void =>
        request(
          requestOptions,
          (
            error: ?Error,
            response: http$IncomingMessage,
            responseBody: string | Buffer | Object,
          ) => {
            const onResponseError = (errorMessage: ?string) => {
              this._incrementWebhookErrorCounter(webhook.id);

              this._eventPublisher.publish({
                data: errorMessage,
                isPublic: false,
                name: this._compileErrorResponseTopic(webhook, event),
                userID: event.userID,
              });

              reject(new Error(errorMessage));
            };

            if (error) {
              onResponseError(error.message);
              return;
            }
            if (response.statusCode >= 400) {
              onResponseError((response: any).statusMessage);
              return;
            }

            this._resetWebhookErrorCounter(webhook.id);

            this._eventPublisher.publish({
              isPublic: false,
              name: `hook-sent/${event.name}`,
              userID: event.userID,
            });

            resolve(responseBody);
          },
        ),
    );

  _getEventVariables = (event: Event): Object => {
    const defaultWebhookVariables = {
      PARTICLE_DEVICE_ID: event.deviceID,
      PARTICLE_EVENT_NAME: event.name,
      PARTICLE_EVENT_VALUE: event.data,
      PARTICLE_PUBLISHED_AT: event.publishedAt,
      // old event names, added for compatibility
      SPARK_CORE_ID: event.deviceID,
      SPARK_EVENT_NAME: event.name,
      SPARK_EVENT_VALUE: event.data,
      SPARK_PUBLISHED_AT: event.publishedAt,
      ...settings.WEBHOOK_TEMPLATE_PARAMETERS,
    };

    const eventDataVariables = parseEventData(event);

    return {
      ...defaultWebhookVariables,
      ...eventDataVariables,
    };
  };

  _getRequestData = (
    customData: ?Object,
    event: Event,
    noDefaults?: boolean,
  ): ?Object => {
    const defaultEventData = {
      coreid: event.deviceID,
      data: event.data,
      event: event.name,
      published_at: event.publishedAt,
    };

    return noDefaults
      ? customData
      : { ...defaultEventData, ...(customData || {}) };
  };

  _compileTemplate = (template?: ?string, variables: Object): ?string =>
    template && hogan.compile(template).render(variables);

  _compileJsonTemplate = (template?: ?Object, variables: Object): ?Object => {
    if (!template) {
      return undefined;
    }

    const compiledTemplate = this._compileTemplate(
      JSON.stringify(template),
      variables,
    );
    if (!compiledTemplate) {
      return undefined;
    }

    return JSON.parse(compiledTemplate);
  };

  _compileErrorResponseTopic = (webhook: Webhook, event: Event): string => {
    const variables = this._getEventVariables(event);
    return (
      this._compileTemplate(webhook.errorResponseTopic, variables) ||
      `hook-error/${event.name}`
    );
  };

  _incrementWebhookErrorCounter = (webhookID: string) => {
    const errorsCount = this._errorsCountByWebhookID.get(webhookID) || 0;
    this._errorsCountByWebhookID.set(webhookID, errorsCount + 1);
  };

  _resetWebhookErrorCounter = (webhookID: string) => {
    this._errorsCountByWebhookID.set(webhookID, 0);
  };
}

export default WebhookManager;
