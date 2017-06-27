/* eslint-disable */
import type { Webhook, WebhookMutator } from '../src/types';

import test from 'ava';
import request from 'supertest';
import ouathClients from '../src/oauthClients.json';
import app from './setup/testApp';
import settings from './setup/settings';
import TestData from './setup/TestData';

const container = app.container;
const WEBHOOK_MODEL: WebhookMutator = {
  event: 'testEvent',
  requestType: 'GET',
  url: 'http://webhooktest.com/',
};

let testUser;
let userToken;
let testWebhook;

test.before(async () => {
  const USER_CREDENTIALS = TestData.getUser();
  const userResponse = await request(app)
    .post('/v1/users')
    .send(USER_CREDENTIALS);

  testUser = await container
    .constitute('UserRepository')
    .getByUsername(USER_CREDENTIALS.username);

  const tokenResponse = await request(app)
    .post('/oauth/token')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      client_id: ouathClients[0].clientId,
      client_secret: ouathClients[0].clientSecret,
      grant_type: 'password',
      password: USER_CREDENTIALS.password,
      username: USER_CREDENTIALS.username,
    });

  userToken = tokenResponse.body.access_token;

  if (!userToken) {
    throw new Error('test user creation fails');
  }
});

test.serial('should create a new webhook object', async t => {
  const response = await request(app)
    .post('/v1/webhooks')
    .query({ access_token: userToken })
    .send({
      event: WEBHOOK_MODEL.event,
      requestType: WEBHOOK_MODEL.requestType,
      url: WEBHOOK_MODEL.url,
    });

  testWebhook = response.body;

  t.is(response.status, 200);
  t.truthy(testWebhook.id && testWebhook.event && testWebhook.url);
});

test("should throw an error if event isn't provided", async t => {
  const response = await request(app)
    .post('/v1/webhooks')
    .query({ access_token: userToken })
    .send({
      requestType: WEBHOOK_MODEL.requestType,
      url: WEBHOOK_MODEL.url,
    });

  t.is(response.status, 400);
  t.is(response.body.error, 'no event name provided');
});

test("should throw an error if url isn't provided", async t => {
  const response = await request(app)
    .post('/v1/webhooks')
    .query({ access_token: userToken })
    .send({
      event: WEBHOOK_MODEL.event,
      requestType: WEBHOOK_MODEL.requestType,
    });

  t.is(response.status, 400);
  t.is(response.body.error, 'no url provided');
});

test("should throw an error if requestType isn't provided", async t => {
  const response = await request(app)
    .post('/v1/webhooks')
    .query({ access_token: userToken })
    .send({
      event: WEBHOOK_MODEL.event,
      url: WEBHOOK_MODEL.url,
    });

  t.is(response.status, 400);
  t.is(response.body.error, 'no requestType provided');
});

test.serial('should return all webhooks', async t => {
  const response = await request(app)
    .get('/v1/webhooks')
    .query({ access_token: userToken });

  const webhooks = response.body;

  t.is(response.status, 200);
  t.truthy(Array.isArray(webhooks) && webhooks.length > 0);
});

test.serial('should return webhook object by id', async t => {
  const response = await request(app)
    .get(`/v1/webhooks/${testWebhook.id}`)
    .query({ access_token: userToken });

  t.is(response.status, 200);
  t.is(testWebhook.id, response.body.id);
  t.is(testWebhook.event, response.body.event);
  t.is(testWebhook.url, response.body.url);
});

test.serial('should delete webhook', async t => {
  const deleteResponse = await request(app)
    .delete(`/v1/webhooks/${testWebhook.id}`)
    .query({ access_token: userToken });

  t.is(deleteResponse.status, 200);

  const allWebhooksResponse = await request(app)
    .get('/v1/webhooks')
    .query({ access_token: userToken });

  t.is(allWebhooksResponse.status, 200);

  const webhooks = allWebhooksResponse.body;

  t.falsy(
    webhooks.some((webhook: Webhook): boolean => webhook.id === testWebhook.id),
  );
});

test.after.always(async (): Promise<void> => {
  await container.constitute('WebhookRepository').deleteByID(testWebhook.id);
  await container.constitute('UserRepository').deleteByID(testUser.id);
});
