const ViewBase = require('./Controller');

const ROUTE_BASE = '/v1/webhooks';

class WebhookController extends Controller {
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

module.exports = WebhookController;
