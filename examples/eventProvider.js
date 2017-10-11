/*
* Many of you want to scale the server with docker images or some other way.
* You should be able to use the following code to get full events stream
* and pipe it with some service like rabbitMQ or zeroMQ.
* You shouldn't worry about events mirroring between different processes,
* EVENT_PROVIDER is smart enough to filter broadcasted events.
*/

/*
  to build this sample run

    npm run examples:build

  to run

    npm run examples:run:eventprovider

  if this fails, ensure you have to latest version of spark-protocol, run

    npm update spark-protocol

*/

/* eslint-disable */

import type { Event } from '../types';
import { Container } from 'constitute';
import defaultBindings from '../defaultBindings';
import settings from '../settings.js';
import logger from '../lib/logger';

const container = new Container();
defaultBindings(container, settings);

const deviceServer = container.constitute('DeviceServer');
deviceServer.start();

const eventProvider = container.constitute('EVENT_PROVIDER');
eventProvider.onNewEvent((event: Event) => {
  logger.info('Event onNewEvent', event);
});
