// @flow

import type { Client, Repository, User } from '../types';

import ouathClients from '../oauthClients.json';

class OauthModel {
  _usersRepository: Repository<User>;

  constructor(usersRepository: Repository<User>) {
    this._usersRepository = usersRepository;
  }

  getAccessToken = (bearerToken: string) => {
    const user = this._usersRepository.getByAccessToken(bearerToken);
    if (!user) {
      return false;
    }

    const userTokenObject = user.accessTokens.find((tokenObject) =>
      tokenObject.accessToken === bearerToken,
    );

    return {
      accessToken: userTokenObject.accessToken,
      user,
    };
  };

  getClient = (clientId: string, clientSecret: string): Client =>
    ouathClients.find((client: Client): Client =>
      client.clientId === clientId && client.clientSecret === clientSecret,
    );

  getUser = async (username: string, password: string): User => {
    return await this._usersRepository.validateLogin(username, password);
  };

  saveToken = (tokenObject, client, user) => {
    this._usersRepository.saveAccessToken(user.id, tokenObject);
    return {
      accessToken: tokenObject.accessToken,
      client,
      user,
    };
  };

  // todo figure out this function
  validateScope = (user: User, scope) => scope;
}

export default OauthModel;
