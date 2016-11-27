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

export type Device = {
  deviceId: string,
  ip: string,
  particleProductId: number,
  productFirmwareVersion: number,
  registrar: string,
  timestamp: Date,
};

export type Repository<TModel> = {
  create: (id: string, model: TModel) => TModel,
  delete: (id: string) => void,
  getAll: () => Array<TModel>,
  getById: (id: string) => TModel,
  update: (id: string, model: TModel) => TModel,
};
