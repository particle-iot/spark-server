// @flow

import type {
  $Application,
  $Request,
  $Response,
  Middleware,
  NextFunction,
} from 'express';
import type { Settings } from '../types';
import type Controller from './controllers/Controller';

import OAuthModel from './OAuthModel';
import OAuthServer from 'express-oauth-server';

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


export default (
  app: $Application,
  controllers: Array<Controller>,
  settings: Settings,
) => {
  const oauth = new OAuthServer({
    accessTokenLifetime: settings.accessTokenLifetime,
    allowBearerTokensInQueryString: true,
    model: new OAuthModel(settings.usersRepository),
  });

  // TODO this is temporary authentication for api_v1 and events routes
  // until we move them in our controllers:
  app.all('/v1/devices*', oauth.authenticate());
  app.all('/v1/provisioning*', oauth.authenticate());
  app.all('/v1/events*', oauth.authenticate());
  // end temporary

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

      app[httpVerb](
        route,
        maybe(oauth.authenticate(), !anonymous),
        injectUserMiddleware(),
        async (request: $Request, response: $Response) => {
          const argumentNames = request.route.path.split('/:').splice(1);
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
