// @flow

import type { Webhook, WebhookMutator } from '../types';

import uuid from 'uuid';
import { JSONFileManager } from 'spark-protocol';
import HttpError from '../lib/HttpError';

class WebhookFileRepository {
  _fileManager: JSONFileManager;

  constructor(path: string) {
    this._fileManager = new JSONFileManager(path);
  }

  create = async (model: WebhookMutator): Promise<Webhook> => {
    let id = uuid();
    while (await this.getById(id)) {
      id = uuid();
    }

    const modelToSave = {
      ...model,
      created_at: new Date(),
      id,
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

  update = async (model: WebhookMutator): Promise<Webhook> => {
    throw new HttpError('Not implemented');
  };
}

export default WebhookFileRepository;
