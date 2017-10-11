// @flow

import type { Decorator, Descriptor, HttpVerb } from './types';
import type Controller from '../controllers/Controller';

/* eslint-disable no-param-reassign */
export default (httpVerb: HttpVerb): Decorator<Controller> => (
  target: Controller,
  name: $Keys<Controller>,
  descriptor: Descriptor,
): Descriptor => {
  (target: any)[name].httpVerb = httpVerb;
  return descriptor;
};
