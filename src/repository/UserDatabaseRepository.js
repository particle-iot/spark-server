// @flow

import type { Database, TokenObject, User, UserCredentials } from '../types';

import PasswordHasher from '../lib/PasswordHasher';
import HttpError from '../lib/HttpError';

class UserDatabaseRepository {
  _database: Object;
  _collectionName: string = 'users';

  constructor(database: Database) {
    this._database = database;
  }

  createWithCredentials = async (userCredentials: UserCredentials): Promise<User> => {
    const { username, password } = userCredentials;

    const salt = await PasswordHasher.generateSalt();
    const passwordHash = await PasswordHasher.hash(password, salt);
    const modelToSave = {
      accessTokens: [],
      created_at: new Date(),
      created_by: null,
      passwordHash,
      salt,
      username,
    };

    return await this._database.insertOne(
      this._collectionName,
      modelToSave,
    );
  };

  deleteAccessToken = async (userID: string, accessToken: string): Promise<void> =>
    await this._database.findAndModify(
      this._collectionName,
      { _id: userID },
      null,
      { $pull: { accessTokens: { accessToken } } },
      { new: true },
    );

  deleteById = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, id);

  getByAccessToken = async (accessToken: string): Promise<?User> => {
    let user = await this._database.findOne(
      this._collectionName,
      { accessTokens: { $elemMatch: { accessToken } } },
    );

    if (!user) {
      // The newer query only works on mongo so we run this for tingo.
      user = await this._database.findOne(
        this._collectionName,
        { 'accessTokens.accessToken': accessToken },
      );
    }

    return user;
  };

  getByUsername = async (username: string): Promise<?User> =>
    await this._database.findOne(
      this._collectionName,
      { username },
    );

  isUserNameInUse = async (username: string): Promise<boolean> =>
    !!(await this.getByUsername(username));

  saveAccessToken = async (
    userID: string,
    tokenObject: TokenObject,
  ): Promise<*> => await this._database.findAndModify(
    this._collectionName,
    { _id: userID },
    null,
    { $push: { accessTokens: tokenObject } },
    { new: true },
  );

  validateLogin = async (username: string, password: string): Promise<User> => {
    try {
      const user = await this._database.findOne(
        this._collectionName,
        { username },
      );

      if (!user) {
        throw new HttpError('User doesn\'t exist', 404);
      }

      const hash = await PasswordHasher.hash(password, user.salt);
      if (hash !== user.passwordHash) {
        throw new HttpError('Wrong password');
      }

      return user;
    } catch (error) {
      throw error;
    }
  };
}

export default UserDatabaseRepository;
