/*
* Many of you want to scale the server with docker images or some other way.
* You should be able to use the following code to get full events stream
* and pipe it with some service like rabbitMQ or zeroMQ.
* You shouldn't worry about events mirroring between different processes,
* EVENT_PROVIDER is smart enough to filter broadcasted events.
*/

/* eslint-disable */
import type { Event } from '../src/types';

import { Container } from 'constitute';
import { defaultBindings } from 'spark-server';

const container = new Container();
defaultBindings(container, settings);

container.constitute('EVENT_PROVIDER').onNewEvent((event: Event) => {
  // do piping stuff here.
});
