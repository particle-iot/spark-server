// @flow

import type {
  Repository,
  RequestType,
  Webhook,
  WebhookMutator,
} from '../../types';

import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

const REQUEST_TYPES: Array<RequestType> = [
  'DELETE', 'GET', 'POST', 'PUT',
];

const validateWebhookModel = (webhook: Webhook): ?Error => {
  if (!webhook.event) {
    return new Error('no event name provided');
  }
  if (!webhook.url) {
    return new Error('no url provided');
  }
  if (!webhook.requestType) {
    return new Error('no requestType provided');
  }
  if (!REQUEST_TYPES.includes(webhook.requestType)) {
    return new Error('wrong requestType');
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
  getAll(): Object {
    return this.ok(this._webhookRepository.getAll());
  }

  @httpVerb('get')
  @route('/v1/webhooks/:webhookId')
  getById(webhookId: string): Object {
    return this.ok(this._webhookRepository.getById(webhookId));
  }

  @httpVerb('post')
  @route('/v1/webhooks')
  create(model: WebhookMutator): Object {
    try {
      const validateError = validateWebhookModel(model);
      if (validateError) {
        throw validateError;
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
  deleteById(webhookId: string): Object {
    this._webhookRepository.deleteById(webhookId);
    return this.ok();
  }
}

export default WebhookController;
