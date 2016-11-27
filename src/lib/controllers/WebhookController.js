import type {Webhook} from '../../types';
import type {WebhookRepositoryType} from './types';

import settings from '../../settings';
import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

class WebhookController extends Controller {
  _webhookRepository: RepositoryType<Webhook>;

  constructor(webhookRepository: RepositoryType<Webhook>) {
    super();

    this._webhookRepository = webhookRepository;
  }

  @httpVerb('get');
  @route('/v1/webhooks');
  get() {
    return this.ok(this._webhookRepository.getAll());
  }

  @httpVerb('get');
  @route('/v1/webhooks/:webhookId');
  getByWebhookId({webhookId}: {webhookId: string}) {
    return this.ok(this._webhookRepository.getById(webhookId));
  }

  @httpVerb('post');
  @route('/v1/webhooks');
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

  @httpVerb('delete');
  @route('/v1/webhooks/:webhookId');
  delete({webhookId}: {webhookId: string}) {
    this._webhookRepository.delete(webhookId);
    return this.ok();
  }
}

export default WebhookController;
