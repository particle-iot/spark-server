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

const validateWebhookMutator = (webhookMutator: WebhookMutator): ?Error => {
  if (!webhookMutator.event) {
    return new Error('no event name provided');
  }
  if (!webhookMutator.url) {
    return new Error('no url provided');
  }
  if (!webhookMutator.requestType) {
    return new Error('no requestType provided');
  }
  if (!REQUEST_TYPES.includes(webhookMutator.requestType)) {
    return new Error('wrong requestType');
  }

  return null;
};

class WebhookController extends Controller {
  _webhookRepository: Repository<Webhook, WebhookMutator>;

  constructor(webhookRepository: Repository<Webhook, WebhookMutator>) {
    super();

    this._webhookRepository = webhookRepository;
  }

  @httpVerb('get')
  @route('/v1/webhooks')
  async getAll(): Promise<*> {
    return this.ok(this._webhookRepository.getAll());
  }

  @httpVerb('get')
  @route('/v1/webhooks/:webhookId')
  async getById(webhookId: string): Promise<*> {
    return this.ok(this._webhookRepository.getById(webhookId));
  }

  @httpVerb('post')
  @route('/v1/webhooks')
  async create(model: WebhookMutator): Promise<*> {
    try {
      const validateError = validateWebhookMutator(model);
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
  async deleteById(webhookId: string): Promise<*> {
    this._webhookRepository.deleteById(webhookId);
    return this.ok();
  }
}

export default WebhookController;
