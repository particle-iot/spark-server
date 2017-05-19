// @flow

export const promisify = (func: Function, ...args: Array<any>): Promise<*> =>
  new Promise((
    resolve: (result: any) => void,
    reject: (error: Error) => void,
  ): void => func(...args, (error: Error, result: any) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(result);
  }),
);

export const promisifyByPrototype = (object: Object): Object => {
  const prototype = Object.getPrototypeOf(object);

  const fnNames = Object.getOwnPropertyNames(prototype).filter(
    (propName: string): boolean => typeof prototype[propName] === 'function',
  );

  const resultObject = {};

  fnNames.forEach((fnName: string) => {
    resultObject[fnName] = (...args: Array<any>): Promise<*> =>
      promisify(object[fnName].bind(object, ...args));
  });

  return resultObject;
};
