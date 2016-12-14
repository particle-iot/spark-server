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
import type HttpError from './HttpError';

import OAuthModel from './OAuthModel';
import OAuthServer from 'express-oauth-server';
import multer from 'multer';

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
      const token = (oauthInfo: any).token;
      // eslint-disable-next-line no-param-reassign
      (request: any).user = token && token.user;
    }
    next();
  };
const defaultMiddleware =
  (request: $Request, response: $Response, next: NextFunction): mixed => next();

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

  const injectFilesMiddleware = multer();

  app.post(settings.loginRoute, oauth.token());

  controllers.forEach((controller: Controller) => {
    Object.getOwnPropertyNames(
      (Object.getPrototypeOf(controller): any),
    ).forEach((functionName: string) => {
      const mappedFunction = (controller: any)[functionName];
      const { allowedUploads, anonymous, httpVerb, route } = mappedFunction;
      if (!httpVerb) {
        return;
      }

      (app: any)[httpVerb](
        route,
        maybe(oauth.authenticate(), !anonymous),
        injectUserMiddleware(),
        allowedUploads
          ? injectFilesMiddleware.fields(allowedUploads)
          : defaultMiddleware,
        (request: $Request, response: $Response) => {
          const argumentNames = (route.match(/:[\w]*/g) || []).map(
            (argumentName: string): string => argumentName.replace(':', ''),
          );
          const values = argumentNames
            .map((argument: string): string => request.params[argument])
            .filter((value: ?Object): boolean => value !== undefined);

          const controllerContext = Object.create(controller);
          controllerContext.request = request;
          controllerContext.response = response;
          controllerContext.user = (request: any).user;

          // Take access token out if it's posted.
          const {
            access_token, // eslint-disable-line no-unused-vars
            ...body
          } = request.body;

          try {
            const functionResult = mappedFunction.call(
              controllerContext,
              ...values,
              body,
            );

            if (functionResult.then) {
              functionResult
                .then((result: Object) => {
                  response.status(result.status).json(result.data);
                })
                .catch((error: HttpError) => {
                  response.status(error.status || 400).json({
                    error: error.message,
                    ok: false,
                  });
                });
            } else {
              response.status(functionResult.status).json(functionResult.data);
            }
          } catch (error) {
            response.status(error.status || 400).json({
              error: error.message,
              ok: false,
            });
          }
        });
    });
  });

  app.all('*', (request: $Request, response: $Response) => {
    response.sendStatus(404);
  });

  (app: any).use((
    error: string,
    request: $Request,
    response: $Response,
  ) => {
    response
      .status(400)
      .json({
        error: error.code ? error.code : error,
        ok: false,
      });
  });
};
