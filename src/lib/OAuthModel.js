// @flow

import type {
  Client,
  TokenObject,
  User,
  UsersRepository,
} from '../types';

import ouathClients from '../oauthClients.json';

class OauthModel {
  _usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this._usersRepository = usersRepository;
  }

  getAccessToken = (bearerToken: string): ?Object => {
    const user = this._usersRepository.getByAccessToken(bearerToken);
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
    await this._usersRepository.validateLogin(username, password);


  saveToken = (tokenObject: TokenObject, client: Client, user: User): Object => {
    this._usersRepository.saveAccessToken(user.id, tokenObject);
    return {
      accessToken: tokenObject.accessToken,
      client,
      user,
    };
  };

  // todo figure out this function
  validateScope = (user: User, client: Client, scope: string): string => true;
}

export default OauthModel;
