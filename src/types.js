// @flow
/* eslint-disable */

import type { File } from 'express';
import bunyan from 'bunyan';

export type Webhook = {
  auth?: { password: string, username: string },
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
  ownerID: string,
  productIdOrSlug?: string,
  query?: { [key: string]: Object },
  rejectUnauthorized?: boolean,
  requestType: string,
  responseTemplate?: string,
  responseTopic?: string,
  url: string,
};

export type WebhookMutator = {
  auth?: { password: string, username: string },
  deviceID?: string,
  errorResponseTopic?: string,
  event: string,
  form?: { [key: string]: Object },
  headers?: { [key: string]: string },
  json?: { [key: string]: Object },
  mydevices?: boolean,
  noDefaults?: boolean,
  ownerID: string,
  productIdOrSlug?: string,
  query?: { [key: string]: Object },
  rejectUnauthorized?: boolean,
  requestType: string,
  responseTemplate?: string,
  responseTopic?: string,
  url: string,
};

export interface IWebhookLogger {
  log(...args: Array<any>): void,
}

export type RequestType = 'DELETE' | 'GET' | 'POST' | 'PUT';

export type Client = {
  clientId: string,
  clientSecret: string,
  grants: Array<GrantType>,
};

export type Device = DeviceAttributes & {
  connected: boolean,
};

export type DeviceAttributes = {
  appHash: ?string,
  currentBuildTarget: string,
  deviceID: string,
  functions?: ?Array<string>,
  imei?: string,
  ip: string,
  isCellular: boolean,
  last_iccid?: string,
  lastFlashedAppName: ?string,
  lastHeard: Date,
  name: string,
  ownerID: ?string,
  particleProductId: number,
  productFirmwareVersion: number,
  registrar: string,
  timestamp: Date,
  variables?: ?Object,
};

export type DeviceKeyObject = {
  algorithm: 'ecc' | 'rsa',
  deviceID: string,
  key: string,
};

export type Event = EventData & {
  broadcasted?: boolean,
  publishedAt: Date,
  ttl: number,
};

export type EventData = {
  context?: Object,
  data?: string,
  deviceID?: ?string,
  isPublic: boolean,
  name: string,
  ttl?: number,
  userID: string,
};

export type GrantType = 'bearer_token' | 'password' | 'refresh_token';

export type TokenObject = {
  accessToken: string,
  accessTokenExpiresAt: Date,
  refreshToken?: string,
  refreshTokenExpiresAt?: Date,
  scope?: string,
};

export type User = {
  accessTokens: Array<TokenObject>,
  created_at: Date,
  id: string,
  passwordHash: string,
  role: ?UserRole,
  salt: string,
  username: string,
};

export type UserCredentials = {
  username: string,
  password: string,
};

export type UserRole = 'administrator';

export type ProtectedEntityName = 'deviceAttributes' | 'webhook';

export type Settings = {
  ACCESS_TOKEN_LIFETIME: number,
  API_TIMEOUT: number,
  BUILD_DIRECTORY: string,
  CRYPTO_ALGORITHM: string,
  DB_CONFIG: {
    OPTIONS?: Object,
    PATH?: string,
    URL?: string,
  },
  DEFAULT_ADMIN_PASSWORD: string,
  DEFAULT_ADMIN_USERNAME: string,
  DEVICE_DIRECTORY: string,
  ENABLE_SYSTEM_FIRWMARE_AUTOUPDATES: boolean,
  EXPRESS_SERVER_CONFIG: {
    PORT: number,
    SSL_CERTIFICATE_FILEPATH: ?string,
    SSL_PRIVATE_KEY_FILEPATH: ?string,
    USE_SSL: boolean,
  },
  FIRMWARE_DIRECTORY: string,
  FIRMWARE_REPOSITORY_DIRECTORY: string,
  LOG_LEVEL: 'debug' | 'error' | 'fatal' | 'info' | 'warn' | 'trace',
  LOGIN_ROUTE: string,
  SERVER_KEY_FILENAME: string,
  SERVER_KEYS_DIRECTORY: string,
  TCP_DEVICE_SERVER_CONFIG: {
    HOST: string,
    PORT: number,
  },
  USERS_DIRECTORY: string,
  WEBHOOK_TEMPLATE_PARAMETERS: { [key: string]: string },
  WEBHOOKS_DIRECTORY: string,
};

export type RequestOptions = {
  auth?: { password: string, username: string },
  body: ?Object,
  form: ?Object,
  headers: ?Object,
  json: boolean,
  method: RequestType,
  qs: ?Object,
  strictSSL?: boolean,
  url: string,
};

export type Product = {
  config_id: string,
  description: string,
  hardware_version: string,
  id: string,
  name: string,
  organization: string,
  product_id: number,
  requires_activation_codes: boolean,
  slug: string,
  type: 'Consumer' | 'Hobbyist' | 'Industrial',
};

export interface IBaseRepository<TModel> {
  create(model: TModel | $Shape<TModel>): Promise<TModel>,
  deleteByID(id: string): Promise<void>,
  getAll(): Promise<Array<TModel>>,
  getByID(id: string): Promise<?TModel>,
  updateByID(id: string, props: $Shape<TModel>): Promise<TModel>,
}

export interface IWebhookRepository extends IBaseRepository<Webhook> {}

export interface IDeviceAttributeRepository
  extends IBaseRepository<DeviceAttributes> {}

export interface IDeviceKeyRepository
  extends IBaseRepository<DeviceKeyObject> {}

export interface IUserRepository extends IBaseRepository<User> {
  createWithCredentials(credentials: UserCredentials): Promise<User>,
  deleteAccessToken(userID: string, accessToken: string): Promise<User>,
  getByAccessToken(accessToken: string): Promise<?User>,
  getByUsername(username: string): Promise<?User>,
  getCurrentUser(): User,
  isUserNameInUse(username: string): Promise<boolean>,
  saveAccessToken(userID: string, tokenObject: TokenObject): Promise<User>,
  setCurrentUser(user: User): void,
  validateLogin(username: string, password: string): Promise<User>,
}

export interface IDeviceFirmwareRepository {
  getByName(appName: string): ?Buffer,
}

export interface IBaseDatabase {
  find(collectionName: string, ...args: Array<any>): Promise<*>,
  findAndModify(collectionName: string, ...args: Array<any>): Promise<*>,
  findOne(collectionName: string, ...args: Array<any>): Promise<*>,
  insertOne(collectionName: string, ...args: Array<any>): Promise<*>,
  remove(collectionName: string, query: Object): Promise<*>,
}

export interface ILoggerCreate {
  static createLogger(applicationName: string): bunyan.Logger,
  static createModuleLogger(applicationModule: any): bunyan.Logger,
}
