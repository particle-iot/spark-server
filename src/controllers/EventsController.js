// @flow

import type { Event } from '../types';
import type EventManager from '../managers/EventManager';

import Controller from './Controller';
import route from '../decorators/route';
import httpVerb from '../decorators/httpVerb';
import logger from '../lib/logger';

class EventsController extends Controller {
  _aliveInterval: ?number;
  _eventManager: EventManager;
  _lastMessage: ?Date;

  constructor(eventManager: EventManager) {
    super();

    this._eventManager = eventManager;
  }

  _keepAlive() {
    if (((new Date()) - this._lastMessage) >= 9000) {
      this._lastMessage = new Date();
      this.response.write('\n');
    }
  }

  _pipeEvent = (response) => (
    isPublic: boolean,
    name: string,
    data: ?Object,
    ttl: ?number,
    publishedAt: ?Date,
    coreId: ?string,
  ) => {
    try {
      this._lastMessage = new Date();

      const eventData = {
        coreid: coreId || null,
        data: data || null,
        published_at: publishedAt || null,
        ttl: ttl || null,
      };

      response.write(`event: ${name} \n`);
      response.write(`data: ${JSON.stringify(eventData)}\n`);
    } catch (error) {
      logger.error(`pipeEvents - write error: ${error}`);
      throw error;
    }
  };

  @httpVerb('get')
  @route('/v1/events/:eventName?')
  async getEvents(eventName: string) {
    this.response.set({
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    });

    this._aliveInterval = setInterval(this._keepAlive, 3000);

    // todo if eventName doesn't exist, in getEvents args it becomes empty body object
    // need to fix this in routeConfig somehow, or do 2 endpoints
    const evName = Object.keys(eventName).length === 0 ? '' : eventName;

    this._eventManager.subscribe(
      evName,
      this.user.id,
      null,
      this._pipeEvent(this.response),
    );

    const closeStream = new Promise((resolve: () => void) => {
      this.request.on('close', () => {
        this._eventManager.unsubscribe(evName, this.user.id, null);
        resolve();
      });
      this.request.on('end', () => {
        this._eventManager.unsubscribe(evName, this.user.id, null);
        resolve();
      });
      this.response.on('finish', () => {
        this._eventManager.unsubscribe(evName, this.user.id, null);
        resolve();
      });
      this.response.on('end', () => {
        this._eventManager.unsubscribe(evName, this.user.id, null);
        resolve();
      });
    });

    await closeStream;
    return this.ok();
  }

  @httpVerb('post')
  @route('/v1/devices/events')
  async sendEvent(event: Event): Promise<*> {
    await this._eventManager.sendEvent(this.user.id, event);
    return this.ok({ ok: true });
  }
}

export default EventsController;
