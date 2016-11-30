export type Webhook = {
  deviceID: string,
  event: string,
  errorResponseTopic: string,
  id: string,
  json: {[key: string]: Object},
  mydevices: boolean,
  productIdOrSlug: ?string,
  rejectUnauthorized: boolean,
  requestType: string,
  responseTemplate: ?string,
  responseTopic: string,
  url: string,
};


export type Client = {
  clientId: string,
  clientSecret: string,
  grants: Array<GrantType>,
};

export type Device = {
  deviceId: string,
  ip: string,
  particleProductId: number,
  productFirmwareVersion: number,
  registrar: string,
  timestamp: Date,
};

export type GrantType =
  'bearer_token'|
  'password'|
  'refresh_token';

export type TokenObject = {
  accessToken: string
  accessTokenExpiresAt: Date,
  refreshToken: string,
  refreshTokenExpiresAt: Date,
  scope: string,
};

export type User = {
  accessTokens: Array<TokenObject>,
  created_at: Date,
  id: string,
  passwordHash: string,
  username: string,
};

export type UserCredentials = {
  username: string,
  password: string,
};

export type Repository<TModel> = {
  create: (id: string, model: TModel) => TModel,
  delete: (id: string) => void,
  getAll: () => Array<TModel>,
  getById: (id: string) => TModel,
  update: (id: string, model: TModel) => TModel,
};
