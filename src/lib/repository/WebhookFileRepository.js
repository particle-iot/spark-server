// @flow

import type { Webhook } from '../../types';

import { JSONFileManager, uuid } from 'spark-protocol';
import HttpError from '../HttpError';

class WebhookFileRepository {
  _fileManager: JSONFileManager;

  constructor(path: string) {
    this._fileManager = new JSONFileManager(path);
  }

  create = (model: Webhook): Promise<Webhook> => {
    const modelToSave = {
      ...model,
      created_at: new Date(),
      id: uuid(),
    };

    this._fileManager.createFile(`${modelToSave.id}.json`, modelToSave);
    return Promise.resolve(modelToSave);
  };

  deleteById = async (id: string): Promise<void> =>
    this._fileManager.deleteFile(`${id}.json`);

  getAll = (): Promise<Array<Webhook>> =>
    Promise.resolve(this._fileManager.getAllData());

  getById = (id: string): Promise<?Webhook> =>
    Promise.resolve(this._fileManager.getFile(`${id}.json`));

  update = (model: Webhook): Promise<Webhook> => {
    throw new HttpError('Not implemented');
  };
}

export default WebhookFileRepository;
