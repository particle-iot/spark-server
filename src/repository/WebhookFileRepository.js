// @flow

import type { IWebhookRepository, Webhook, WebhookMutator } from '../types';

import uuid from 'uuid';
import { JSONFileManager, memoizeGet, memoizeSet } from 'spark-protocol';
import HttpError from '../lib/HttpError';

class WebhookFileRepository implements IWebhookRepository {
  _fileManager: JSONFileManager;

  constructor(path: string) {
    this._fileManager = new JSONFileManager(path);
  }

  count = async (): Promise<number> => this._fileManager.count();

  @memoizeSet()
  async create(model: WebhookMutator): Promise<Webhook> {
    let id = uuid();
    while (await this._fileManager.hasFile(`${id}.json`)) {
      id = uuid();
    }

    const modelToSave = {
      ...model,
      created_at: new Date(),
      id,
    };

    this._fileManager.createFile(`${modelToSave.id}.json`, modelToSave);
    return modelToSave;
  }

  @memoizeSet(['id'])
  async deleteByID(id: string): Promise<void> {
    this._fileManager.deleteFile(`${id}.json`);
  }

  getAll = async (userID: ?string = null): Promise<Array<Webhook>> => {
    const allData = await this._getAll();

    if (userID) {
      return allData.filter(
        (webhook: Webhook): boolean => webhook.ownerID === userID,
      );
    }
    return allData;
  };

  @memoizeGet(['id'])
  async getByID(id: string): Promise<?Webhook> {
    return this._fileManager.getFile(`${id}.json`);
  }

  // eslint-disable-next-line no-unused-vars
  updateByID = async (): Promise<Webhook> => {
    throw new HttpError('Not implemented');
  };

  @memoizeGet()
  async _getAll(): Promise<Array<Webhook>> {
    return this._fileManager.getAllData();
  }
}

export default WebhookFileRepository;
