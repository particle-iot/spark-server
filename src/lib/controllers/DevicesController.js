// @flow

import type { Repository, Webhook } from '../../types';

import settings from '../../settings';
import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

class DevicesController extends Controller {
  _webhookRepository: Repository<Webhook>;

  constructor(webhookRepository: Repository<Webhook>) {
    super();

    this._webhookRepository = webhookRepository;
  }

  @httpVerb('get')
  @route('/v1/devices')
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
    const newWebhook = this._webhookRepository.create(model);
    return this.ok({
      created_at: newWebhook.created_at,
      event: newWebhook.event,
      hookUrl: settings.baseUrl + '/v1/webhooks/' + newWebhook.id,
      id: newWebhook.id,
      ok: true,
      url: newWebhook.url,
    });
  }

  @httpVerb('delete')
  @route('/v1/webhooks/:webhookId')
  delete(webhookId: string) {
    this._webhookRepository.delete(webhookId);
    return this.ok();
  }
}

export default DevicesController;
