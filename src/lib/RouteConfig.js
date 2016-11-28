import type { $Application } from 'express';

import type Controller from './controllers/Controller'

const getFunctionArgumentNames = (func): Array<string> => {
  // First match everything inside the function argument parens.
  const args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

  // Split the arguments string into an array comma delimited.
  return args.split(',').map(argument => {
    // Ensure no inline comments are parsed and trim the whitespace.
    return argument.replace(/\/\*.*\*\//, '').trim();
  }).filter(argument => !!argument);
};

export default (app: $Application, controllers: Array<Controller>): void => {
  controllers.map(controller => {
    Object.getOwnPropertyNames(
      Object.getPrototypeOf(controller),
    ).map(functionName => {
      const mappedFunction = controller[functionName];
      const {httpVerb, route} = mappedFunction;
      if (!httpVerb) {
        return;
      }

      const argumentNames = getFunctionArgumentNames(mappedFunction);
      app[httpVerb](route, (request, response) => {
        const values = argumentNames
          .map(argument => request.params[argument])
          .filter(value => typeof value !== undefined);
        console.log(values);
        const result = mappedFunction.apply(
          controller,
          [
            ...values,
            request.body,
          ]
        );

        response.status(result.status).json(result.data);
      });
    });
  });
};
