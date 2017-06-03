// @flow

import type {
  IDeviceAttributeRepository,
  IUserRepository,
  IWebhookRepository,
  ProtectedEntityName,
} from '../types';
import HttpError from '../lib/HttpError';
import nullthrows from 'nullthrows';
import settings from '../settings';
import { generateRandomToken } from '../lib/utils';

const MAX_TIMESTAMP = 8640000000000000;

class PermissionManager {
  _userRepository: IUserRepository;
  _repositoriesByEntityName: Map<string, Object> = new Map();

  constructor(
    deviceAttributeRepository: IDeviceAttributeRepository,
    userRepository: IUserRepository,
    webhookRepository: IWebhookRepository,
  ) {
    this._userRepository = userRepository;
    this._repositoriesByEntityName.set('deviceAttributes', deviceAttributeRepository);
    this._repositoriesByEntityName.set('webhook', webhookRepository);

    (async (): Promise<void> => await this._init())();
  }

  checkPermissionsForEntityByID = async (
    entityName: ProtectedEntityName,
    id: string,
  ): Promise<boolean> => !!(await this.getEntityByID(entityName, id));

  getAllEntitiesForCurrentUser = async (entityName: ProtectedEntityName): Promise<*> => {
    const currentUser = this._userRepository.getCurrentUser();
    return await nullthrows(this._repositoriesByEntityName.get(entityName))
      .getAll(currentUser.id);
  }

  getEntityByID = async (
    entityName: ProtectedEntityName,
    id: string,
  ): Promise<*> => {
    const entity = await nullthrows(this._repositoriesByEntityName.get(entityName)).getById(id);
    if (!entity) {
      return null;
    }
    if (!this._doesUserHaveAccess(entity.ownerID)) {
      throw new HttpError('User doesn\'t have access', 403);
    }
    return entity;
  }

  _createDefaultAdminUser = async (): Promise<void> => {
    const defaultAdminUser = await this._userRepository.createWithCredentials(
      {
        password: settings.DEFAULT_ADMIN_PASSWORD,
        username: settings.DEFAULT_ADMIN_USERNAME,
      },
      'administrator',
    );

    const accessTokenObject = {
      accessToken: await generateRandomToken(),
      accessTokenExpiresAt: new Date(MAX_TIMESTAMP),
    };

    const userToUpdate = {
      ...defaultAdminUser,
      accessTokens: [accessTokenObject],
    };

    await this._userRepository.update(userToUpdate);
    console.log(
      `New default admin user created with token ${accessTokenObject.accessToken}`,
    );
  };

  _doesUserHaveAccess = (ownerID: ?string): boolean => {
    const currentUser = this._userRepository.getCurrentUser();
    return currentUser.role === 'administrator' || currentUser.id === ownerID;
  }

  _init = async (): Promise<void> => {
    const defaultAdminUser =
      await this._userRepository.getByUsername(settings.DEFAULT_ADMIN_USERNAME);
    if (defaultAdminUser) {
      console.log(
        `Default admin accessToken: ${defaultAdminUser.accessTokens[0].accessToken}`,
      );
    } else {
      await this._createDefaultAdminUser();
    }
  };
}

export default PermissionManager;
