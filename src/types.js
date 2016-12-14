// @flow

import type { File } from 'express';

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

export type DeviceAttributes = {
  deviceID: string,
  ip: string,
  name: string,
  ownerID: ?string,
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

export type Device = DeviceAttributes & {
  connected: boolean,
  functions?: Array<string>,
  lastFlashedAppName: ?string,
  lastHeard: ?Date,
  variables?: Object,
};

export type Repository<TModel> = {
  create: (model: TModel) => Promise<TModel>,
  deleteById: (id: string) => Promise<void>,
  getAll: () => Promise<Array<TModel>>,
  getById: (id: string) => Promise<?TModel>,
  update: (model: TModel) => Promise<TModel>,
};

export type UserRepository = Repository<User> & {
  createWithCredentials(credentials: UserCredentials): Promise<User>,
  deleteAccessToken(user: User, accessToken: string): void,
  getByAccessToken(accessToken: string): Promise<?User>,
  getByUsername(username: string): Promise<?User>,
  isUserNameInUse(username: string): Promise<boolean>,
  saveAccessToken(userId: string, tokenObject: TokenObject): void,
  validateLogin(username: string, password: string): Promise<User>,
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
  usersRepository: UserRepository,
  webhookRepository: Repository<*>,
};

export type DeviceRepository = {
  callFunction(
    deviceID: string,
    functionName: string,
    functionArguments: Object,
  ): Promise<*>,
  claimDevice(deviceID: string, userID: string): Promise<DeviceAttributes>,
  flashBinary(deviceID: string, files: Array<$File>): Promise<*>,
  flashKnownApp(deviceID: string, app: string): Promise<*>,
  getAll(userID: string): Promise<Array<Device>>,
  getByID(deviceID: string, userID: string): Promise<Device>,
  getDetailsByID(deviceID: string): Promise<*>,
  provision(deviceID: string, userID: string, publicKey: string): Promise<*>,
  renameDevice(deviceID: string, userID: string, name: string): Promise<DeviceAttributes>,
  unclaimDevice(deviceID: string, userID: string): Promise<DeviceAttributes>,
};
