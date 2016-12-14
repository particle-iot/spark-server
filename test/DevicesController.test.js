import test from 'ava';
import request from 'supertest-as-promised';
import ouathClients from '../src/oauthClients.json';
import app from './testApp';
import settings from './settings';

const USER_CREDENTIALS = {
  password: 'password',
  username: 'deviceTestUser@test.com',
};

let testUser;
let userToken;

test.before(async () => {
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
});

test.serial('should throw an error for compile source code endpoint', async t => {
  const response = await request(app)
    .post('/v1/binaries')
    .query({ access_token: userToken });

  t.is(response.status, 400);
  t.is(response.body.error, 'not supported in the current server version');
});

test.after.always(() => {
  settings.usersRepository.deleteById(testUser.id);
});
