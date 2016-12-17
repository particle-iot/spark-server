// @flow

import type {
  Repository,
  RequestType,
  Webhook,
  WebhookMutator,
} from '../types';

import Controller from './Controller';
import HttpError from '../lib/HttpError';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

const REQUEST_TYPES: Array<RequestType> = [
  'DELETE', 'GET', 'POST', 'PUT',
];

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
  if (!REQUEST_TYPES.includes(webhookMutator.requestType)) {
    return new HttpError('wrong requestType');
  }

  return null;
};

class WebhooksController extends Controller {
  _webhookRepository: Repository<Webhook>;

  constructor(webhookRepository: Repository<Webhook>) {
    super();

    this._webhookRepository = webhookRepository;
  }

  @httpVerb('get')
  @route('/v1/webhooks')
  async getAll(): Promise<*> {
    return this.ok(await this._webhookRepository.getAll());
  }

  @httpVerb('get')
  @route('/v1/webhooks/:webhookId')
  async getById(webhookId: string): Promise<*> {
    return this.ok(await this._webhookRepository.getById(webhookId));
  }

  @httpVerb('post')
  @route('/v1/webhooks')
  async create(model: WebhookMutator): Promise<*> {
    const validateError = validateWebhookMutator(model);
    if (validateError) {
      throw validateError;
    }

    const newWebhook = await this._webhookRepository.create({
      ...model,
      created_at: new Date(),
      id: '',
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
    this._webhookRepository.deleteById(webhookId);
    return this.ok();
  }
}

export default WebhooksController;
