// @flow

import moment from 'moment';
import Controller from './Controller';
import CoreController from '../lib/CoreController';
import route from '../decorators/route';
import httpVerb from '../decorators/httpVerb';

import v1Api from '../views/api_v1';
import logger from '../lib/logger';

class EventsController extends Controller {
  _aliveInterval: ?string;
  _lastMessage: ?Date;
  _socket: ?Object;

  _cleanup() {
    try {
      if (this._socket) {
        this._socket.close();
        this._socket = null;
      }

      if (this.response && this.response.socket) {
        this.response.socket.end();
        this.response.end();
      }

      if (this._aliveInterval) {
        clearInterval(this._aliveInterval);
        this._aliveInterval = null;
      }
    } catch (error) {
      logger.error(`pipeEvents cleanup error: ${error}`);
    }
  }

  _keepAlive() {
    if (((new Date()) - this._lastMessage) >= 9000) {
      this._lastMessage = new Date();
      this.response.write('\n');
      this._checkSocket();
    }
  }

  _checkSocket() {
    try {
      if (!this._socket) {
        this._cleanup();
        return false;
      }

      if (this.response.socket.destroyed) {
        logger.log('Socket destroyed, cleaning up Event listener');
        this._cleanup();
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`pipeEvents - error checking socket ${error}`);
      return false;
    }
  }

  _writeEventGen() {
    return (
      name: string,
      data: ?Object,
      ttl: ?number,
      publishedAt: ?Date,
      coreid: ? string,
    ) => {
      // if (filterCoreId && (filterCoreId !== coreid)) {
      //   return;
      // }
      if (!this._checkSocket()) {
        return;
      }

      try {
        this._lastMessage = new Date();

        const eventData = {
          coreid: coreid || null,
          data: data || null,
          published_at: publishedAt || null,
          ttl: ttl || null,
        };

        this.response.write(`event: ${name} \n`);
        this.response.write(`data: ${JSON.stringify(eventData)} \n\n`);
      } catch (error) {
        logger.error(`pipeEvents - write error: ${error}`);
      }
    };
  }

  _pipeEvents() {
    try {
      this.request.socket.setNoDelay();
      console.log('headers sent', this.response.headersSent);
      this.response.writeHead(200, {
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream',
      });

      console.log('headers sent', this.response.headersSent);

      this.response.write(':ok\n\n');

      this._aliveInterval = setInterval(this._keepAlive, 3000);

      if (this._socket) {
        this._socket.on('public', this._writeEventGen(true));
        this._socket.on('private', this._writeEventGen(false));
      }

      this.request.on('close', this._cleanup);
      this.request.on('end', this._cleanup);
      this.response.on('close', this._cleanup);
      this.response.on('finish', this._cleanup);
    } catch(error) {
      console.log('pipeEvents error', error.message);
      throw error;
    }
  }

  @httpVerb('get')
  @route('/v1/events/:eventPrefix?')
  async getEvents(eventPrefix: string) {
    try {
      // todo if eventPrefix doesn't exist, in getEvents args it becomes empty body object
      // need to fix this in routeConfig somehow, or do 2 endpoints
      const prefix = Object.keys(eventPrefix).length === 0 ? '' : eventPrefix;

      this._socket = new CoreController(v1Api.getSocketID(this.user.id));
      this._socket.subscribe(false, prefix, this.user.id);

      await this._pipeEvents();
    //  return this.ok();
    } catch (error) {
      throw error;
    }
  }

  @httpVerb('post')
  @route('/v1/devices/events')
  async sendEvent(postBody: {
    name: string,
    data: Object,
    private: boolean,
    ttl: number,
  }): Promise<*> {
    const { data, name, ttl } = postBody;

    this._socket = new CoreController(v1Api.getSocketID(this.user.id));

    const success = this._socket.sendEvent(
      postBody.private,
      name,
      this.user.id,
      data,
      ttl,
      moment().toISOString(),
      // todo according to sendEvent() it should be core id, but they pass userID here
      // actually seems in current implementation it doesn't affect anything anyways.
      this.user.id,
    );

    this._socket.close();
    return this.ok({ ok: success });
  }
}

export default EventsController;
