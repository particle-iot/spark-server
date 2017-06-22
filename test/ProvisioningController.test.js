/* eslint-disable */
import test from 'ava';
import request from 'supertest';
import sinon from 'sinon';
import ouathClients from '../src/oauthClients.json';
import app from './setup/testApp';
import TestData from './setup/TestData';
import { SPARK_SERVER_EVENTS } from 'spark-protocol';

const container = app.container;
let DEVICE_ID;
let TEST_PUBLIC_KEY;
let testUser;
let userToken;

test.before(async () => {
  const USER_CREDENTIALS = TestData.getUser();
  DEVICE_ID = TestData.getID();
  TEST_PUBLIC_KEY = TestData.getPublicKey();

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
});

test('provision and add keys for a device.', async t => {
  const response = await request(app)
    .post(`/v1/provisioning/${DEVICE_ID}`)
    .query({ access_token: userToken })
    .send({ publicKey: TEST_PUBLIC_KEY });
  console.log(response.body);

  t.is(response.status, 200);
  t.is(response.body.id, DEVICE_ID);
});

test('should throw an error if public key has wrong format', async t => {
  const response = await request(app)
    .post(`/v1/provisioning/${DEVICE_ID}`)
    .query({ access_token: userToken })
    .send({ publicKey: `dsfsdf13${TEST_PUBLIC_KEY}` });

  t.is(response.status, 400);
  t.truthy(response.body.error);
});

test('should throw an error if public key is not provided', async t => {
  const response = await request(app)
    .post(`/v1/provisioning/${DEVICE_ID}`)
    .query({ access_token: userToken });

  t.is(response.status, 400);
  t.is(response.body.error, 'No key provided');
});

test.after.always(async (): Promise<void> => {
  await container.constitute('UserRepository').deleteByID(testUser.id);
  await container.constitute('DeviceAttributeRepository').deleteByID(DEVICE_ID);
  await container.constitute('DeviceKeyRepository').deleteByID(DEVICE_ID);
});
