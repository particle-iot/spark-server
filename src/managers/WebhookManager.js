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

class WebhookManager {
  _eventPublisher: EventPublisher;
  _subscriptionIDsByWebhookID: Map<string, string> = new Map();
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

  _onNewWebhookEvent = (webhook: Webhook): (event: Event) => void =>
    (event: Event) => {
      try {
        const defaultWebhookVariables = {
          // todo add old defaults for compatibility
          PARTICLE_DEVICE_ID: event.deviceID,
          PARTICLE_EVENT_NAME: event.name,
          PARTICLE_EVENT_VALUE: event.data,
          PARTICLE_PUBLISHED_AT: event.publishedAt,
        };

        let eventDataVariables = {};
        if (typeof event.data === 'string') {
          try {
            eventDataVariables = JSON.parse(event.data);
          } catch (error) {
            eventDataVariables = {};
          }
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
          .render(webhookVariablesObject);

        const responseHandler = (
          error: ?Error,
          response: http$IncomingMessage,
          responseBody: string | Buffer | Object,
        ) => {
          if (error) {
            // todo block the webhook calls after 10 fails
            // on 1 min or so..
            if (errorResponseTopic) {
              this._eventPublisher.publish({
                // todo not sure if we need to provide deviceID here
                deviceID: event.deviceID,
                name: errorResponseTopic,
                ttl: 60,
              });
            }
            throw error;
          }

          this._eventPublisher.publish({
            // todo not sure if we need to provide deviceID here
            deviceID: event.deviceID,
            name: `hook-sent/${event.name}`,
            ttl: 60,
          });

          const responseTemplate = webhook.responseTemplate && hogan
              .compile(webhook.responseTemplate)
              .render(responseBody);

          if (responseTopic) {
            this._eventPublisher.publish({
              // todo not sure if we need to provide deviceID here
              data: webhook.responseTemplate && responseTemplate,
              deviceID: event.deviceID,
              name: responseTopic,
              ttl: 60,
            });
          }
        };

        request({
          body: requestJSON,
          formData: requestFormData,
          headers: webhook.headers,
          json: true,
          method: webhook.requestType,
          qs: requestQuery,
          url: requestUrl,
          // todo add auth
        }, responseHandler);
      } catch (error) {
        logger.error(`webhook error: ${error}`);
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
