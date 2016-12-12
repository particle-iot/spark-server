// @flow

export type Webhook = WebhookMutator & {
  created_at: Date,
  id: string,
};

export type WebhookMutator = {
  auth?: { Authorization: string },
  deviceID?: string,
  errorResponseTopic?: string,
  event: string,
  form?: { [key: string]: Object },
  headers?: { [key: string]: string },
  json?: { [key: string]: Object },
  mydevices?: boolean,
  noDefaults?: boolean,
  productIdOrSlug?: string,
  query?: { [key: string]: Object },
  rejectUnauthorized?: boolean,
  requestType: RequestType,
  responseTemplate?: string,
  responseTopic?: string,
  url: string,
};

export type RequestType = 'DELETE' | 'GET' | 'POST' | 'PUT';

export type Client = {
  clientId: string,
  clientSecret: string,
  grants: Array<GrantType>,
};

export type Device = {
export type DeviceAttributes = {
  deviceId: string,
  ip: string,
  particleProductId: number,
  productFirmwareVersion: string,
  registrar: string,
  timestamp: Date,
};

export type GrantType =
  'bearer_token'|
  'password'|
  'refresh_token';

export type TokenObject = {
  accessToken: string,
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
  salt: string,
  username: string,
};

export type UserCredentials = {
  username: string,
  password: string,
};

export type Repository<TModel, TMutator> = {
  create: (model: TMutator) => TModel,
  deleteById: (id: string) => void,

export type Device = DeviceAttributes & {
  connected: boolean,
  lastFlashedAppName: ?string,
  lastHeard: ?Date,
};

export type Repository<TModel> = {
  create: (id: string, model: TModel) => TModel,
  delete: (id: string) => void,
  getAll: () => Array<TModel>,
  getById: (id: string) => TModel,
  update: (id: string, model: TModel) => TModel,
};

export type UsersRepository = Repository<User, UserCredentials> & {
  deleteAccessToken: (user: User, accessToken: string) => void,
  getByAccessToken: (accessToken: string) => User,
  getByUsername: (username: string) => ?User,
  isUserNameInUse: (username: string) => boolean,
  saveAccessToken: (accessToken: string) => void,
  validateLogin: (username: string, password: string) => User,
};

export type Settings = {
  accessTokenLifetime: number,
  baseUrl: string,
  coreFlashTimeout: number,
  coreKeysDir: string,
  coreRequestTimeout: number,
  coreSignalTimeout: number,
  cryptoSalt: string,
  HOST: string,
  isCoreOnlineTimeout: number,
  loginRoute: string,
  logRequests: boolean,
  maxHooksPerDevice: number,
  maxHooksPerUser: number,
  PORT: number,
  serverKeyFile: string,
  serverKeyPassEnvVar: ?string,
  serverKeyPassFile: ?string,
  usersRepository: Repository<*, *>,
  webhookRepository: Repository<*, *>,
};

export type DeviceRepository = {
  getAll(): Promise<Array<Device>>,
};
