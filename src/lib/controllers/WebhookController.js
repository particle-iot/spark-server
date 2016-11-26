import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

class WebhookController extends Controller {

  @httpVerb('get');
  @route('/v1/webhooks');
  get(model) {
    return this.ok([
      {
        "id": "12345",
        "url": "https://samplesite.com",
        "event": "hello",
        "created_at": "2016-04-28T17:06:33.123Z",
        "requestType": "POST",
      },
      {
        "id": "11111",
        "url": "https://samplesite.com",
        "event": "hello",
        "created_at": "2016-04-28T17:06:33.123Z",
        "requestType": "POST",
      },
    ]);
  }

  @httpVerb('post');
  @route('/v1/webhooks');
  post(model) {
    const webhookToSave = {
      ...model,
      created_at: new Date(),
    };
    console.log();
    console.log('foo');
    console.log(model);
    console.log('bar');
    console.log();
    return this.ok();
  }
}

export default WebhookController;
