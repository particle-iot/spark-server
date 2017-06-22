// @flow

import oauthClients from './oauthClients.json';

import type { Client, IUserRepository, TokenObject, User } from './types';

const OAUTH_CLIENTS = oauthClients;

class OauthModel {
  _userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this._userRepository = userRepository;
  }

  getAccessToken = async (bearerToken: string): ?Object => {
    const user = await this._userRepository.getByAccessToken(bearerToken);
    if (!user) {
      return null;
    }

    const userTokenObject = user.accessTokens.find(
      (tokenObject: TokenObject): boolean =>
        tokenObject.accessToken === bearerToken,
    );

    if (!userTokenObject) {
      return null;
    }

    return {
      ...userTokenObject,
      user,
    };
  };

  getClient = (clientId: string, clientSecret: string): ?Client =>
    OAUTH_CLIENTS.find(
      (client: Client): boolean =>
        client.clientId === clientId && client.clientSecret === clientSecret,
    );

  getUser = async (username: string, password: string): Promise<User> =>
    await this._userRepository.validateLogin(username, password);

  saveToken = (
    tokenObject: TokenObject,
    client: Client,
    user: User,
  ): Object => {
    this._userRepository.saveAccessToken(user.id, tokenObject);
    return {
      accessToken: tokenObject.accessToken,
      client,
      user,
    };
  };

  // eslint-disable-next-line no-unused-vars
  validateScope = (user: User, client: Client, scope: string): string => 'true';
}

export default OauthModel;
