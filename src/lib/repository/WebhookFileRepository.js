// @flow

import type { Webhook } from '../../types';

import { JSONFileManager, uuid } from 'spark-protocol';
import HttpError from '../HttpError';

class WebhookFileRepository {
  _fileManager: JSONFileManager;

  constructor(path: string) {
    this._fileManager = new JSONFileManager(path);
  }

  create = (model: Webhook): Webhook => {
    const modelToSave = {
      ...model,
      created_at: new Date(),
      id: uuid(),
    };

    this._fileManager.createFile(`${modelToSave.id}.json`, modelToSave);
    return modelToSave;
  };

  deleteById = (id: string): void =>
    this._fileManager.deleteFile(`${id}.json`);

  getAll = (): Array<Webhook> =>
    this._fileManager.getAllData();

  getById = (id: string): Webhook =>
    this._fileManager.getFile(`${id}.json`);

  update = (model: Webhook): Webhook => {
    throw new HttpError('Not implemented');
  };
}

export default WebhookFileRepository;
