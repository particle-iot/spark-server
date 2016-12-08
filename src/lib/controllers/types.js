// @flow


export type HttpResult<TType> = {
  data: ?TType,
  status: number,
} | {
  data: ?string,
  status: number,
};
