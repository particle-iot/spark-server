import type {  TokenObject, UserCredentials } from '../src/types';

import test from 'ava';
import request from 'supertest-as-promised';
import ouathClients from '../src/oauthClients.json';
import app from './setup/testApp';
import settings from './setup/settings';

const USER_CREDENTIALS: UserCredentials = {
  password: 'password',
  username: 'newUser@test.com',
};

let user;
let userToken;

test.serial('should return a new user object', async t => {
  const response = await request(app)
    .post('/v1/users')
    .send(USER_CREDENTIALS);

  user = response.body;

  t.is(response.status, 200);
  t.truthy(user.username === USER_CREDENTIALS.username);
  t.truthy(user.id && user.passwordHash && user.salt && user.created_at);
});

test.serial('should throw an error if username already in use', async t => {
  const response = await request(app)
    .post('/v1/users')
    .send(USER_CREDENTIALS);
  t.is(response.status, 400);
  t.is(response.body.error, 'user with the username is already exist');
});

test.serial('should login the user', async t => {
  const response = await request(app)
    .post('/oauth/token')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      client_id: ouathClients[0].clientId,
      client_secret: ouathClients[0].clientSecret,
      grant_type: 'password',
      password: USER_CREDENTIALS.password,
      username: USER_CREDENTIALS.username,
    });

  userToken = response.body.access_token;

  t.is(response.status, 200);
  t.truthy(userToken && response.body.token_type === 'Bearer');
});

test.serial('should return all access tokens for the user', async t => {
  const response = await request(app)
    .get('/v1/access_tokens')
    .auth(USER_CREDENTIALS.username, USER_CREDENTIALS.password);

  const tokens = response.body;

  t.is(response.status, 200);
  t.truthy(Array.isArray(tokens) && tokens.length > 0);
});


test.serial('should deleteById access token for the user', async t => {
  const deleteResponse = await request(app)
    .delete(`/v1/access_tokens/${userToken}`)
    .auth(USER_CREDENTIALS.username, USER_CREDENTIALS.password);

  const allTokensResponse = await request(app)
    .get('/v1/access_tokens')
    .auth(USER_CREDENTIALS.username, USER_CREDENTIALS.password);

  const allTokens = allTokensResponse.body;

  t.is(deleteResponse.status, 200);
  t.falsy(allTokens.some((tokenObject: TokenObject): boolean =>
    tokenObject.accessToken === userToken,
  ));
});

test.after.always(async (): Promise<void> => {
  await settings.usersRepository.deleteById(user.id);
});
