// @flow

import type { $Application, $Request, $Response } from 'express';
import type Controller from './controllers/Controller';

const getFunctionArgumentNames = (func: Function): Array<string> => {
  // First match everything inside the function argument parens.
  const args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

  // Split the arguments string into an array comma delimited.
  return args.split(',').map((argument: string): string =>
    // Ensure no inline comments are parsed and trim the whitespace.
    argument.replace(/\/\*.*\*\//, '').trim(),
  ).filter((argument: string): boolean => !!argument);
};

export default (app: $Application, controllers: Array<Controller>) => {
  controllers.forEach((controller: Controller) => {
    Object.getOwnPropertyNames(
      Object.getPrototypeOf(controller),
    ).forEach((functionName: string) => {
      const mappedFunction = controller[functionName];
      const { httpVerb, route } = mappedFunction;
      if (!httpVerb) {
        return;
      }

      const argumentNames = getFunctionArgumentNames(mappedFunction);

      app[httpVerb](route, async (request: $Request, response: $Response) => {
        const values = argumentNames
          .map((argument: string): string => request.params[argument])
          .filter((value: ?Object): boolean => value !== undefined);

        const result = await mappedFunction.call(
          controller,
          ...values,
          request.body,
        );

        response.status(result.status).json(result.data);
      });
    });
  });
};
