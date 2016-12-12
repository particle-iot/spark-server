// @flow

export type Decorator = (
  target: Object,
  name: string,
  descriptor: Object,
) => Object;

export type HttpVerb =
  'checkout' |
  'connect' |
  'copy' |
  'deleteById' |
  'head' |
  'get' |
  'lock' |
  'm-search' |
  'merge' |
  'mkactivity' |
  'mkcol' |
  'move' |
  'notify' |
  'options' |
  'patch' |
  'post' |
  'propfind' |
  'proppatch' |
  'purge' |
  'put' |
  'report' |
  'search' |
  'subscribe' |
  'trace' |
  'unlock' |
  'unsubscribe';
