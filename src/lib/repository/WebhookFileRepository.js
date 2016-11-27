import type {Webhook} from '../../types';

import FileRepositoryBase from './FileRepositoryBase';
import uuid from '../uuid';

class WebhookFileRepository extends FileRepositoryBase {
  create(model: Webhook): Webhook {
    const modelToSave = {
      ...model,
      created_at: new Date(),
      id: uuid(),
    };

    this.createFile(modelToSave.id + '.json', modelToSave);
    return modelToSave;
  }

  delete(id: string): void {
    this.deleteFile(id + '.json');
  }

  getAll(): Array<Webhook> {
    return this.getAllData();
  }

  getById(id: string): Webhook {
    return this.getFile(id + '.json');
  }
}

export default WebhookFileRepository;
