// @flow

import type { Webhook } from '../../types';

import { JSONFileManager, uuid } from 'spark-protocol';
import HttpError from '../HttpError';

class WebhookFileRepository {
  _fileManager: JSONFileManager;

  constructor(path: string) {
    this._fileManager = new JSONFileManager(path);
  }

  create = async (model: Webhook): Promise<Webhook> => {
    const modelToSave = {
      ...model,
      created_at: new Date(),
      id: uuid(),
    };

    this._fileManager.createFile(`${modelToSave.id}.json`, modelToSave);
    return modelToSave;
  };

  deleteById = async (id: string): Promise<void> =>
    this._fileManager.deleteFile(`${id}.json`);

  getAll = async (): Promise<Array<Webhook>> =>
    this._fileManager.getAllData();

  getById = async (id: string): Promise<?Webhook> =>
    this._fileManager.getFile(`${id}.json`);

  update = (model: Webhook): Promise<Webhook> => {
    throw new HttpError('Not implemented');
  };
}

export default WebhookFileRepository;
