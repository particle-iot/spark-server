// @flow

import type { TokenObject, User, UserCredentials } from '../types';

import { JSONFileManager, uuid } from 'spark-protocol';
import PasswordHasher from '../lib/PasswordHasher';
import HttpError from '../lib/HttpError';

class UserFileRepository {
  _fileManager: JSONFileManager;

  constructor(path: string) {
    this._fileManager = new JSONFileManager(path);
  }

  createWithCredentials = async (
    userCredentials: UserCredentials,
  ): Promise<User> => {
    const { username, password } = userCredentials;

    const salt = await PasswordHasher.generateSalt();
    const passwordHash = await PasswordHasher.hash(password, salt);

    const modelToSave = {
      accessTokens: [],
      created_at: new Date(),
      created_by: null,
      id: uuid(),
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

  update = (user: User): Promise<User> => {
    throw new HttpError('Not implemented');
  };

  getAll = (): Promise<Array<User>> =>
    this._fileManager.getAllData();

  getById = (id: string): Promise<?User> =>
    this._fileManager.getFile(`${id}.json`);

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

  deleteById = (id: string): Promise<void> =>
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
