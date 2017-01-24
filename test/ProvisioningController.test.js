/* eslint-disable */
import test from 'ava';
import request from 'supertest-as-promised';
import ouathClients from '../src/oauthClients.json';
import app from './setup/testApp';
import TestData from './setup/TestData';

let USER_CREDENTIALS = {
  password: 'password',
  username: 'provisionTestUser@test.com',
};

let DEVICE_ID = '350023001951353337343733';
let TEST_PUBLIC_KEY =
  '-----BEGIN PUBLIC KEY-----\n' +
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCsxJFqlUOxK5bsEfTtBCe9sXBa' +
  '43q9QoSPFXEG5qY/+udOpf2SKacgfUVdUbK4WOkLou7FQ+DffpwztBk5fWM9qfzF' +
  'EQRVMS8xwS4JqqD7slXwuPWFpS9SGy9kLNy/pl1dtGm556wVX431Dg7UBKiXuNGR' +
  '7E8d2hfgeyiTtsWfUQIDAQAB\n' +
  '-----END PUBLIC KEY-----\n';

let testUser;
let userToken;

test.before(async () => {
  USER_CREDENTIALS = TestData.getUser();
  DEVICE_ID = TestData.getID();
  TEST_PUBLIC_KEY = TestData.getPublicKey();
  const userResponse = await request(app)
    .post('/v1/users')
    .send(USER_CREDENTIALS);

  testUser = userResponse.body;

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

// Used to get implementations
const container = app.container;
test.after.always(async (): Promise<void> => {
  await container.constitute('UserRepository').deleteById(testUser.id);
  await container.constitute('DeviceAttributeRepository').deleteById(DEVICE_ID);
  await container.constitute('DeviceKeyRepository').delete(DEVICE_ID);
});
