// @flow

import {Container} from 'constitute';
import utilities from './lib/utilities';
import logger from './lib/logger';
import createApp from './app';
import defaultBindings from './defaultBindings';
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
defaultBindings(container);

const deviceServer = container.constitute('DeviceServer');
deviceServer.start();

const app = createApp(container, settings);

app.listen(
  NODE_PORT,
  (): void => console.log(`express server started on port ${NODE_PORT}`),
);

utilities.getIPAddresses().forEach((ip: string): void =>
  console.log(`Your device server IP address is: ${ip}`),
);
