// @flow

import type { Decorator, Descriptor, HttpVerb } from './types';
import type Controller from '../controllers/Controller';

/* eslint-disable no-param-reassign */
export default (httpVerb: HttpVerb): Decorator<Controller> =>
  (target: Controller, name: string, descriptor: Descriptor): Descriptor => {
    target[name].httpVerb = httpVerb;
    return descriptor;
  };
