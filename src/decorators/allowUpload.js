// @flow

import type { Decorator, Descriptor } from './types';
import type Controller from '../controllers/Controller';

/* eslint-disable no-param-reassign */
export default (
  fileName: ?string = undefined,
  maxCount: number = 0,
): Decorator<Controller> => (
  target: Controller,
  name: $Keys<Controller>,
  descriptor: Descriptor,
): Descriptor => {
  const allowedUploads = (target: any)[name].allowedUploads || [];
  if (fileName) {
    allowedUploads.push({
      maxCount,
      name: fileName,
    });
  }

  (target: any)[name].allowedUploads = allowedUploads;
  return descriptor;
};
