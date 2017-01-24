// @flow

import type {
  Client,
  TokenObject,
  User,
  UserRepository,
} from './types';

import ouathClients from './oauthClients.json';

class OauthModel {
  _userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
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
      accessToken: userTokenObject.accessToken,
      user,
    };
  };

  getClient = (clientId: string, clientSecret: string): Client =>
    ouathClients.find((client: Client): boolean =>
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
