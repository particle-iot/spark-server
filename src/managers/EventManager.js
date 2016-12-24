// @flow

import type { Event } from '../types';

import moment from 'moment';
import CoreController from '../lib/CoreController';

class EventManager {
  _socket: ?Object;

  subscribe = (eventName: string, userID: string, coreID: string, callback): void => {
    this._socket = new CoreController();
    this._socket.subscribe(eventName, userID, coreID, callback);
  };

  unsubscribe = (eventName: string, userID: string, coreID: string) => {
    if (!this._socket) {
      return;
    }
    this._socket.unsubscribe(eventName, userID, coreID);
    this._socket.close();
    this._socket = null;
  };

  sendEvent = async (userID: string, event: Event): Promise<void> => {
    const socket = new CoreController();

    // todo make sendEvent() async
    const result = await socket.sendEvent(
      event.private,
      event.name,
      userID,
      event.data,
      event.ttl,
      moment().toISOString(),
      // todo according to sendEvent() it should be core id, but they pass userID here
      // actually seems in current implementation it doesn't affect anything anyways.
      userID,
    );
    // todo send event errors handling
    // todo make close() async
    await socket.close();
  };
}

export default EventManager;
