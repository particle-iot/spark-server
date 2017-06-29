// @flow

import type { Event, EventData } from '../types';
import type EventManager from '../managers/EventManager';

import Controller from './Controller';
import anonymous from '../decorators/anonymous';
import route from '../decorators/route';
import httpVerb from '../decorators/httpVerb';
import serverSentEvents from '../decorators/serverSentEvents';
import eventToApi from '../lib/eventToApi';
import Logger from '../lib/logger';
const logger = Logger.createModuleLogger(module);

class EventsController extends Controller {
  _eventManager: EventManager;

  constructor(eventManager: EventManager) {
    super();

    this._eventManager = eventManager;
  }

  _closeStream(subscriptionID: string): Promise<void> {
    return new Promise((resolve: () => void) => {
      const closeStreamHandler = () => {
        this._eventManager.unsubscribe(subscriptionID);
        resolve();
      };

      this.request.on('close', closeStreamHandler);
      this.request.on('end', closeStreamHandler);
      this.response.on('finish', closeStreamHandler);
      this.response.on('end', closeStreamHandler);
    });
  }

  _pipeEvent(event: Event) {
    try {
      this.response.write(`event: ${event.name}\n`);
      this.response.write(`data: ${JSON.stringify(eventToApi(event))}\n\n`);
    } catch (error) {
      logger.error({ err: error }, 'pipeEvents - write error');
      throw error;
    }
  }

  @httpVerb('post')
  @route('/v1/ping')
  @anonymous()
  async ping(payload: Object): Promise<*> {
    return this.ok({
      ...payload,
      serverPayload: Math.random(),
    });
  }

  @httpVerb('get')
  @route('/v1/events/:eventNamePrefix?*')
  @serverSentEvents()
  async getEvents(eventNamePrefix: ?string): Promise<*> {
    const subscriptionID = this._eventManager.subscribe(
      eventNamePrefix,
      this._pipeEvent.bind(this),
      { userID: this.user.id },
    );

    await this._closeStream(subscriptionID);
    return this.ok();
  }

  @httpVerb('get')
  @route('/v1/devices/events/:eventNamePrefix?*')
  @serverSentEvents()
  async getMyEvents(eventNamePrefix: ?string): Promise<*> {
    const subscriptionID = this._eventManager.subscribe(
      eventNamePrefix,
      this._pipeEvent.bind(this),
      {
        mydevices: true,
        userID: this.user.id,
      },
    );

    await this._closeStream(subscriptionID);
    return this.ok();
  }

  @httpVerb('get')
  @route('/v1/devices/:deviceID/events/:eventNamePrefix?*')
  @serverSentEvents()
  async getDeviceEvents(
    deviceID: string,
    eventNamePrefix: ?string,
  ): Promise<*> {
    const subscriptionID = this._eventManager.subscribe(
      eventNamePrefix,
      this._pipeEvent.bind(this),
      {
        deviceID,
        userID: this.user.id,
      },
    );

    await this._closeStream(subscriptionID);
    return this.ok();
  }

  @httpVerb('post')
  @route('/v1/devices/events')
  async publish(postBody: {
    name: string,
    data?: string,
    private: boolean,
    ttl?: number,
  }): Promise<*> {
    const eventData: EventData = {
      data: postBody.data,
      isPublic: !postBody.private,
      name: postBody.name,
      ttl: postBody.ttl,
      userID: this.user.id,
    };

    this._eventManager.publish(eventData);
    return this.ok({ ok: true });
  }
}

export default EventsController;
