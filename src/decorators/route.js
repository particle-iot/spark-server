// @flow

import type { Decorator, Descriptor } from './types';
import type Controller from '../controllers/Controller';

/* eslint-disable no-param-reassign */
export default (route: string): Decorator<Controller> => (
  target: Controller,
  name: string,
  descriptor: Descriptor,
): Descriptor => {
  (target: any)[name].route = route;
  return descriptor;
};
