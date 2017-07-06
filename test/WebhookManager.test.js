/* eslint-disable */
import type { Event, RequestOptions, Webhook } from '../src/types';

import test from 'ava';
import sinon from 'sinon';

import { EventPublisher } from 'spark-protocol';
import WebhookFileRepository from '../src/repository/WebhookFileRepository';
import WebhookManager from '../src/managers/WebhookManager';
import TestData from './setup/TestData';
import Logger from '../src/lib/logger';

const WEBHOOK_BASE = {
  event: 'test-event',
  requestType: 'POST',
  url: 'https://test.com/',
};

const getEvent = (data?: string): Event => ({
  data,
  deviceID: TestData.getID(),
  name: 'test-event',
  publishedAt: new Date(),
  ttl: 60,
  userID: TestData.getID(),
});

const getDefaultRequestData = (event: Event): Object => ({
  coreid: event.deviceID,
  data: event.data,
  event: event.name,
  published_at: event.publishedAt,
});

test.beforeEach(t => {
  const repository = new WebhookFileRepository('');
  repository.getAll = sinon.stub().returns([]);
  t.context.repository = repository;
  const eventPublisher = new EventPublisher();
  eventPublisher.publish = sinon.stub();
  t.context.eventPublisher = eventPublisher;
});

test('should run basic request', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const data = 'testData';
  const event = getEvent(data);
  const defaultRequestData = getDefaultRequestData(event);

  manager._callWebhook = sinon.spy(
    (webhook: Webhook, event: Event, requestOptions: RequestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(
        JSON.stringify(requestOptions.form),
        JSON.stringify(defaultRequestData),
      );
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.qs, undefined);
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    },
  );

  manager.runWebhook(WEBHOOK_BASE, event);
});

test('should run basic request without default data', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const webhook = {
    ...WEBHOOK_BASE,
    noDefaults: true,
  };
  const data = 'testData';
  const event = getEvent(data);

  manager._callWebhook = sinon.spy(
    (webhook: Webhook, event: Event, requestOptions: RequestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(requestOptions.form, data);
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.qs, undefined);
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    },
  );

  manager.runWebhook(webhook, event);
});

test('should compile json body', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const data = '{"t":"123"}';
  const event = getEvent(data);
  const webhook = {
    ...WEBHOOK_BASE,
    json: {
      testValue: '{{t}}',
    },
  };
  const defaultRequestData = getDefaultRequestData(event);

  manager._callWebhook = sinon.spy(
    (webhook: Webhook, event: Event, requestOptions: RequestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(
        JSON.stringify(requestOptions.body),
        JSON.stringify({ ...defaultRequestData, testValue: '123' }),
      );
      t.is(requestOptions.form, undefined);
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.qs, undefined);
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    },
  );

  manager.runWebhook(webhook, event);
});

test('should compile form body', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const data = '{"t":"123","g": "foo bar"}';
  const event = getEvent(data);
  const webhook = {
    ...WEBHOOK_BASE,
    form: {
      testValue: '{{t}}',
      testValue2: '{{g}}',
    },
  };
  const defaultRequestData = getDefaultRequestData(event);

  manager._callWebhook = sinon.spy(
    (webhook: Webhook, event: Event, requestOptions: RequestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(
        JSON.stringify(requestOptions.form),
        JSON.stringify({
          ...defaultRequestData,
          testValue: '123',
          testValue2: 'foo bar',
        }),
      );
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.qs, undefined);
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    },
  );

  manager.runWebhook(webhook, event);
});

test('should compile request auth header', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const data = `{"username":"123","password": "foobar"}`;
  const event = getEvent(data);
  const webhook = {
    ...WEBHOOK_BASE,
    auth: {
      username: '{{username}}',
      password: '{{password}}',
    },
  };
  const defaultRequestData = getDefaultRequestData(event);

  manager._callWebhook = sinon.spy(
    (webhook: Webhook, event: Event, requestOptions: RequestOptions) => {
      t.is(
        JSON.stringify(requestOptions.auth),
        JSON.stringify({
          username: '123',
          password: 'foobar',
        }),
      );
      t.is(requestOptions.body, undefined);
      t.is(
        JSON.stringify(requestOptions.form),
        JSON.stringify(defaultRequestData),
      );
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    },
  );

  manager.runWebhook(webhook, event);
});

test('should compile request headers', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const data = `{"t":"123","g": "foobar"}`;
  const event = getEvent(data);
  const webhook = {
    ...WEBHOOK_BASE,
    headers: {
      testHeader1: '{{t}}',
      testHeader2: '{{g}}',
    },
  };
  const defaultRequestData = getDefaultRequestData(event);

  manager._callWebhook = sinon.spy(
    (webhook: Webhook, event: Event, requestOptions: RequestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(
        JSON.stringify(requestOptions.form),
        JSON.stringify(defaultRequestData),
      );
      t.is(
        JSON.stringify(requestOptions.headers),
        JSON.stringify({
          testHeader1: '123',
          testHeader2: 'foobar',
        }),
      );
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    },
  );

  manager.runWebhook(webhook, event);
});

test('should compile request url', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const data = '{"t":"123","g": "foobar"}';
  const event = getEvent(data);
  const webhook = {
    ...WEBHOOK_BASE,
    url: 'https://test.com/{{t}}/{{g}}',
  };
  const defaultRequestData = getDefaultRequestData(event);

  manager._callWebhook = sinon.spy(
    (webhook: Webhook, event: Event, requestOptions: RequestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(
        JSON.stringify(requestOptions.form),
        JSON.stringify(defaultRequestData),
      );
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(requestOptions.qs, undefined);
      t.is(requestOptions.url, 'https://test.com/123/foobar');
    },
  );

  manager.runWebhook(webhook, event);
});

test('should compile request query', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const data = '{"t":"123","g": "foobar"}';
  const event = getEvent(data);
  const webhook = {
    ...WEBHOOK_BASE,
    query: {
      testValue: '{{t}}',
      testValue2: '{{g}}',
    },
  };
  const defaultRequestData = getDefaultRequestData(event);

  manager._callWebhook = sinon.spy(
    (webhook: Webhook, event: Event, requestOptions: RequestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(
        JSON.stringify(requestOptions.form),
        JSON.stringify(defaultRequestData),
      );
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.method, WEBHOOK_BASE.requestType);
      t.is(
        JSON.stringify(requestOptions.qs),
        JSON.stringify({ testValue: '123', testValue2: 'foobar' }),
      );
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    },
  );

  manager.runWebhook(webhook, event);
});

test('should compile requestType', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const data = `{"t":"123","requestType": "post"}`;
  const event = getEvent(data);
  const webhook = {
    ...WEBHOOK_BASE,
    requestType: '{{requestType}}',
  };
  const defaultRequestData = getDefaultRequestData(event);

  manager._callWebhook = sinon.spy(
    (webhook: Webhook, event: Event, requestOptions: RequestOptions) => {
      t.is(requestOptions.auth, undefined);
      t.is(requestOptions.body, undefined);
      t.is(
        JSON.stringify(requestOptions.form),
        JSON.stringify(defaultRequestData),
      );
      t.is(requestOptions.headers, undefined);
      t.is(requestOptions.method, 'POST');
      t.is(requestOptions.url, WEBHOOK_BASE.url);
    },
  );

  manager.runWebhook(webhook, event);
});

test('should throw an error if wrong requestType is provided', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const testRequestType = 'wrongRequestType';
  const data = `{"t":"123","requestType": "${testRequestType}"}`;
  const event = getEvent(data);
  const webhook = {
    ...WEBHOOK_BASE,
    requestType: '{{requestType}}',
  };
  const defaultRequestData = getDefaultRequestData(event);

  Logger.error = sinon.spy((message: string) => {
    t.is(message, 'webhookError: Error: wrong requestType');
  });

  manager.runWebhook(webhook, event);
});

test('should publish sent event', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const event = getEvent();

  t.context.eventPublisher.publish = sinon.spy(({ data, name, userID }) => {
    t.is(data, undefined);
    t.is(name, `hook-sent/${event.name}`);
    t.is(userID, event.userID);
  });

  manager.runWebhook(WEBHOOK_BASE, event);
});

test('should publish default topic', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const event = getEvent();
  manager._callWebhook = sinon.stub().returns('data');

  t.context.eventPublisher.publish = sinon.spy(({ data, name, userID }) => {
    t.is(data.toString(), 'data');
    t.is(name, `hook-response/${event.name}/0`);
    t.is(userID, event.userID);
  });

  manager.runWebhook(WEBHOOK_BASE, event);
});

test('should compile response topic and publish', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const event = getEvent();
  const webhook = {
    ...WEBHOOK_BASE,
    responseTopic: 'hook-response/tappt_request-pour-{{SPARK_CORE_ID}}',
  };
  manager._callWebhook = sinon.stub().returns('data');

  t.context.eventPublisher.publish = sinon.spy(({ data, name, userID }) => {
    t.is(data.toString(), 'data');
    t.is(name, `hook-response/tappt_request-pour-${event.deviceID}/0`);
    t.is(userID, event.userID);
  });

  manager.runWebhook(webhook, event);
});

test('should compile response body and publish', async t => {
  const manager = new WebhookManager(
    t.context.eventPublisher,
    null,
    null,
    t.context.repository,
  );
  const event = getEvent();
  const webhook = {
    ...WEBHOOK_BASE,
    responseTemplate: 'testVar: {{t}}, testVar2: {{g}}',
  };
  manager._callWebhook = sinon.stub().returns({
    g: 'foobar',
    t: 123,
  });

  t.context.eventPublisher.publish = sinon.spy(({ data, name, userID }) => {
    t.is(data.toString(), 'testVar: 123, testVar2: foobar');
    t.is(name, `hook-response/${event.name}/0`);
    t.is(userID, event.userID);
  });

  manager.runWebhook(webhook, event);
});
