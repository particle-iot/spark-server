// @flow

import {
  DeviceAttributeFileRepository,
  DeviceKeyFileRepository,
  DeviceServer,
  EventPublisher,
  ServerKeyFileRepository,
} from 'spark-protocol';
import utilities from './lib/utilities';
import logger from './lib/logger';
import createApp from './app';
import settings from './settings';

const NODE_PORT = process.env.NODE_PORT || 8080;

// TODO wny do we need this? (Anton Puko)
global._socket_counter = 1;

// TODO: something better here
process.on('uncaughtException', (exception: Error) => {
  let details = '';
  try {
    details = JSON.stringify(exception);
  } catch (stringifyException) {
    logger.error(`Caught exception: ${stringifyException}`);
  }
  logger.error(`Caught exception: ${exception.toString()} ${exception.stack}`);
});


const deviceAttributeRepository = new DeviceAttributeFileRepository(
  settings.coreKeysDir,
);
const deviceKeyRepository = new DeviceKeyFileRepository(
  settings.coreKeysDir,
);
const serverKeyRepository = new ServerKeyFileRepository(
  settings.serverKeysDir,
  settings.serverKeyFile,
);
const eventPublisher = new EventPublisher();

const deviceServer = new DeviceServer(
  deviceAttributeRepository,
  deviceKeyRepository,
  serverKeyRepository,
  eventPublisher,
  {
    host: settings.HOST,
    port: settings.PORT,
  },
);

global.server = deviceServer;
deviceServer.start();

const app = createApp(settings, deviceServer, eventPublisher);

app.listen(
  NODE_PORT,
  (): void => console.log(`express server started on port ${NODE_PORT}`),
);

utilities.getIPAddresses().forEach((ip: string): void =>
  console.log(`Your device server IP address is: ${ip}`),
);
