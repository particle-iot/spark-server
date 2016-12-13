import type { Decorator, HttpVerb } from './types';

export default (
  fileName: string,
  maxCount: number = 0,
): Decorator => (target, name, descriptor): Object => {
  const allowedUploads = target[name].allowedUploads || [];
  allowedUploads.push({
    maxCount: maxCount ? maxCount : undefined,
    name: fileName,
  });
  target[name].allowedUploads = allowedUploads;
  return descriptor;
};
