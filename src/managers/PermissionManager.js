// @flow

import type {
  IDeviceAttributeRepository,
  IUserRepository,
  IWebhookRepository,
  ProtectedEntityName,
} from '../types';

import nullthrows from 'nullthrows';
import { Request, Response } from 'oauth2-server';
import HttpError from '../lib/HttpError';
import settings from '../settings';
import Logger from '../lib/logger';
const logger = Logger.createModuleLogger(module);

class PermissionManager {
  _userRepository: IUserRepository;
  _repositoriesByEntityName: Map<string, Object> = new Map();
  _oauthServer: Object;

  constructor(
    deviceAttributeRepository: IDeviceAttributeRepository,
    userRepository: IUserRepository,
    webhookRepository: IWebhookRepository,
    oauthServer: Object,
  ) {
    this._userRepository = userRepository;
    this._repositoriesByEntityName.set(
      'deviceAttributes',
      deviceAttributeRepository,
    );
    this._repositoriesByEntityName.set('webhook', webhookRepository);
    this._oauthServer = oauthServer;

    (async (): Promise<void> => await this._init())();
  }

  checkPermissionsForEntityByID = async (
    entityName: ProtectedEntityName,
    id: string,
  ): Promise<boolean> => !!await this.getEntityByID(entityName, id);

  getAllEntitiesForCurrentUser = async (
    entityName: ProtectedEntityName,
  ): Promise<*> => {
    const currentUser = this._userRepository.getCurrentUser();
    return await nullthrows(
      this._repositoriesByEntityName.get(entityName),
    ).getAll(currentUser.id);
  };

  getEntityByID = async (
    entityName: ProtectedEntityName,
    id: string,
  ): Promise<*> => {
    const entity = await nullthrows(
      this._repositoriesByEntityName.get(entityName),
    ).getByID(id);
    if (!entity) {
      return null;
    }

    if (!this.doesUserHaveAccess(entity)) {
      throw new HttpError("User doesn't have access", 403);
    }

    return entity;
  };

  _createDefaultAdminUser = async (): Promise<void> => {
    try {
      await this._userRepository.createWithCredentials(
        {
          password: settings.DEFAULT_ADMIN_PASSWORD,
          username: settings.DEFAULT_ADMIN_USERNAME,
        },
        'administrator',
      );

      const token = await this._generateAdminToken();

      logger.info({ token }, 'New default admin user created');
    } catch (error) {
      logger.error({ err: error }, 'Error during default admin user creating');
    }
  };

  doesUserHaveAccess = ({ ownerID }: Object): boolean => {
    const currentUser = this._userRepository.getCurrentUser();
    return currentUser.role === 'administrator' || currentUser.id === ownerID;
  };

  _generateAdminToken = async (): Promise<string> => {
    const request = new Request({
      body: {
        client_id: 'spark-server',
        client_secret: 'spark-server',
        grant_type: 'password',
        password: settings.DEFAULT_ADMIN_PASSWORD,
        username: settings.DEFAULT_ADMIN_USERNAME,
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'transfer-encoding': 'chunked',
      },
      method: 'POST',
      query: {},
    });

    const response = new Response({ body: {}, headers: {} });

    const tokenPayload = await this._oauthServer.server.token(
      request,
      response,
      // oauth server doesn't allow us to use infinite access token
      // so we pass some big value here
      { accessTokenLifetime: 9999999999 },
    );

    return tokenPayload.accessToken;
  };

  _init = async (): Promise<void> => {
    const defaultAdminUser = await this._userRepository.getByUsername(
      settings.DEFAULT_ADMIN_USERNAME,
    );
    if (defaultAdminUser) {
      logger.info(
        { token: defaultAdminUser.accessTokens[0].accessToken },
        'Default Admin token',
      );
    } else {
      await this._createDefaultAdminUser();
    }
  };
}

export default PermissionManager;
