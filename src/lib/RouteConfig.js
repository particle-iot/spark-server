// @flow

import type {
  $Application,
  $Request,
  $Response,
  Middleware,
  NextFunction,
} from 'express';
import type Controller from './controllers/Controller';

import OAuthModel from './OAuthModel';
import OAuthServer from 'express-oauth-server';
import settings from '../settings';

const getFunctionArgumentNames = (func: Function): Array<string> => {
  // First match everything inside the function argument parens.
  const args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];

  // Split the arguments string into an array comma delimited.
  return args.split(',').map((argument: string): string =>
    // Ensure no inline comments are parsed and trim the whitespace.
    argument.replace(/\/\*.*\*\//, '').trim(),
  ).filter((argument: string): boolean => !!argument);
};

// TODO fix flow errors, come up with better name;
const maybe = (middleware: Middleware, condition: boolean): Middleware =>
  (request: $Request, response: $Response, next: NextFunction) => {
    if (condition) {
      middleware(request, response, next);
    } else {
      next();
    }
  };

const injectUserMiddleware = (): Middleware =>
  (request: $Request, response: $Response, next: NextFunction) => {
    const oauthInfo = response.locals.oauth;
    if (oauthInfo) {
      // eslint-disable-next-line no-param-reassign
      request.user = oauthInfo.token.user;
    }
    next();
  };


export default (app: $Application, controllers: Array<Controller>) => {
  // TODO figure out, may be I need to add oauth to app.oauth or app.locals.oauth
  // to be able to inject user object in request.
  const oauth = new OAuthServer({
    accessTokenLifetime: settings.accessTokenLifetime,
    allowBearerTokensInQueryString: true,
    model: new OAuthModel(settings.usersRepository),
  });

  app.post(settings.loginRoute, oauth.token());

  controllers.forEach((controller: Controller) => {
    Object.getOwnPropertyNames(
      Object.getPrototypeOf(controller),
    ).forEach((functionName: string) => {
      const mappedFunction = controller[functionName];
      const { httpVerb, route, anonymous } = mappedFunction;
      if (!httpVerb) {
        return;
      }


      const argumentNames = getFunctionArgumentNames(mappedFunction);

      app[httpVerb](
        route,
        maybe(oauth.authenticate(), !anonymous),
        injectUserMiddleware(),
        async (request: $Request, response: $Response) => {
          const values = argumentNames
            .map((argument: string): string => request.params[argument])
            .filter((value: ?Object): boolean => value !== undefined);

          const controllerContext = Object.create(controller);
          controllerContext.request = request;
          controllerContext.response = response;
          controllerContext.user = request.user;

          try {
            const result = await mappedFunction.call(
              controllerContext,
              ...values,
              request.body,
            );

            response.status(result.status).json(result.data);
          } catch (error) {
            console.log(error);
          }
        },
      );
    });
  });
};
