// @flow

import type { IWebhookLogger } from '../types';

import logger from './logger';

class WebhookLogger implements IWebhookLogger {
  _lastLog: Array<any>;

  log(...args: Array<any>) {
    this._lastLog = args;
    logger.log(...args);
  }
}

export default WebhookLogger;
