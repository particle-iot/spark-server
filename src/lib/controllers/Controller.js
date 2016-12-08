// @flow

import type { $Request, $Response } from 'express';
import type { User } from '../../types';
import type { HttpResult } from './types';

export default class Controller {
  user: User;
  request: $Request;
  response: $Response;

  bad = (message: string): HttpResult<*> => ({
    data: { message },
    status: 400,
  });

  ok = <TType>(output?: TType): HttpResult<TType> => ({
    data: output,
    status: 200,
  });
}
