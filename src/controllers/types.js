// @flow

export type HttpResult<TType> =
  | {
      data: ?TType,
      status: number,
    }
  | {
      data: {
        error: string,
        ok: false,
      },
      status: number,
    };
