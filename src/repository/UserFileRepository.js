// @flow

import type { TokenObject, User, UserCredentials } from '../types';

import uuid from 'uuid';
import { JSONFileManager } from 'spark-protocol';
import PasswordHasher from '../lib/PasswordHasher';
import HttpError from '../lib/HttpError';

class UserFileRepository {
  _fileManager: JSONFileManager;

  constructor(path: string) {
    this._fileManager = new JSONFileManager(path);
  }

  addClaimCode = async (
    userID: string,
    claimCode: string,
  ): Promise<User> => {
    const user = await this.getById(userID);
    if (!user) {
      throw new Error('no user found');
    }
    return await this.update({
      ...user,
      claimCodes: [...user.claimCodes, claimCode],
    });
  };

  removeClaimCode = async (
    userID: string,
    claimCode: string,
  ): Promise<?User> => {
    const user = await this.getById(userID);
    if (!user) {
      return null;
    }
    return await this.update({
      ...user,
      claimCodes: user.claimCodes.filter(
        (code: string): boolean =>
          code !== claimCode,
      ),
    });
  };

  createWithCredentials = async (
    userCredentials: UserCredentials,
  ): Promise<User> => {
    const { username, password } = userCredentials;

    const salt = await PasswordHasher.generateSalt();
    const passwordHash = await PasswordHasher.hash(password, salt);
    let id = uuid();
    while (await this.getById(id)) {
      id = uuid();
    }

    const modelToSave = {
      accessTokens: [],
      claimCodes: [],
      created_at: new Date(),
      created_by: null,
      id,
      passwordHash,
      salt,
      username,
    };

    this._fileManager.createFile(`${modelToSave.id}.json`, modelToSave);
    return modelToSave;
  };

  create = (user: User): Promise<User> => {
    throw new HttpError('Not implemented');
  };

  update = async (model: User): Promise<User> => {
    this._fileManager.writeFile(`${model.id}.json`, model);
    return model;
  };

  getAll = async (): Promise<Array<User>> =>
    this._fileManager.getAllData();

  getById = async (id: string): Promise<?User> =>
    this._fileManager.getFile(`${id}.json`);

  getByClaimCode = async (claimCode: string): Promise<?User> =>
    (await this.getAll()).find(
      (user: User): boolean =>
        user.claimCodes.some((code: string): boolean =>
          code === claimCode,
        ),
    );

  getByUsername = async (username: string): Promise<?User> =>
    (await this.getAll()).find(
      (user: User): boolean => user.username === username,
    );

  validateLogin = async (username: string, password: string): Promise<User> => {
    try {
      const user = await this.getByUsername(username);
      if (!user) {
        throw new Error('User doesn\'t exist');
      }

      const hash = await PasswordHasher.hash(password, user.salt);
      if (hash !== user.passwordHash) {
        throw new Error('Wrong password');
      }

      return user;
    } catch (error) {
      throw error;
    }
  };

  getByAccessToken = async (accessToken: string): Promise<?User> =>
    (await this.getAll()).find((user: User): boolean =>
      user.accessTokens.some((tokenObject: TokenObject): boolean =>
        tokenObject.accessToken === accessToken,
      ),
    );

  deleteAccessToken = async (user: User, token: string): Promise<*> => {
    const userToSave = {
      ...user,
      accessTokens: user.accessTokens.filter(
        (tokenObject: TokenObject): boolean =>
          tokenObject.accessToken !== token,
      ),
    };

    this._fileManager.writeFile(`${user.id}.json`, userToSave);
  };

  deleteById = async (id: string): Promise<void> =>
    this._fileManager.deleteFile(`${id}.json`);


  isUserNameInUse = async (username: string): Promise<boolean> =>
    (await this.getAll()).some((user: User): boolean =>
      user.username === username,
    );

  saveAccessToken = async (
    userID: string,
    tokenObject: TokenObject,
  ): Promise<*> => {
    const user = await this.getById(userID);

    if (!user) {
      throw new HttpError('Could not find user for user ID');
    }

    const userToSave = {
      ...user,
      accessTokens: [...user.accessTokens, tokenObject],
    };

    this._fileManager.writeFile(`${userID}.json`, userToSave);
  }
}

export default UserFileRepository;
