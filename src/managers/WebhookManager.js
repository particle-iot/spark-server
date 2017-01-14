// @flow

import type {
  Event,
  Repository,
  Webhook,
  WebhookMutator,
} from '../types';
import type { EventPublisher } from 'spark-protocol';

import hogan from 'hogan.js';
import HttpError from '../lib/HttpError';
import logger from '../lib/logger';
import request from 'request';
import throttle from 'lodash/throttle';

const MAX_WEBHOOK_ERRORS_COUNT = 10;
const WEBHOOK_THROTTLE_TIME = 1000 * 60; // 1min;

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

    (async (): Promise<void> => this._init())();
  }

  _init = async (): Promise<void> => {
    const allWebhooks = await this._webhookRepository.getAll();
    allWebhooks.forEach(
      (webhook: Webhook): void => this._subscribeWebhook(webhook),
    );
  };

  _incrementWebhookErrorCounter = (webhookID: string) => {
    const errorsCount = this._errorsCountByWebhookID.get(webhookID) || 0;
    this._errorsCountByWebhookID.set(webhookID, errorsCount + 1);
  };

  _resetWebhookErrorCounter = (webhookID: string): void =>
    this._errorsCountByWebhookID.set(webhookID, 0);

  // todo annotate arguments
  _webhookHandler = (
    requestOptions: Object,
    responseHandler: Function,
  ): void => request(requestOptions, responseHandler);

  _throttledWebhookHandler = throttle(
    this._webhookHandler,
    WEBHOOK_THROTTLE_TIME,
    { leading: false, trailing: true },
  );

  _onNewWebhookEvent = (webhook: Webhook): (event: Event) => void =>
    (event: Event) => {
      try {
        if (
          webhook.mydevices &&
          webhook.ownerID !== event.userID
        ) {
          return;
        }

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

        let eventDataVariables = {};
        try {
          eventDataVariables = JSON.parse(event.data);
        } catch (error) {
          eventDataVariables = {};
        }


        const webhookVariablesObject = webhook.noDefaults
          ? eventDataVariables
          : {
            ...defaultWebhookVariables,
            ...eventDataVariables,
          };

        const requestJSON = webhook.json && JSON.parse(
            hogan
              .compile(JSON.stringify(webhook.json))
              .render(webhookVariablesObject),
          );

        const requestFormData = webhook.form && JSON.parse(
            hogan
              .compile(JSON.stringify(webhook.form))
              .render(webhookVariablesObject),
          );

        const requestUrl = hogan
          .compile(webhook.url)
          .render(webhookVariablesObject);

        const requestQuery = webhook.query && JSON.parse(
            hogan
              .compile(JSON.stringify(webhook.query))
              .render(webhookVariablesObject),
          );

        const responseTopic = webhook.responseTopic && hogan
            .compile(webhook.responseTopic)
            .render(webhookVariablesObject);

        const errorResponseTopic = webhook.errorResponseTopic && hogan
            .compile(webhook.responseTopic)
            .render(webhookVariablesObject) || `hook-error/${event.name}`;

        const responseHandler = (
          error: ?Error,
          response: http$IncomingMessage,
          responseBody: string | Buffer | Object,
        ) => {
          if (error) {
            this._incrementWebhookErrorCounter(webhook.id);

            this._eventPublisher.publish({
              data: error.message,
              name: errorResponseTopic,
              userID: event.userID,
            });

            throw error;
          }

          this._resetWebhookErrorCounter(webhook.id);

          this._eventPublisher.publish({
            name: `hook-sent/${event.name}`,
            userID: event.userID,
          });

          const responseTemplate = webhook.responseTemplate && hogan
              .compile(webhook.responseTemplate)
              .render(responseBody);

          if (responseTopic) {
            this._eventPublisher.publish({
              data: webhook.responseTemplate && responseTemplate,
              name: responseTopic,
              userID: event.userID,
            });
          }
        };


        const requestOptions = {
          auth: webhook.auth,
          body: requestJSON || event.data,
          formData: requestFormData,
          headers: webhook.headers,
          json: !!requestJSON,
          method: webhook.requestType,
          qs: requestQuery,
          url: requestUrl,
        };

        const isWebhookDisabled =
          this._errorsCountByWebhookID.get(webhook.id) >= MAX_WEBHOOK_ERRORS_COUNT;

        if (isWebhookDisabled) {
          this._eventPublisher.publish({
            data: 'Too many errors, webhook disabled',
            name: errorResponseTopic,
            userID: event.userID,
          });

          this._throttledWebhookHandler(requestOptions, responseHandler);
        } else {
          this._webhookHandler(requestOptions, responseHandler);
        }
      } catch (error) {
        logger.error(`webhookError: ${error}`);
      }
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
}

export default WebhookManager;
