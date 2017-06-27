/* eslint-disable */
import test from 'ava';
import request from 'supertest';
import sinon from 'sinon';
import path from 'path';
import ouathClients from '../src/oauthClients.json';
import app from './setup/testApp';
import TestData from './setup/TestData';
import { SPARK_SERVER_EVENTS } from 'spark-protocol';

const container = app.container;
let customFirmwareFilePath;
let customFirmwareBuffer;

const USER_CREDENTIALS = TestData.getUser();
const CONNECTED_DEVICE_ID = TestData.getID();
const DISCONNECTED_DEVICE_ID = TestData.getID();
let testUser;
let userToken;
let connectedDeviceToApiAttributes;
let disconnectedDeviceToApiAttributes;

const getConnectedAttributes = () => connectedDeviceToApiAttributes;

const TEST_LAST_HEARD = new Date();
const TEST_DEVICE_FUNTIONS = ['testFunction'];
const TEST_FUNCTION_ARGUMENT = 'testArgument';
const TEST_DEVICE_VARIABLES = ['testVariable1', 'testVariable2'];
const TEST_VARIABLE_RESULT = 'resultValue';

test.before(async () => {
  sinon.stub(
    container.constitute('EventPublisher'),
    'publishAndListenForResponse',
    ({
      name,
      context: {
        deviceID,
        functionArguments,
        functionName,
        shouldShowSignal,
        variableName,
      },
    }) => {
      if (name === SPARK_SERVER_EVENTS.PING_DEVICE) {
        return deviceID === CONNECTED_DEVICE_ID
          ? {
              connected: true,
              lastHeard: TEST_LAST_HEARD,
            }
          : {
              connected: false,
              lastHeard: null,
            };
      }

      if (deviceID !== CONNECTED_DEVICE_ID) {
        return { error: new Error('Could not get device for ID') };
      }

      if (name === SPARK_SERVER_EVENTS.CALL_DEVICE_FUNCTION) {
        if (TEST_DEVICE_FUNTIONS.includes(functionName)) {
          return functionArguments.argument;
        } else {
          return { error: new Error(`Unknown Function ${functionName}`) };
        }
      }

      if (name === SPARK_SERVER_EVENTS.GET_DEVICE_ATTRIBUTES) {
        return {
          deviceID: CONNECTED_DEVICE_ID,
          functions: TEST_DEVICE_FUNTIONS,
          lastHeard: TEST_LAST_HEARD,
          ownerID: testUser.id,
          variables: TEST_DEVICE_VARIABLES,
        };
      }

      if (name === SPARK_SERVER_EVENTS.GET_DEVICE_VARIABLE_VALUE) {
        if (!TEST_DEVICE_VARIABLES.includes(variableName)) {
          throw new Error(`Variable not found`);
        }
        return { result: TEST_VARIABLE_RESULT };
      }

      if (name === SPARK_SERVER_EVENTS.FLASH_DEVICE) {
        return { status: 'Update finished' };
      }

      if (name === SPARK_SERVER_EVENTS.RAISE_YOUR_HAND) {
        return shouldShowSignal ? { status: 1 } : { status: 0 };
      }
    },
  );
  const { filePath, fileBuffer } = await TestData.createCustomFirmwareBinary();
  customFirmwareFilePath = filePath;
  customFirmwareBuffer = fileBuffer;

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

  const provisionConnectedDeviceResponse = await request(app)
    .post(`/v1/provisioning/${CONNECTED_DEVICE_ID}`)
    .query({ access_token: userToken })
    .send({ publicKey: TestData.getPublicKey() });

  connectedDeviceToApiAttributes = provisionConnectedDeviceResponse.body;

  const provisionDisconnectedDeviceResponse = await request(app)
    .post(`/v1/provisioning/${DISCONNECTED_DEVICE_ID}`)
    .query({ access_token: userToken })
    .send({ publicKey: TestData.getPublicKey() });

  disconnectedDeviceToApiAttributes = provisionDisconnectedDeviceResponse.body;

  if (
    !connectedDeviceToApiAttributes.id ||
    !disconnectedDeviceToApiAttributes.id
  ) {
    throw new Error('test devices creation fails');
  }
});

test('should throw an error for compile source code endpoint', async t => {
  const response = await request(app)
    .post('/v1/binaries')
    .query({ access_token: userToken });

  t.is(response.status, 400);
});

test.serial('should return device details for connected device', async t => {
  const response = await request(app)
    .get(`/v1/devices/${CONNECTED_DEVICE_ID}`)
    .query({ access_token: userToken });

  t.is(response.status, 200);
  t.is(response.body.connected, true);
  t.is(
    JSON.stringify(response.body.functions),
    JSON.stringify(TEST_DEVICE_FUNTIONS),
  );
  t.is(response.body.id, connectedDeviceToApiAttributes.id);
  t.is(response.body.name, connectedDeviceToApiAttributes.name);
  t.is(response.body.ownerID, connectedDeviceToApiAttributes.ownerID);
  t.is(
    JSON.stringify(response.body.variables),
    JSON.stringify(TEST_DEVICE_VARIABLES),
  );
  t.is(response.body.last_heard, TEST_LAST_HEARD.toISOString());
});

test.serial('should return device details for disconnected device', async t => {
  const response = await request(app)
    .get(`/v1/devices/${DISCONNECTED_DEVICE_ID}`)
    .query({ access_token: userToken });

  t.is(response.status, 200);
  t.is(response.body.connected, false);
  t.is(response.body.functions, null);
  t.is(response.body.id, disconnectedDeviceToApiAttributes.id);
  t.is(response.body.name, disconnectedDeviceToApiAttributes.name);
  t.is(response.body.ownerID, disconnectedDeviceToApiAttributes.ownerID);
  t.is(response.body.variables, null);
});

test.serial('should throw an error if device not found', async t => {
  const response = await request(app)
    .get(`/v1/devices/${CONNECTED_DEVICE_ID}123`)
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
    .delete(`/v1/devices/${DISCONNECTED_DEVICE_ID}`)
    .query({ access_token: userToken });

  t.is(unclaimResponse.status, 200);
  t.is(unclaimResponse.body.ok, true);

  const getDeviceResponse = await request(app)
    .get(`/v1/devices/${DISCONNECTED_DEVICE_ID}`)
    .query({ access_token: userToken });

  t.is(getDeviceResponse.status, 403);
});

test.serial('should claim device', async t => {
  const claimDeviceResponse = await request(app)
    .post('/v1/devices')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      access_token: userToken,
      id: DISCONNECTED_DEVICE_ID,
    });

  t.is(claimDeviceResponse.status, 200);
  t.is(claimDeviceResponse.body.ok, true);

  const getDeviceResponse = await request(app)
    .get(`/v1/devices/${DISCONNECTED_DEVICE_ID}`)
    .query({ access_token: userToken });

  t.is(getDeviceResponse.status, 200);
});

test.serial(
  'should throw a error if device is already claimed by the user',
  async t => {
    const claimDeviceResponse = await request(app)
      .post('/v1/devices')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        id: CONNECTED_DEVICE_ID,
      });

    t.is(claimDeviceResponse.status, 400);
    t.is(claimDeviceResponse.body.error, 'The device is already claimed.');
  },
);

test.serial(
  'should throw an error if device belongs to somebody else',
  async t => {
    const deviceAttributesStub = sinon
      .stub(container.constitute('DeviceAttributeRepository'), 'getByID')
      .returns({ ownerID: TestData.getID() });

    const claimDeviceResponse = await request(app)
      .post('/v1/devices')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        id: CONNECTED_DEVICE_ID,
      });

    deviceAttributesStub.restore();

    t.is(claimDeviceResponse.status, 400);
    t.is(claimDeviceResponse.body.error, 'The device belongs to someone else.');
  },
);

test.serial(
  'should return function call result and device attributes',
  async t => {
    const callFunctionResponse = await request(app)
      .post(`/v1/devices/${CONNECTED_DEVICE_ID}/${TEST_DEVICE_FUNTIONS[0]}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        argument: TEST_FUNCTION_ARGUMENT,
      });

    t.is(callFunctionResponse.status, 200);
    t.is(callFunctionResponse.body.return_value, TEST_FUNCTION_ARGUMENT);
    t.is(callFunctionResponse.body.connected, true);
    t.is(callFunctionResponse.body.id, CONNECTED_DEVICE_ID);
  },
);

test.serial("should throw an error if function doesn't exist", async t => {
  const callFunctionResponse = await request(app)
    .post(`/v1/devices/${CONNECTED_DEVICE_ID}/wrong${TEST_DEVICE_FUNTIONS[0]}`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      access_token: userToken,
    });

  t.is(callFunctionResponse.status, 404);
  t.is(callFunctionResponse.body.error, 'Function not found');
});

test.serial('should return variable value', async t => {
  const getVariableResponse = await request(app)
    .get(`/v1/devices/${CONNECTED_DEVICE_ID}/${TEST_DEVICE_VARIABLES[0]}/`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .query({ access_token: userToken });

  t.is(getVariableResponse.status, 200);
  t.is(getVariableResponse.body.result, TEST_VARIABLE_RESULT);
});

test.serial('should throw an error if variable not found', async t => {
  const getVariableResponse = await request(app)
    .get(`/v1/devices/${CONNECTED_DEVICE_ID}/wrong${TEST_DEVICE_VARIABLES[0]}/`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .query({ access_token: userToken });

  t.is(getVariableResponse.status, 404);
  t.is(getVariableResponse.body.error, 'Variable not found');
});

test.serial('should rename device', async t => {
  const newDeviceName = 'newDeviceName';

  const renameDeviceResponse = await request(app)
    .put(`/v1/devices/${CONNECTED_DEVICE_ID}`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      access_token: userToken,
      name: newDeviceName,
    });

  t.is(renameDeviceResponse.status, 200);
  t.is(renameDeviceResponse.body.name, newDeviceName);
});

test.serial('should invoke raise your hand on device', async t => {
  const raiseYourHandResponse = await request(app)
    .put(`/v1/devices/${CONNECTED_DEVICE_ID}`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      access_token: userToken,
      signal: '1',
    });

  t.is(raiseYourHandResponse.status, 200);
});

test.serial('should throw an error if signal is wrong value', async t => {
  const raiseYourHandResponse = await request(app)
    .put(`/v1/devices/${CONNECTED_DEVICE_ID}`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      access_token: userToken,
      signal: 'some wrong value',
    });

  t.is(raiseYourHandResponse.status, 400);
  t.truthy(raiseYourHandResponse.body.error, 'Wrong signal value');
});

test.serial(
  'should start device flashing process with known application',
  async t => {
    const knownAppName = 'knownAppName';
    const knownAppBuffer = new Buffer(knownAppName);

    const deviceFirmwareStub = sinon
      .stub(container.constitute('DeviceFirmwareRepository'), 'getByName')
      .returns(knownAppBuffer);

    const flashKnownAppResponse = await request(app)
      .put(`/v1/devices/${CONNECTED_DEVICE_ID}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        app_id: knownAppName,
      });
    deviceFirmwareStub.restore();

    t.is(flashKnownAppResponse.status, 200);
    t.is(flashKnownAppResponse.body.status, 'Update finished');
    t.is(flashKnownAppResponse.body.id, CONNECTED_DEVICE_ID);
  },
);

test.serial(
  'should throws an error if known application not found',
  async t => {
    const knownAppName = 'knownAppName';

    const flashKnownAppResponse = await request(app)
      .put(`/v1/devices/${CONNECTED_DEVICE_ID}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        access_token: userToken,
        app_id: knownAppName,
      });

    t.is(flashKnownAppResponse.status, 404);
    t.is(flashKnownAppResponse.body.error, `No firmware ${knownAppName} found`);
  },
);

test.serial(
  'should start device flashing process with custom application',
  async t => {
    const flashCustomFirmwareResponse = await request(app)
      .put(`/v1/devices/${CONNECTED_DEVICE_ID}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .attach('file', customFirmwareFilePath)
      .query({ access_token: userToken });

    t.is(flashCustomFirmwareResponse.status, 200);
    t.is(flashCustomFirmwareResponse.body.status, 'Update finished');
    t.is(flashCustomFirmwareResponse.body.id, CONNECTED_DEVICE_ID);
  },
);

test.serial(
  'should throw an error if custom firmware file not provided',
  async t => {
    const flashCustomFirmwareResponse = await request(app)
      .put(`/v1/devices/${CONNECTED_DEVICE_ID}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .field('file_type', 'binary')
      .query({ access_token: userToken });

    t.is(flashCustomFirmwareResponse.status, 400);
    t.is(flashCustomFirmwareResponse.body.error, 'Firmware file not provided');
  },
);

test.serial(
  'should throw an error if custom firmware file type not binary',
  async t => {
    const flashCustomFirmwareResponse = await request(app)
      .put(`/v1/devices/${CONNECTED_DEVICE_ID}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      // send random not binary file
      .attach('file', path.join(__dirname, 'DevicesController.test.js'))
      .query({ access_token: userToken });

    t.is(flashCustomFirmwareResponse.status, 400);
    t.is(flashCustomFirmwareResponse.body.error, 'Did not update device');
  },
);

test.after.always(async (): Promise<void> => {
  await TestData.deleteCustomFirmwareBinary(customFirmwareFilePath);
  await container.constitute('UserRepository').deleteByID(testUser.id);
  await container
    .constitute('DeviceAttributeRepository')
    .deleteByID(CONNECTED_DEVICE_ID);
  await container
    .constitute('DeviceKeyRepository')
    .deleteByID(CONNECTED_DEVICE_ID);
  await container
    .constitute('DeviceAttributeRepository')
    .deleteByID(DISCONNECTED_DEVICE_ID);
  await container
    .constitute('DeviceKeyRepository')
    .deleteByID(DISCONNECTED_DEVICE_ID);
});
