// @flow

import type { CollectionName } from './collectionNames';
import type {
  IBaseDatabase,
  IUserRepository,
  TokenObject,
  User,
  UserCredentials,
  UserRole,
} from '../types';

import COLLECTION_NAMES from './collectionNames';
import PasswordHasher from '../lib/PasswordHasher';
import HttpError from '../lib/HttpError';

class UserDatabaseRepository implements IUserRepository {
  _database: IBaseDatabase;
  _collectionName: CollectionName = COLLECTION_NAMES.USERS;
  _currentUser: User;

  constructor(database: IBaseDatabase) {
    this._database = database;
  }

  // eslint-disable-next-line no-unused-vars
  create = async (user: $Shape<User>): Promise<User> =>
    await this._database.insertOne(
      this._collectionName,
      user,
    );

  createWithCredentials = async (
    userCredentials: UserCredentials,
    userRole: ?UserRole = null,
  ): Promise<User> => {
    const { username, password } = userCredentials;

    const salt = await PasswordHasher.generateSalt();
    const passwordHash = await PasswordHasher.hash(password, salt);
    const modelToSave = {
      accessTokens: [],
      created_at: new Date(),
      passwordHash,
      role: userRole,
      salt,
      username,
    };

    return await this._database.insertOne(
      this._collectionName,
      modelToSave,
    );
  };

  deleteAccessToken = async (userID: string, accessToken: string): Promise<User> =>
    await this._database.findAndModify(
      this._collectionName,
      { _id: userID },
      { $pull: { accessTokens: { accessToken } } },
    );

  deleteByID = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, { _id: id });

  getAll = async (): Promise<Array<User>> => {
    throw new Error('The method is not implemented');
  };

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

  // eslint-disable-next-line no-unused-vars
  getByID = async (id: string): Promise<?User> => {
    throw new Error('The method is not implemented');
  };

  getByUsername = async (username: string): Promise<?User> =>
    await this._database.findOne(
      this._collectionName,
      { username },
    );

  getCurrentUser = (): User => this._currentUser;

  isUserNameInUse = async (username: string): Promise<boolean> =>
    !!(await this.getByUsername(username));

  saveAccessToken = async (
    userID: string,
    tokenObject: TokenObject,
  ): Promise<*> => await this._database.findAndModify(
    this._collectionName,
    { _id: userID },
    { $push: { accessTokens: tokenObject } },
  );

  setCurrentUser = (user: User) => {
    this._currentUser = user;
  };

  updateByID = async (id: string, props: $Shape<User>): Promise<User> =>
    await this._database.findAndModify(
      this._collectionName,
      { _id: id },
      { $set: { ...props } },
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
