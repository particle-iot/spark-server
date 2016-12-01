// @flow

import type { Repository, User, UserCredentials } from '../../types';

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
    const newUser = await this._usersRepository.create(userCredentials);
    return this.ok(newUser);
  }
}

export default UsersController;
