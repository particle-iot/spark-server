// @flow

import type { EventPublisher } from 'spark-protocol';
import type { Event, EventData } from '../types';

class EventManager {
  _eventPublisher: EventPublisher;

  constructor(eventPublisher: EventPublisher) {
    this._eventPublisher = eventPublisher;
  }

  _filterEvents = (
    eventHandler: (event: Event) => void,
    userID?: string,
    deviceID?: string,
  ): (event: Event) => void =>
    (event: Event) => {
      if (
        event.deviceID &&
        userID && userID !== event.userID
      ) {
        return;
      }

      if (deviceID && deviceID !== event.deviceID) {
        return;
      }

      eventHandler(event);
    };

  subscribe = (
    eventName: ?string,
    eventHandler: (event: Event) => void,
    userID?: string,
    deviceID?: string,
  ): string =>
    this._eventPublisher.subscribe(
      eventName,
      this._filterEvents(eventHandler, userID, deviceID),
      deviceID,
    );

  unsubscribe = (subscriptionID: string): void =>
    this._eventPublisher.unsubscribe(subscriptionID);

  publish = (eventData: EventData): void =>
    this._eventPublisher.publish(eventData);
}

export default EventManager;
