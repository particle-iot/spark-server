import type {Webhook} from '../../types';

import FileRepositoryBase from './FileRepositoryBase';
import uuid from '../uuid';

class WebhookFileRepository extends FileRepositoryBase {
  create(model: Webhook): Webhook {
    const modelToSave = {
      ...model,
      created_at: new Date(),
      // TODO: Add another repository for fetching users. This should be
      // injected on every request so we can easily get the current user
      created_by: null, // user id
      id: uuid(),
    };

    this.__createFile(modelToSave.id + '.json', modelToSave);
    return modelToSave;
  }

  delete(id: string): void {
    this.__deleteFile(id + '.json');
  }

  getAll(): Array<Webhook> {
    return this.__getAllData();
  }

  getById(id: string): Webhook {
    return this.__getFile(id + '.json');
  }
}

export default WebhookFileRepository;
