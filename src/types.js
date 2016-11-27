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

export type Repository<TModel> = {
  create(model: TModel) => TModel,
  delete(id: string) => void,
  getAll() => Array<TModel>,
  getById(id: string) => TModel,
};
