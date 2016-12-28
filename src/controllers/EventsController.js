// @flow

import type { Event, EventData } from '../types';
import type EventManager from '../managers/EventManager';

import Controller from './Controller';
import route from '../decorators/route';
import httpVerb from '../decorators/httpVerb';
import serverSentEvents from '../decorators/serverSentEvents';
import logger from '../lib/logger';
import eventToApi from '../lib/eventToApi';

class EventsController extends Controller {
  _eventManager: EventManager;

  constructor(eventManager: EventManager) {
    super();

    this._eventManager = eventManager;
  }

  _closeStream(subscriptionID: string): Promise<void> {
    return new Promise((resolve: () => void) => {
      // TODO i'm not sure if we need all 4 listens here
      this.request.on('close', () => {
        this._eventManager.unsubscribe(subscriptionID);
        resolve();
      });
      this.request.on('end', () => {
        this._eventManager.unsubscribe(subscriptionID);
        resolve();
      });
      this.response.on('finish', () => {
        this._eventManager.unsubscribe(subscriptionID);
        resolve();
      });
      this.response.on('end', () => {
        this._eventManager.unsubscribe(subscriptionID);
        resolve();
      });
    });
  }

  _pipeEvent(event: Event) {
    try {
      this.response.write(`event: ${event.name} \n\n`);
      this.response.write(`data: ${JSON.stringify(eventToApi(event))}\n\n`);
    } catch (error) {
      logger.error(`pipeEvents - write error: ${error}`);
      throw error;
    }
  }

  @httpVerb('get')
  @route('/v1/events/:eventName?')
  @serverSentEvents()
  async getEvents(eventName: ?string): Promise<*> {
    const subscriptionID = this._eventManager.subscribe(
      eventName,
      this._pipeEvent.bind(this),
    );

    await this._closeStream(subscriptionID);
    return this.ok();
  }

  @httpVerb('get')
  @route('/v1/devices/events/:eventName?')
  @serverSentEvents()
  async getMyEvents(eventName: ?string): Promise<*> {
    const subscriptionID = this._eventManager.subscribe(
      eventName,
      this._pipeEvent.bind(this),
      this.user.id,
    );

    await this._closeStream(subscriptionID);
    return this.ok();
  }

  @httpVerb('get')
  @route('/v1/devices/:deviceID/events/:eventName?/')
  @serverSentEvents()
  async getDeviceEvents(deviceID: string, eventName: ?string): Promise<*> {
    const subscriptionID = this._eventManager.subscribe(
      eventName,
      this._pipeEvent.bind(this),
      this.user.id,
      deviceID,
    );

    await this._closeStream(subscriptionID);
    return this.ok();
  }

  @httpVerb('post')
  @route('/v1/devices/events')
  async publish(postBody: {
    name: string,
    data: ?Object,
    private: boolean,
    ttl: number,
  }): Promise<*> {
    const eventData: EventData = {
      data: postBody.data,
      isPublic: !postBody.private,
      name: postBody.name,
      ttl: postBody.ttl,
    };

    await this._eventManager.publish(eventData);
    return this.ok({ ok: true });
  }
}

export default EventsController;
