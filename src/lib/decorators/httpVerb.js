import type {Decorator, HttpVerb} from './types';

export default (
  httpVerb: HttpVerb,
): Decorator => (target, name, descriptor): Object => {
  descriptor.httpVerb = httpVerb;
  return descriptor;
};
