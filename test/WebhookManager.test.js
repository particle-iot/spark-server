import test from 'ava';
import sinon from 'sinon';

import { EventPublisher } from 'spark-protocol';
import WebhookFileRepository from '../src/repository/WebhookFileRepository';
import WebhookManager from '../src/managers/WebhookManager';
import TestData from './setup/TestData';

/*
auth
deviceID
errorResponseTopic
headers
mydevices
noDefaults
productIdOrSlug
query
rejectUnauthorized
requestType
responseTemplate
responseTopic
url
*/

const WEBHOOK_BASE = {
  event: 'test-event',
  requestType: 'POST',
  url: 'https://test.com/',
};

const getEvent = (data?: string) => ({
  data,
  deviceID: TestData.getID(),
  name: 'test-event',
  publishedAt: new Date(),
  ttl: 60,
  userID: TestData.getID(),
});

test.beforeEach(t => {
  const repository = new WebhookFileRepository('');
  repository.getAll = sinon.stub().returns([]);
  t.context.repository = repository;
  const eventPublisher = new EventPublisher();
  eventPublisher.publish = sinon.stub();
  t.context.eventPublisher = eventPublisher;
});

test(
  'should run basic request',
  async t => {
    const manager =
      new WebhookManager(t.context.repository, t.context.eventPublisher);
    const data = 'testData'
    const event = getEvent(data);

    manager._callWebhook = sinon.spy((webhook, event, requestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(requestOptions.form, undefined);
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.json, false);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.qs, undefined);
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    });

    manager.runWebhook(WEBHOOK_BASE, event);
  },
);

test(
  'should compile json topic',
  async t => {
    const manager =
      new WebhookManager(t.context.repository, t.context.eventPublisher);
    const data = '{"t":"123"}'
    const event = getEvent(data);
    const webhook = {
      ...WEBHOOK_BASE,
      json: {
        "testValue": "{{t}}",
      },
    };

    manager._callWebhook = sinon.spy((webhook, event, requestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(
        JSON.stringify(requestOptions.body),
        JSON.stringify({testValue: '123'}),
      );
      t.is(requestOptions.form, undefined);
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.json, true);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.qs, undefined);
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    });

    manager.runWebhook(webhook, event);
  },
);

test(
  'should compile form body',
  async t => {
    const manager =
      new WebhookManager(t.context.repository, t.context.eventPublisher);
    const data = '{"t":"123","g": "foo bar"}'
    const event = getEvent(data);
    const webhook = {
      ...WEBHOOK_BASE,
      form: {
        "testValue": "{{t}}",
        "testValue2": "{{g}}",
      },
    };
    manager._callWebhook = sinon.spy((webhook, event, requestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(
        JSON.stringify(requestOptions.form),
        JSON.stringify({testValue: '123', testValue2: 'foo bar'}),
      );
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.json, false);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.qs, undefined);
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    });

    manager.runWebhook(webhook, event);
  },
);

test(
  'should compile request url',
  async t => {
    const manager =
      new WebhookManager(t.context.repository, t.context.eventPublisher);
    const data = '{"t":"123","g": "foobar"}'
    const event = getEvent(data);
    const webhook = {
      ...WEBHOOK_BASE,
      url: 'https://test.com/{{t}}/{{g}}',
    };
    manager._callWebhook = sinon.spy((webhook, event, requestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(requestOptions.form, undefined),
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.json, false);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.qs, undefined);
      t.is(requestOptions.url, 'https://test.com/123/foobar');
    });

    manager.runWebhook(webhook, event);
  },
);

test(
  'should compile request query',
  async t => {
    const manager =
      new WebhookManager(t.context.repository, t.context.eventPublisher);
    const data = '{"t":"123","g": "foobar"}'
    const event = getEvent(data);
    const webhook = {
      ...WEBHOOK_BASE,
      query: {
        "testValue": "{{t}}",
        "testValue2": "{{g}}",
      },
    };
    manager._callWebhook = sinon.spy((webhook, event, requestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(requestOptions.form, undefined),
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.json, false);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(
        JSON.stringify(requestOptions.qs),
        JSON.stringify({testValue: '123', testValue2: 'foobar'}),
      );
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    });

    manager.runWebhook(webhook, event);
  },
);

test(
  'should publish default topic',
  async t => {
    // TODO: Make sure that the default topic publishes. You should be able to
    // use the next test as an example (copy/paste and tweak it)
  },
);

test(
  'should compile response topic and publish',
  async t => {
    const manager =
      new WebhookManager(t.context.repository, t.context.eventPublisher);
    const event = getEvent();
    const webhook = {
      ...WEBHOOK_BASE,
      responseTopic: 'hook-response/tappt_request-pour-{{SPARK_CORE_ID}}',
    };
    manager._callWebhook = sinon.stub().returns('data');

    t.context.eventPublisher.publish = sinon.spy(({
      data,
      name,
      userID,
    }) => {
      t.is(data.toString(), 'data');
      t.is(name, `hook-response/tappt_request-pour-${event.deviceID}/0`);
      t.is(userID, event.userID);
    });

    manager.runWebhook(webhook, event);
  },
);

test(
  'should compile response body and publish',
  async t => {
    // TODO run most of the same code as the last test but use a
    // responseTemplate
  },
);
