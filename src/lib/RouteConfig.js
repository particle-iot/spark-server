// @flow

import type { $Application, $Request, $Response } from 'express';
import type Controller from './controllers/Controller';

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

      const argumentNames = (route.match(/:[\w]*/g) || []).map(
        arumentName => arumentName.replace(':', ''),
      );

      (app: any)[httpVerb](route, (request: $Request, response: $Response) => {
        const values = argumentNames
          .map((argument: string): any => request.params[argument])
          .filter((value: ?any): boolean => value !== undefined);

        // Take access token out if it's posted.
        const {
          access_token,
          ...body,
        } = request.body;
        const result = mappedFunction.call(
          controller,
          ...values,
          body,
        );
        if (result.then) {
          result.then(result => {
            response.status(result.status).json(result.data);
          });
        } else {
          response.status(result.status).json(result.data);
        }
      });
    });
  });
};
