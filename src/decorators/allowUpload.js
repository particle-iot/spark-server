// @flow

import type { Decorator, Descriptor } from './types';
import type Controller from '../controllers/Controller';

/* eslint-disable no-param-reassign */
export default (
  fileName: string,
  maxCount: number = 0,
): Decorator<Controller> =>
  (target: Controller, name: string, descriptor: Descriptor): Descriptor => {
    const allowedUploads = target[name].allowedUploads || [];
    allowedUploads.push({
      maxCount,
      name: fileName,
    });

    target[name].allowedUploads = allowedUploads;
    return descriptor;
  };
