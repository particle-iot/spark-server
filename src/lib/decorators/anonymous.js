// @flow

import type { Decorator } from './types';

export default (): Decorator =>
  (target, name, descriptor): Object => {
    // eslint-disable-next-line no-param-reassign
    target[name].anonymous = true;
    return descriptor;
  };
