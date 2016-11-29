// @flow

import type { TokenObject, User, UserCredentials } from '../../types';

import { FileManager, uuid } from 'spark-protocol';
import PasswordHasher from '../PasswordHasher';

class UsersFileRepository {
  _fileManager: FileManager;

  constructor(path: string) {
    this._fileManager = new FileManager(path);
  }

  create = async (userCredentials: UserCredentials): User => {
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
    // todo make async call of fileManager when implement async inside fileManager
    this._fileManager.createFile(`${modelToSave.id}.json`, modelToSave);
    return modelToSave;
  };

  getAll(): Array<User> {
    return this._fileManager.getAllData();
  }

  getById(id: string): User {
    return this._fileManager.getFile(id + '.json');
  }

  getByUsername(username: string) {
    return this.getAll().find((user: User) => user.username === username);
  }

  async validateLogin(username: string, password: string) {
    try {
      const user = this.getByUsername(username);
      if (!user) {
        throw new Error('user doesn\'t exist');
      }

      const hash = await PasswordHasher.hash(password, user.salt);
      if (hash !== user.passwordHash) {
        throw new Error('wrong password');
      }

      return user;
    } catch (error) {
      return error;
    }
  }

  saveAccessToken(userId: string, tokenObject: TokenObject) {
    const user = this.getById(userId);
    const userToSave = {
      ...user,
      accessTokens: [...user.accessTokens, tokenObject],
    };

    // todo make async call of fileManager when implement async inside fileManager
    this._fileManager.writeFile(`${userId}.json`, userToSave);
  }
}

export default UsersFileRepository;
