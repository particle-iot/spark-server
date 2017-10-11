// @flow

export const promisify = (
  object: Object,
  fnName: string,
  ...args: Array<any>
): Promise<*> =>
  new Promise(
    (resolve: (result: any) => void, reject: (error: Error) => void): void =>
      object[
        fnName
      ](...args, (error: Error, ...callbackArgs: any): ?Function => {
        if (error) {
          reject(error);
          return null;
        }

        return callbackArgs.length <= 1
          ? resolve(...callbackArgs)
          : resolve(callbackArgs);
      }),
  );
