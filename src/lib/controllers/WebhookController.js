// @flow

import type { Repository, Webhook } from '../../types';

import settings from '../../settings';
import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';


const validateWebhookModel = (webhook: Webhook): ?Error => {
  if (!webhook.event) {
    return new Error('no event name provided');
  }
  if (!webhook.url) {
    return new Error('no url provided');
  }

  return null;
};

class WebhookController extends Controller {
  _webhookRepository: Repository<Webhook>;

  constructor(webhookRepository: Repository<Webhook>) {
    super();

    this._webhookRepository = webhookRepository;
  }

  @httpVerb('get')
  @route('/v1/webhooks')
  get() {
    return this.ok(this._webhookRepository.getAll());
  }

  @httpVerb('get')
  @route('/v1/webhooks/:webhookId')
  getByWebhookId(webhookId: string) {
    return this.ok(this._webhookRepository.getById(webhookId));
  }

  @httpVerb('post')
  @route('/v1/webhooks')
  post(model: Webhook) {
    try {
      const validateError = validateWebhookModel(model);
      if (validateError) {
        throw validateError;
      }

      const isEventInUse =
        this._webhookRepository.isEventInUse(model.event);

      if (isEventInUse) {
        throw new Error(`event ${model.event} is in use`);
      }

      const newWebhook = this._webhookRepository.create(model);
      return this.ok({
        created_at: newWebhook.created_at,
        event: newWebhook.event,
        id: newWebhook.id,
        ok: true,
        url: newWebhook.url,
      });
    } catch (error) {
      return this.bad(error.message);
    }
  }

  @httpVerb('delete')
  @route('/v1/webhooks/:webhookId')
  delete(webhookId: string) {
    this._webhookRepository.delete(webhookId);
    return this.ok();
  }
}

export default WebhookController;
