import type {$Application} from 'express';

import type Controller from './controllers/Controller'

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

      app[httpVerb](route, (request, response) => {
        const result = mappedFunction.call(
          controller,
          {
            ...request.params,
            ...request.body,
          },
        );

        response.status(result.status).json(result.data);
      });
    });
  });
};
