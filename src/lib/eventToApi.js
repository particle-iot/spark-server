// @flow

import type { Event } from '../types';

export type EventAPIType = {|
  coreid: ?string,
  data: ?Object,
  published_at: Date,
  ttl: number,
|};

const eventToApi = (event: Event): EventAPIType => ({
  coreid: event.deviceID || null,
  data: event.data || null,
  published_at: event.publishedAt,
  ttl: event.ttl,
});

export default eventToApi;
