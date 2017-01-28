/* eslint-disable */
import test from 'ava';
import request from 'supertest';
import sinon from 'sinon';
import ouathClients from '../src/oauthClients.json';
import app from './setup/testApp';
import TestData from './setup/TestData';


const container = app.container;
let DEVICE_ID = null;
let testUser;
let userToken;
let deviceToApiAttributes;

test.before(async () => {
  const USER_CREDENTIALS = TestData.getUser();
  DEVICE_ID = TestData.getID();

  const userResponse = await request(app)
    .post('/v1/users')
    .send(USER_CREDENTIALS);

  testUser = await container.constitute('UserRepository')
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

test('should throw an error for compile source code endpoint', async t => {
  const response = await request(app)
    .post('/v1/binaries')
    .query({ access_token: userToken });

  t.is(response.status, 400);
});

test.serial('should return device details', async t => {
  const response = await request(app)
    .get(`/v1/devices/${DEVICE_ID}`)
    .query({ access_token: userToken });

  t.is(response.status, 200);
  t.is(response.body.id, deviceToApiAttributes.id);
  t.is(response.body.name, deviceToApiAttributes.name);
  t.is(response.body.ownerID, deviceToApiAttributes.ownerID);
});

test.serial('should throw an error if device not found', async t => {
  const response = await request(app)
    .get(`/v1/devices/${DEVICE_ID}123`)
    .query({ access_token: userToken });

  t.is(response.status, 404);
  t.is(response.body.error, 'No device found');
});

test.serial('should return all devices', async t => {
  const response = await request(app)
    .get('/v1/devices/')
    .query({ access_token: userToken });

  const devices = response.body;

  t.is(response.status, 200);
  t.truthy(Array.isArray(devices) && devices.length > 0);
});

test.serial('should unclaim device', async t => {
  const unclaimResponse = await request(app)
    .delete(`/v1/devices/${DEVICE_ID}`)
    .query({ access_token: userToken });

  t.is(unclaimResponse.status, 200);
  t.is(unclaimResponse.body.ok, true);

  const getDeviceResponse = await request(app)
    .get(`/v1/devices/${DEVICE_ID}`)
    .query({ access_token: userToken });

  t.is(getDeviceResponse.status, 404);
});

test.serial('should claim device', async t => {
  const claimDeviceResponse = await request(app)
    .post('/v1/devices')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      access_token: userToken,
      id: DEVICE_ID,
    });

  t.is(claimDeviceResponse.status, 200);
  t.is(claimDeviceResponse.body.ok, true);

  const getDeviceResponse = await request(app)
    .get(`/v1/devices/${DEVICE_ID}`)
    .query({ access_token: userToken });

  t.is(getDeviceResponse.status, 200);
});

test.serial(
  'should throw an error if device belongs to somebody else',
  async t => {
    const deviceAttributesStub = sinon.stub(
      container.constitute('DeviceAttributeRepository'),
      'getById',
    ).returns({ ownerID: TestData.getID()});

    const claimDeviceResponse = await request(app)
      .post('/v1/devices')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        id: DEVICE_ID,
      });

    deviceAttributesStub.restore();

    t.is(claimDeviceResponse.status, 400);
    t.is(claimDeviceResponse.body.error, 'The device belongs to someone else.');
  },
);

test.serial(
  'should return function call result and device attributes',
  async t => {
    const testFunctionName = 'testFunction';
    const testArgument = 'testArgument';
    const device = {
      callFunction: (functionName, functionArguments) =>
        functionName === testFunctionName && functionArguments.argument,
      ping: () => ({
        connected: true,
        lastPing: new Date(),
      }),
    };

    const deviceServerStub = sinon.stub(
      container.constitute('DeviceServer'),
      'getDevice',
    ).returns(device);

    const callFunctionResponse = await request(app)
      .post(`/v1/devices/${DEVICE_ID}/${testFunctionName}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        argument: testArgument,
      });


    deviceServerStub.restore();

    t.is(callFunctionResponse.status, 200);
    t.is(callFunctionResponse.body.return_value, testArgument);
    t.is(callFunctionResponse.body.connected, true);
    t.is(callFunctionResponse.body.id, DEVICE_ID);
  },
);

test.serial(
  'should throw an error if function doesn\'t exist',
  async t => {
    const testFunctionName = 'testFunction';
    const device = {
      callFunction: (functionName, functionArguments) => {
        if(functionName !== testFunctionName) {
          throw new Error(`Unknown Function ${functionName}`)
        }
        return 1;
      },
      ping: () => ({
        connected: true,
        lastPing: new Date(),
      }),
    };

    const deviceServerStub = sinon.stub(
      container.constitute('DeviceServer'),
      'getDevice',
    ).returns(device);

    const callFunctionResponse = await request(app)
      .post(`/v1/devices/${DEVICE_ID}/wrong${testFunctionName}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
      });

    deviceServerStub.restore();

    t.is(callFunctionResponse.status, 404);
    t.is(callFunctionResponse.body.error, 'Function not found');
  },
);

test.serial(
  'should return variable value',
  async t => {
    const testVariableName = 'testVariable';
    const testVariableResult = 'resultValue';
    const device = {
      getVariableValue: (variableName) =>
        variableName === testVariableName && testVariableResult,
    };

    const deviceServerStub = sinon.stub(
      container.constitute('DeviceServer'),
      'getDevice',
    ).returns(device);

    const getVariableResponse = await request(app)
      .get(`/v1/devices/${DEVICE_ID}/${testVariableName}/`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .query({ access_token: userToken });

    deviceServerStub.restore();

    t.is(getVariableResponse.status, 200);
    t.is(getVariableResponse.body.result, testVariableResult);
  },
);

test.serial(
  'should throw an error if variable not found',
  async t => {
    const testVariableName = 'testVariable';
    const device = {
      getVariableValue: (variableName) => {
        if(variableName !== testVariableName) {
          throw new Error(`Variable not found`)
        }
        return 1;
      },
    };

    const deviceServerStub = sinon.stub(
      container.constitute('DeviceServer'),
      'getDevice',
    ).returns(device);

    const getVariableResponse = await request(app)
      .get(`/v1/devices/${DEVICE_ID}/wrong${testVariableName}/`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .query({ access_token: userToken });

    deviceServerStub.restore();

    t.is(getVariableResponse.status, 404);
    t.is(getVariableResponse.body.error, 'Variable not found');
  },
);

test.serial(
  'should rename device',
  async t => {
    const newDeviceName = 'newDeviceName';

    const renameDeviceResponse = await request(app)
      .put(`/v1/devices/${DEVICE_ID}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        name: newDeviceName,
      });

    t.is(renameDeviceResponse.status, 200);
    t.is(renameDeviceResponse.body.name, newDeviceName);
  },
);

test.serial(
  'should call raise your hand function on device',
  async t => {
    const raiseYourHandSpy = sinon.spy();
    const device = {
      raiseYourHand: raiseYourHandSpy,
    };

    const deviceServerStub = sinon.stub(
      container.constitute('DeviceServer'),
      'getDevice',
    ).returns(device);

    const raiseYourHandResponse = await request(app)
      .put(`/v1/devices/${DEVICE_ID}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        signal: true,
      });

    deviceServerStub.restore();

    t.is(raiseYourHandResponse.status, 200);
    t.truthy(raiseYourHandSpy.called);
    t.is(raiseYourHandResponse.body.id, DEVICE_ID);
  },
);

test.serial(
  'should start device flashing process with known application',
  async t => {
    const knownAppName = 'knownAppName';
    const knownAppBuffer = new Buffer(knownAppName);
    const flashStatus = 'update finished';
    const device = {
      flash: () => flashStatus,
    };
    const flashSpy = sinon.spy(device, 'flash');

    const deviceServerStub = sinon.stub(
      container.constitute('DeviceServer'),
      'getDevice',
    ).returns(device);


    const deviceFirmwareStub = sinon.stub(
      container.constitute('DeviceFirmwareRepository'),
      'getByName',
    ).returns(knownAppBuffer);

    const flashKnownAppResponse = await request(app)
      .put(`/v1/devices/${DEVICE_ID}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        app_id: knownAppName,
      });

    deviceServerStub.restore();
    deviceFirmwareStub.restore();

    t.is(flashKnownAppResponse.status, 200);
    t.truthy(flashSpy.calledWith(knownAppBuffer));
    t.is(flashKnownAppResponse.body.status, flashStatus);
    t.is(flashKnownAppResponse.body.id, DEVICE_ID);
  },
);

test.serial(
  'should throws an error if known application not found',
  async t => {
    const knownAppName = 'knownAppName';
    const deviceServerStub = sinon.stub(
      container.constitute('DeviceServer'),
      'getDevice',
    ).returns({});

    const flashKnownAppResponse = await request(app)
      .put(`/v1/devices/${DEVICE_ID}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        app_id: knownAppName,
      });

    deviceServerStub.restore();

    t.is(flashKnownAppResponse.status, 404);
    t.is(
      flashKnownAppResponse.body.error,
      `No firmware ${knownAppName} found`,
    );
  },
);

// TODO write tests custom firmware flash tests

test.after.always(async (): Promise<void> => {
  await container.constitute('UserRepository').deleteById(testUser.id);
  await container.constitute('DeviceAttributeRepository').deleteById(DEVICE_ID);
  await container.constitute('DeviceKeyRepository').delete(DEVICE_ID);
});
