// @flow

import type {
  Event,
  Repository,
  Webhook,
  WebhookMutator,
} from '../types';
import type { EventPublisher } from 'spark-protocol';

import request from 'request';
import logger from '../lib/logger';
import HttpError from '../lib/HttpError';

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
        const responseHandler = (error, response) => {
          if (error) {
            // todo block the webhook calls after some amount of fails
            // on 1 min or so..
            // todo responseTemplates
            throw error;
          }
        };

        // todo request <-> webhooks options
        request({
          body: webhook.json,
          formData: webhook.form,
          headers: webhook.headers,
          json: !!webhook.json,
          method: webhook.requestType,
          url: webhook.url,
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
