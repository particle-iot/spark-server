// @flow

import type { TokenObject, User, UserCredentials } from '../types';

import uuid from 'uuid';
import { JSONFileManager, memoizeGet, memoizeSet } from 'spark-protocol';
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
      passwordHash,
      salt,
      username,
    };

    return await this.create(modelToSave);
  };

  @memoizeSet()
  async create(user: $Shape<User>): Promise<User> {
    let id = uuid();
    while (await this._fileManager.hasFile(`${id}.json`)) {
      id = uuid();
    }

    const modelToSave = {
      ...user,
      created_at: new Date(),
      created_by: null,
      id,
    };

    this._fileManager.createFile(`${modelToSave.id}.json`, modelToSave);
    return modelToSave;
  };

  @memoizeSet()
  async update(model: User): Promise<User> {
    this._fileManager.writeFile(`${model.id}.json`, model);
    return model;
  };

  @memoizeGet()
  async getAll(): Promise<Array<User>> {
    return this._fileManager.getAllData();
  }

  @memoizeGet(['id'])
  async getById(id: string): Promise<?User> {
    return this._fileManager.getFile(`${id}.json`);
  }

  @memoizeGet(['username'])
  async getByUsername(username: string): Promise<?User> {
    return (await this.getAll()).find(
      (user: User): boolean => user.username === username,
    );
  }

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

  // This isn't a good one to memoize as we can't key off user ID and there
  // isn't a good way to clear the cache.
  getByAccessToken = async (accessToken: string): Promise<?User> => {
    return (await this.getAll()).find((user: User): boolean =>
      user.accessTokens.some((tokenObject: TokenObject): boolean =>
        tokenObject.accessToken === accessToken,
      ),
    );
  }

  deleteAccessToken = async (userID: string, token: string): Promise<*> => {
    const user = await this.getById(userID);
    if (!user) {
      throw new Error('User doesn\'t exist');
    }

    const userToSave = {
      ...user,
      accessTokens: user.accessTokens.filter(
        (tokenObject: TokenObject): boolean =>
          tokenObject.accessToken !== token,
      ),
    };

    await this.update(userToSave);
  }

  @memoizeSet(['id'])
  async deleteById(id: string): Promise<void> {
    this._fileManager.deleteFile(`${id}.json`);
  }


  @memoizeGet(['username'])
  async isUserNameInUse(username: string): Promise<boolean> {
    return (await this.getAll()).some((user: User): boolean =>
      user.username === username,
    );
  }

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

    return await this.update(userToSave);
  }
}

export default UserFileRepository;
