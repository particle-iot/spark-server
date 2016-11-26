export type Decorator = (
  target: Object,
  name: string,
  descriptor: Object,
) => Object;

export type HttpVerb =
  'delete' |
  'get' |
  'post' |
  'put';
