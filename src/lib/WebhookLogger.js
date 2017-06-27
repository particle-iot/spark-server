// @flow

import type { IWebhookLogger } from '../types';
import Logger from './logger';
const logger = Logger.createModuleLogger(module);

class WebhookLogger implements IWebhookLogger {
  _lastLog: Array<any>;

  log(...argsarray: Array<any>) {
    this._lastLog = argsarray;
    logger.info({ args: argsarray }, 'WebHook');
  }
}

export default WebhookLogger;
