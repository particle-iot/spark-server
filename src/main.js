// @flow

import {
  DeviceAttributeFileRepository,
  DeviceServer,
  ServerConfigFileRepository,
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

const app = createApp(settings);

const deviceServer = new DeviceServer({
  coreKeysDir: settings.coreKeysDir,
  deviceAttributeRepository: new DeviceAttributeFileRepository(
    settings.coreKeysDir,
  ),
  host: settings.HOST,
  port: settings.PORT,
  serverConfigRepository: new ServerConfigFileRepository(
    settings.serverKeyFile,
  ),
  serverKeyFile: settings.serverKeyFile,
  serverKeyPassEnvVar: settings.serverKeyPassEnvVar,
  serverKeyPassFile: settings.serverKeyPassFile,
});

global.server = deviceServer;
deviceServer.start();
app.listen(NODE_PORT, (): void => console.log(`express server started on port ${NODE_PORT}`));

utilities.getIPAddresses().forEach((ip: string): void =>
  console.log(`Your device server IP address is: ${ip}`),
);
