// @flow

import type { EventPublisher } from 'spark-protocol';
import type { DeviceAttributeRepository, Event, EventData } from '../types';

class EventManager {
  _eventPublisher: EventPublisher;
  _deviceAttributeRepository: DeviceAttributeRepository;

  constructor(
    deviceAttributeRepository: DeviceAttributeRepository,
    eventPublisher: EventPublisher,
  ) {
    this._deviceAttributeRepository = deviceAttributeRepository;
    this._eventPublisher = eventPublisher;
  }

  _filterEvents = (
    eventHandler: (event: Event) => void,
    userID?: string,
    deviceID?: string,
  ): (event: Event) => Promise<void> =>
    async (event: Event): Promise<void> => {
      if (
        event.deviceID &&
        userID &&
        !await this._deviceAttributeRepository.doesUserHaveAccess(
          event.deviceID,
          userID,
        )
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

  publish = async (eventData: EventData): Promise<void> =>
    await this._eventPublisher.publish(eventData);
}

export default EventManager;
