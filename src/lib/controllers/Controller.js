// @flow

import type { HttpResult } from './types';

export default class Controller {
  bad = (message: string): HttpResult<*> => ({
    data: { message },
    status: 400,
  });

  ok = <TType>(output?: TType): HttpResult<TType> => ({
    data: output,
    status: 200,
  });
}
