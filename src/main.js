// @flow

import arrayFlatten from 'array-flatten';
import createApp from './app';
import nulltrhows from 'nullthrows';
import fs from 'fs';
import http from 'http';
import https from 'https';
import os from 'os';
import defaultBindings from './defaultBindings';
import logger from './lib/logger';
import settings from './settings';
import { Container } from 'constitute';

const NODE_PORT = process.env.NODE_PORT || settings.EXPRESS_SERVER_CONFIG.PORT;

process.on('uncaughtException', (exception: Error) => {
  logger.error(
    'uncaughtException',
    { message: exception.message, stack: exception.stack },
  ); // logging with MetaData
  process.exit(1); // exit with failure
});

/* This is the container used app-wide for dependency injection. If you want to
 * override any of the implementations, create your module with the new
 * implementation and use:
 *
 * container.bindAlias(DefaultImplementation, MyNewImplementation);
 *
 * You can also set a new value
 * container.bindAlias(DefaultValue, 12345);
 *
 * See https://github.com/justmoon/constitute for more info
 */
const container = new Container();
defaultBindings(container, settings);

const deviceServer = container.constitute('DeviceServer');
deviceServer.start();

const app = createApp(container, settings);

const onServerStartListen = (): void =>
  logger.info(`express server started on port ${NODE_PORT}`);

const {
  SSL_PRIVATE_KEY_FILEPATH: privateKeyFilePath,
  SSL_CERTIFICATE_FILEPATH: certificateFilePath,
  USE_SSL: useSSL,
  ...expressConfig
} = settings.EXPRESS_SERVER_CONFIG;

if (useSSL) {
  const options = {
    cert: certificateFilePath && fs.readFileSync(
      nulltrhows(certificateFilePath),
    ),
    key: privateKeyFilePath && fs.readFileSync(
      nulltrhows(privateKeyFilePath),
    ),
    ...expressConfig,
  };
  https
    .createServer(options, (app: any))
    .listen(NODE_PORT, onServerStartListen);
} else {
  http
    .createServer((app: any))
    .listen(NODE_PORT, onServerStartListen);
}

const addresses = arrayFlatten(
  Object.entries(os.networkInterfaces()).map(
    // eslint-disable-next-line no-unused-vars
    ([name, nic]: [string, mixed]): Array<string> =>
      (nic: any)
        .filter((address: Object): boolean =>
          address.family === 'IPv4' &&
          address.address !== '127.0.0.1',
        )
        .map((address: Object): boolean => address.address),
  ),
);
addresses.forEach((address: string): void =>
  logger.info(`Your device server IP address is: ${address}`),
);
