// @flow

import type { Decorator, Descriptor } from './types';
import type Controller from '../controllers/Controller';

/* eslint-disable no-param-reassign */
export default (): Decorator<Controller> =>
  (target: Controller, name: string, descriptor: Descriptor): Descriptor => {
    target[name].anonymous = true;
    return descriptor;
  };
