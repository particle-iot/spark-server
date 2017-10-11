// @flow

import type { IWebhookLogger } from '../types';
import Logger from './logger';
const logger = Logger.createModuleLogger(module);

class WebhookLogger implements IWebhookLogger {
  _lastLog: Array<any>;

  log(...args: Array<any>) {
    this._lastLog = args;
    logger.info([...args], 'webhook');
  }
}

export default WebhookLogger;
