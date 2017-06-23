// @flow

import type {
  IUserRepository,
  TokenObject,
  User,
  UserCredentials,
  UserRole,
} from '../types';

import uuid from 'uuid';
import { JSONFileManager, memoizeGet, memoizeSet } from 'spark-protocol';
import PasswordHasher from '../lib/PasswordHasher';
import HttpError from '../lib/HttpError';

class UserFileRepository implements IUserRepository {
  _fileManager: JSONFileManager;
  _currentUser: User;

  constructor(path: string) {
    this._fileManager = new JSONFileManager(path);
  }

  createWithCredentials = async (
    userCredentials: UserCredentials,
    userRole: ?UserRole = null,
  ): Promise<User> => {
    const { username, password } = userCredentials;

    const salt = await PasswordHasher.generateSalt();
    const passwordHash = await PasswordHasher.hash(password, salt);
    const modelToSave = {
      accessTokens: [],
      passwordHash,
      role: userRole,
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
  }

  deleteAccessToken = async (userID: string, token: string): Promise<User> => {
    const user = await this.getByID(userID);
    if (!user) {
      throw new Error("User doesn't exist");
    }

    return await this.updateByID(userID, {
      accessTokens: user.accessTokens.filter(
        (tokenObject: TokenObject): boolean =>
          tokenObject.accessToken !== token,
      ),
    });
  };

  @memoizeSet(['id'])
  async deleteByID(id: string): Promise<void> {
    this._fileManager.deleteFile(`${id}.json`);
  }

  @memoizeGet()
  async getAll(): Promise<Array<User>> {
    return this._fileManager.getAllData();
  }

  // This isn't a good one to memoize as we can't key off user ID and there
  // isn't a good way to clear the cache.
  getByAccessToken = async (accessToken: string): Promise<?User> =>
    (await this.getAll()).find((user: User): boolean =>
      user.accessTokens.some(
        (tokenObject: TokenObject): boolean =>
          tokenObject.accessToken === accessToken,
      ),
    );

  @memoizeGet(['id'])
  async getByID(id: string): Promise<?User> {
    return this._fileManager.getFile(`${id}.json`);
  }

  @memoizeGet(['username'])
  async getByUsername(username: string): Promise<?User> {
    return (await this.getAll()).find(
      (user: User): boolean => user.username === username,
    );
  }

  getCurrentUser = (): User => this._currentUser;

  @memoizeGet(['username'])
  async isUserNameInUse(username: string): Promise<boolean> {
    return (await this.getAll()).some(
      (user: User): boolean => user.username === username,
    );
  }

  saveAccessToken = async (
    userID: string,
    tokenObject: TokenObject,
  ): Promise<*> => {
    const user = await this.getByID(userID);

    if (!user) {
      throw new HttpError('Could not find user for user ID');
    }

    return await this.updateByID(userID, {
      accessTokens: [...user.accessTokens, tokenObject],
    });
  };

  setCurrentUser = (user: User) => {
    this._currentUser = user;
  };

  @memoizeSet()
  async updateByID(id: string, props: $Shape<User>): Promise<User> {
    const user = await this.getByID(id);
    const modelToSave = { ...(user || {}), ...props };

    this._fileManager.writeFile(`${id}.json`, modelToSave);
    return modelToSave;
  }

  validateLogin = async (username: string, password: string): Promise<User> => {
    try {
      const user = await this.getByUsername(username);

      if (!user) {
        throw new Error("User doesn't exist");
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
}

export default UserFileRepository;
