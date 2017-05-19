// @flow

import type { Database, TokenObject, User, UserCredentials } from '../types';

import PasswordHasher from '../lib/PasswordHasher';
import HttpError from '../lib/HttpError';

class UserDatabaseRepository {
  _collection: Object;

  constructor(database: Database) {
    this._collection = database.getCollection('users');
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

    const user = (await this._collection.insert(
      modelToSave,
      { fullResult: true },
    ))[0];
    return { ...user, id: user._id.toString() };
  };

  deleteAccessToken = async (userID: string, accessToken: string): Promise<void> =>
    await this._collection.findAndModify(
      { _id: userID },
      null,
      { $pull: { accessTokens: { accessToken } } },
      { new: true },
    );

  deleteById = async (id: string): Promise<void> =>
    await this._collection.remove({ _id: id });

  getByAccessToken = async (accessToken: string): Promise<?User> => {
    const user = await this._collection.findOne(
      { 'accessTokens.accessToken': accessToken },
    );

    return user ? { ...user, id: user._id.toString() } : null;
  };

  getByUsername = async (username: string): Promise<?User> => {
    const user = await this._collection.findOne({ username });

    return user ? { ...user, id: user._id.toString() } : null;
  };

  isUserNameInUse = async (username: string): Promise<boolean> =>
    !!(await this.getByUsername(username));

  saveAccessToken = async (
    userID: string,
    tokenObject: TokenObject,
  ): Promise<*> => await this._collection.findAndModify(
    { _id: userID },
    null,
    { $push: { accessTokens: tokenObject } },
    { new: true },
  );

  validateLogin = async (username: string, password: string): Promise<User> => {
    try {
      const user = await this._collection.findOne({ username });

      if (!user) {
        throw new HttpError('User doesn\'t exist', 404);
      }

      const hash = await PasswordHasher.hash(password, user.salt);
      if (hash !== user.passwordHash) {
        throw new HttpError('Wrong password');
      }

      return { ...user, id: user._id.toString() };
    } catch (error) {
      throw error;
    }
  };
}

export default UserDatabaseRepository;
