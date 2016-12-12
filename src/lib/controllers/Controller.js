// @flow

import type { $Request, $Response } from 'express';
import type { User } from '../../types';
import type { HttpResult } from './types';

export default class Controller {
  request: $Request;
  response: $Response;
  user: User;

  bad = (message: string, status: number = 400): HttpResult<*> => ({
    data: {
      error: message,
      ok: false,
    },
    status,
  });

  ok = <TType>(output?: TType): HttpResult<TType> => ({
    data: output,
    status: 200,
  });
}
