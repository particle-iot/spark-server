// @flow

import type {
  Event,
  Repository,
  Webhook,
  WebhookMutator,
} from '../types';
import type { EventPublisher } from 'spark-protocol';

import querystring from 'querystring';
import hogan from 'hogan.js';
import HttpError from '../lib/HttpError';
import logger from '../lib/logger';
import request from 'request';
import throttle from 'lodash/throttle';

const splitBufferIntoChunks = (
  buffer: Buffer,
  chunkSize: number,
): Array<Buffer> => {
  const chunks = [];
  let i = 0;
  while (i < buffer.length) {
    chunks.push(buffer.slice(i, i += chunkSize));
  }

  return chunks;
};

const MAX_WEBHOOK_ERRORS_COUNT = 10;
const WEBHOOK_THROTTLE_TIME = 1000 * 60; // 1min;
const MAX_RESPONSE_MESSAGE_CHUNK_SIZE = 512;

class WebhookManager {
  _eventPublisher: EventPublisher;
  _subscriptionIDsByWebhookID: Map<string, string> = new Map();
  _errorsCountByWebhookID: Map<string, number> = new Map();
  _webhookRepository: Repository<Webhook>;

  constructor(
    webhookRepository: Repository<Webhook>,
    eventPublisher: EventPublisher,
  ) {
    this._webhookRepository = webhookRepository;
    this._eventPublisher = eventPublisher;

    (async (): Promise<void> => await this._init())();
  }

  create = async (model: WebhookMutator): Promise<Webhook> => {
    const webhook = await this._webhookRepository.create(model);
    this._subscribeWebhook(webhook);
    return webhook;
  };

  deleteByID = async (
    webhookID: string,
    userID: string,
  ): Promise<void> => {
    const webhook = await this._webhookRepository.getById(webhookID, userID);
    if (!webhook) {
      throw new HttpError('no webhook found', 404);
    }
    await this._webhookRepository.deleteById(webhookID);
    this._unsubscribeWebhookByID(webhookID);
  };

  getAll = async (userID: string): Promise<Array<Webhook>> =>
    await this._webhookRepository.getAll(userID);

  getByID = async (webhookID: string, userID: string): Promise<Webhook> => {
    const webhook = await this._webhookRepository.getById(webhookID, userID);
    if (!webhook) {
      throw new HttpError('no webhook found', 404);
    }

    return webhook;
  };

  _init = async (): Promise<void> => {
    const allWebhooks = await this._webhookRepository.getAll();
    allWebhooks.forEach(
      (webhook: Webhook): void => this._subscribeWebhook(webhook),
    );
  };

  _subscribeWebhook = (webhook: Webhook) => {
    const subscriptionID = this._eventPublisher.subscribe(
      webhook.event,
      this._onNewWebhookEvent(webhook),
      // todo separate filtering for MY_DEVICES and for public/private events
      {
        deviceID: webhook.deviceID,
        userID: webhook.ownerID,
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

  _onNewWebhookEvent = (webhook: Webhook): (event: Event) => void =>
    (event: Event) => {
      try {
        if (
          webhook.mydevices &&
          webhook.ownerID !== event.userID
        ) {
          return;
        }

        const webhookErrorCount =
          this._errorsCountByWebhookID.get(webhook.id) || 0;

        if (webhookErrorCount < MAX_WEBHOOK_ERRORS_COUNT) {
          this.runWebhook(webhook, event);
          return;
        }

        this._eventPublisher.publish({
          data: 'Too many errors, webhook disabled',
          name: this._compileErrorResponseTopic(
            webhook,
            event,
          ),
          userID: event.userID,
        });
      } catch (error) {
        logger.error(`webhookError: ${error}`);
      }
    };

  runWebhook = async (webhook: Webhook, event: Event): Promise<void> => {
    try {
      const webhookVariablesObject =
        this._getEventData(event, webhook.noDefaults);

      const requestJson = this._compileJsonTopic(
        webhook.json,
        webhookVariablesObject,
      );

      const requestFormData = this._compileJsonTopic(
        webhook.form,
        webhookVariablesObject,
      );

      const requestUrl = this._compileTopic(
        webhook.url,
        webhookVariablesObject,
      );

      const requestQuery = this._compileJsonTopic(
        webhook.query,
        webhookVariablesObject,
      );

      const responseTopic = this._compileTopic(
        webhook.responseTopic,
        webhookVariablesObject,
      );

      const isJsonRequest = !!requestJson;
      const requestOptions = {
        auth: webhook.auth,
        body: isJsonRequest
          ? requestJson
          : undefined,
        form: !isJsonRequest ? requestFormData : undefined,
        headers: webhook.headers,
        json: isJsonRequest,
        method: webhook.requestType,
        qs: requestQuery,
        strictSSL: webhook.rejectUnauthorized,
        url: requestUrl,
      };

      const responseBody = await this._callWebhook(
        webhook,
        event,
        requestOptions,
      );
      if (!responseBody) {
        return;
      }

      // TODO: responseBody is a string/buffer.
      // We should only render this if it has been converted to a JSON object
      const responseTemplate = webhook.responseTemplate && hogan
        .compile(webhook.responseTemplate)
        .render(responseBody);

      const chunks = splitBufferIntoChunks(
        Buffer.from(responseTemplate || responseBody),
        MAX_RESPONSE_MESSAGE_CHUNK_SIZE,
      );

      chunks.forEach((chunk: Buffer, index: number) => {
        const responseEventName =
          responseTopic && `${responseTopic}/${index}` ||
          `hook-response/${event.name}/${index}`;

        this._eventPublisher.publish({
          data: chunk,
          name: responseEventName,
          userID: event.userID,
        });
      });
    } catch (error) {
      logger.error(`webhookError: ${error}`);
    }
  };

  _throttledWebhookHandler = throttle(
    this.runWebhook,
    WEBHOOK_THROTTLE_TIME,
    { leading: false, trailing: true },
  );

  // todo annotate requestOptions
  _callWebhook = (
    webhook: Webhook,
    event: Event,
    requestOptions: Object,
  ): Promise<*> => new Promise(
    (resolve, reject) => request(
      requestOptions,
      (
        error: ?Error,
        response: http$IncomingMessage,
        responseBody: string | Buffer | Object,
      ) => {
        // todo check response.statusCode > 300 also.
        if (error) {
          this._incrementWebhookErrorCounter(webhook.id);

          this._eventPublisher.publish({
            data: error.message,
            name: this._compileErrorResponseTopic(
              webhook,
              event,
            ),
            userID: event.userID,
          });

          reject(error);
        }

        this._resetWebhookErrorCounter(webhook.id);

        this._eventPublisher.publish({
          name: `hook-sent/${event.name}`,
          userID: event.userID,
        });

        resolve(responseBody);
      },
    ),
  );

  _getEventData = (event: Event, noDefaults: boolean = false): Object => {
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
    };

    const eventDataVariables = this._parseEventData(event);

    return noDefaults
      ? eventDataVariables
      : {
        ...defaultWebhookVariables,
        ...eventDataVariables,
      };
  };

  _parseEventData = (event: Event): Object => {
    try {
      if (event.data) {
        return JSON.parse(event.data);
      }
      return {};
    } catch (error) {
      return {};
    }
  }

  _compileTopic = (topic?: ?string, variables: Object): ?string =>
    topic && hogan
      .compile(topic)
      .render(variables);

  _compileJsonTopic = (topic?: ?Object, variables: Object): ?Object => {
    if (!topic) {
      return;
    }

    const compiledTopic = this._compileTopic(JSON.stringify(topic), variables);
    if (!compiledTopic) {
      return null;
    }

    return JSON.parse(compiledTopic);
  };

  _compileErrorResponseTopic = (webhook: Webhook, event: Event): string => {
    const variables = this._getEventData(event, webhook.noDefaults);
    return this._compileTopic(
      webhook.errorResponseTopic,
      variables,
    ) || `hook-error/${event.name}`;
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
