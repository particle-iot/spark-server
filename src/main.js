// @flow

import { Container } from 'constitute';
import os from 'os';
import arrayFlatten from 'array-flatten';
import logger from './lib/logger';
import createApp from './app';
import defaultBindings from './defaultBindings';
import settings from './settings';

const NODE_PORT = process.env.NODE_PORT || 8080;

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
defaultBindings(container);

const deviceServer = container.constitute('DeviceServer');
deviceServer.start();

const app = createApp(container, settings);

app.listen(
  NODE_PORT,
  (): void => console.log(`express server started on port ${NODE_PORT}`),
);

const addresses = arrayFlatten(
  Object.entries(os.networkInterfaces()).map(
    // eslint-disable-next-line no-unused-vars
    ([name, nic]: Array<Object>): Array<string> =>
      (nic: any)
        .filter((address: Object): boolean =>
          address.family === 'IPv4' &&
          address.address !== '127.0.0.1',
        )
        .map((address: Object): boolean => address.address),
  ),
);
addresses.forEach((address: string): void =>
  console.log(`Your device server IP address is: ${address}`),
);
