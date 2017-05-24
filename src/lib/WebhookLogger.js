// @flow

import { IWebhookLogger } from '../types';

class WebhookLogger implements IWebhookLogger {
  _lastLog: Array<any>;

  log(...args: Array<any>) {
    this._lastLog = args;
    console.log(...args);
  }
}

export default WebhookLogger;
