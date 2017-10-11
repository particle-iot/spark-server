// @flow

export type Decorator<TType> = (
  target: TType,
  name: $Keys<TType>,
  descriptor: Descriptor,
) => Descriptor;

export type Descriptor = {
  configurable: boolean,
  enumerable: boolean,
  value: Function,
  writeable: boolean,
};

export type HttpVerb =
  | 'checkout'
  | 'connect'
  | 'copy'
  | 'deleteById'
  | 'head'
  | 'get'
  | 'lock'
  | 'm-search'
  | 'merge'
  | 'mkactivity'
  | 'mkcol'
  | 'move'
  | 'notify'
  | 'options'
  | 'patch'
  | 'post'
  | 'propfind'
  | 'proppatch'
  | 'purge'
  | 'put'
  | 'report'
  | 'search'
  | 'subscribe'
  | 'trace'
  | 'unlock'
  | 'unsubscribe';
