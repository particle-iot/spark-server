/* eslint-disable */
import test from 'ava';
import request from 'supertest';
import sinon from 'sinon';
import ouathClients from '../src/oauthClients.json';
import app from './setup/testApp';
import TestData from './setup/TestData';
import { SPARK_SERVER_EVENTS } from 'spark-protocol';

const container = app.container;
let DEVICE_ID = null;
let testUser;
let userToken;
let deviceToApiAttributes;

test.before(async () => {
  const USER_CREDENTIALS = TestData.getUser();
  DEVICE_ID = TestData.getID();

  sinon.stub(
    container.constitute('EventPublisher'),
    'publishAndListenForResponse',
    ({ name }) => {
      if (name === SPARK_SERVER_EVENTS.GET_DEVICE_ATTRIBUTES) {
        return { error: new Error('Could not get device for ID') };
      }
      if (name === SPARK_SERVER_EVENTS.PING_DEVICE) {
        return {
          connected: true,
          lastHeard: new Date(),
        };
      }
    },
  );

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

  const provisionResponse = await request(app)
    .post(`/v1/provisioning/${DEVICE_ID}`)
    .query({ access_token: userToken })
    .send({ publicKey: TestData.getPublicKey() });

  deviceToApiAttributes = provisionResponse.body;

  if (!deviceToApiAttributes.id) {
    throw new Error('test device creation fails');
  }
});

test("should return claimCode, and user's devices ids", async t => {
  const response = await request(app)
    .post(`/v1/device_claims`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({ access_token: userToken });

  t.is(response.status, 200);
  t.truthy(response.body.claim_code);
  t.truthy(
    response.body.device_ids && response.body.device_ids[0] === DEVICE_ID,
  );
});

test.after.always(async (): Promise<void> => {
  await container.constitute('UserRepository').deleteByID(testUser.id);
  await container.constitute('DeviceAttributeRepository').deleteByID(DEVICE_ID);
  await container.constitute('DeviceKeyRepository').deleteByID(DEVICE_ID);
});
