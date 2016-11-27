import type { Decorator, HttpVerb } from './types';

export default (
  httpVerb: HttpVerb,
): Decorator => (target, name, descriptor): Object => {
  target[name].httpVerb = httpVerb;
  return descriptor;
};
