// @flow

import type { WebhookMutator } from '../types';
import type WebhookManager from '../managers/WebhookManager';

import Controller from './Controller';
import HttpError from '../lib/HttpError';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

const validateWebhookMutator = (webhookMutator: WebhookMutator): ?HttpError => {
  if (!webhookMutator.event) {
    return new HttpError('no event name provided');
  }
  if (!webhookMutator.url) {
    return new HttpError('no url provided');
  }
  if (!webhookMutator.requestType) {
    return new HttpError('no requestType provided');
  }

  return null;
};

class WebhooksController extends Controller {
  _webhookManager: WebhookManager;

  constructor(webhookManager: WebhookManager) {
    super();

    this._webhookManager = webhookManager;
  }

  @httpVerb('get')
  @route('/v1/webhooks')
  async getAll(): Promise<*> {
    return this.ok(
      await this._webhookManager.getAll(this.user.id),
    );
  }

  @httpVerb('get')
  @route('/v1/webhooks/:webhookId')
  async getById(webhookId: string): Promise<*> {
    return this.ok(
      await this._webhookManager.getByID(
        webhookId,
        this.user.id,
      ),
    );
  }

  @httpVerb('post')
  @route('/v1/webhooks')
  async create(model: WebhookMutator): Promise<*> {
    const validateError = validateWebhookMutator(model);
    if (validateError) {
      throw validateError;
    }

    const newWebhook = await this._webhookManager.create({
      ...model,
      ownerID: this.user.id,
    });

    return this.ok({
      created_at: newWebhook.created_at,
      event: newWebhook.event,
      id: newWebhook.id,
      ok: true,
      url: newWebhook.url,
    });
  }

  @httpVerb('delete')
  @route('/v1/webhooks/:webhookId')
  async deleteById(webhookId: string): Promise<*> {
    await this._webhookManager.deleteByID(webhookId, this.user.id);
    return this.ok({ ok: true });
  }
}

export default WebhooksController;
