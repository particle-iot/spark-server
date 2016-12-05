// @flow

import type { Repository, User, UserCredentials } from '../../types';

import basicAuthParser from 'basic-auth-parser';
import Controller from './Controller';
import anonymous from '../decorators/anonymous';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

class UsersController extends Controller {
  _usersRepository: Repository<User>;

  constructor(usersRepository: Repository<User>) {
    super();
    this._usersRepository = usersRepository;
  }

  @httpVerb('post')
  @route('/v1/users')
  @anonymous()
  async createUser(userCredentials: UserCredentials) {
    try {
      const isUserNameExist = this._usersRepository.getAll()
        .some((user: User): boolean => user.username === userCredentials.username);

      if (isUserNameExist) {
        throw new Error('user with the username is already exist');
      }

      const newUser = await this._usersRepository.create(userCredentials);
      return this.ok(newUser);
    } catch (error) {
      return this.bad(error.message);
    }
  }

  @httpVerb('delete')
  @route('/v1/access_tokens/:token')
  @anonymous()
  async deleteAccessToken(token: string) {
    try {
      const { username, password } = basicAuthParser(this.request.get('authorization'));
      const user = await this._usersRepository.validateLogin(username, password);

      this._usersRepository.deleteAccessToken(user, token);

      return this.ok({ ok: true });
    } catch (error) {
      return this.bad(error.message);
    }
  }

  @httpVerb('get')
  @route('/v1/access_tokens')
  @anonymous()
  async getAccessTokens() {
    try {
      const { username, password } = basicAuthParser(this.request.get('authorization'));
      const user = await this._usersRepository.validateLogin(username, password);
      return this.ok(user.accessTokens);
    } catch (error) {
      return this.bad(error.message);
    }
  }
}

export default UsersController;
