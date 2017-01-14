// @flow

import type { File } from 'express';
import type DeviceFirmwareRepository from './repository/DeviceFirmwareFileRepository';

export type Webhook = {
  auth?: { Authorization: string },
  created_at: Date,
  deviceID?: string,
  errorResponseTopic?: string,
  event: string,
  form?: { [key: string]: Object },
  headers?: { [key: string]: string },
  id: string,
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
  productFirmwareVersion: number,
  registrar: string,
  timestamp: Date,
};

export type Event = EventData & {
  publishedAt: Date,
};

export type EventData = {
  data: ?Object,
  deviceID?: ?string,
  isPublic: boolean,
  name: string,
  ttl: number,
  userID?: ?string,
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
  create: (model: TModel | $Shape<TModel>) => Promise<TModel>,
  deleteById: (id: string) => Promise<void>,
  getAll: () => Promise<Array<TModel>>,
  getById: (id: string) => Promise<?TModel>,
  update: (model: TModel) => Promise<TModel>,
};

export type UserRepository = Repository<User> & {
  createWithCredentials(credentials: UserCredentials): Promise<User>,
  deleteAccessToken(user: User, accessToken: string): Promise<void>,
  getByAccessToken(accessToken: string): Promise<?User>,
  getByUsername(username: string): Promise<?User>,
  isUserNameInUse(username: string): Promise<boolean>,
  saveAccessToken(userId: string, tokenObject: TokenObject): Promise<void>,
  validateLogin(username: string, password: string): Promise<User>,
};

export type Settings = {
  accessTokenLifetime: number,
  baseUrl: string,
  coreFlashTimeout: number,
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
  serverKeyPassEnvVar: ?string,
  serverKeyPassFile: ?string,
};

export type DeviceAttributeRepository = Repository<DeviceAttributes> & {
  doesUserHaveAccess(deviceID: string, userID: string): Promise<boolean>,
};

export type DeviceRepository = {
  callFunction(
    deviceID: string,
    userID: string,
    functionName: string,
    functionArguments: Object,
  ): Promise<*>,
  claimDevice(deviceID: string, userID: string): Promise<DeviceAttributes>,
  flashBinary(deviceID: string, files: File): Promise<*>,
  flashKnownApp(deviceID: string, userID: string, app: string): Promise<*>,
  getAll(userID: string): Promise<Array<Device>>,
  getByID(deviceID: string, userID: string): Promise<Device>,
  getDetailsByID(deviceID: string, userID: string): Promise<*>,
  getVariableValue(deviceID: string, userID: string, varName: string): Promise<Object>,
  provision(deviceID: string, userID: string, publicKey: string): Promise<*>,
  raiseYourHand(deviceID: string, userID: string, shouldShowSignal: boolean): Promise<void>,
  renameDevice(deviceID: string, userID: string, name: string): Promise<DeviceAttributes>,
  unclaimDevice(deviceID: string, userID: string): Promise<DeviceAttributes>,
};
