// @flow

export const promisify = (
  object: Object,
  fnName: string,
  ...args: Array<any>
): Promise<*> =>
  new Promise((
    resolve: (result: any) => void,
    reject: (error: Error) => void,
  ): void => object[fnName](...args, (error: Error, result: any) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(result);
  }),
);
