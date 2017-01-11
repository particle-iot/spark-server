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

  getAll = async (userID: ?string = null): Promise<Array<Webhook>> => {
    const allData = this._fileManager.getAllData();

    if (userID) {
      return Promise.resolve(
        allData.filter(
          (webhook: Webhook): boolean =>
          webhook.ownerID === userID,
        ),
      );
    }
    return allData;
  };

  getById = async (
    id: string,
    userID: ?string = null,
  ): Promise<?Webhook> => {
    const webhook = this._fileManager.getFile(`${id}.json`);
    if (
      !webhook ||
      webhook.ownerID !== userID
    ) {
      return null;
    }
    return webhook;
  };

  update = async (model: WebhookMutator): Promise<Webhook> => {
    throw new HttpError('Not implemented');
  };
}

export default WebhookFileRepository;
