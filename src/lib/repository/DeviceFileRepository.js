import type {Device} from '../../types';

import FileManager from './FileManager';
import uuid from '../uuid';

class DeviceFileRepository {
  _fileManager: FileManager;

  constructor(path: string) {
    this._fileManager = new FileManager(path);
  }

  create(id: string, model: Device): Device {
    const modelToSave = {
      ...model,
      timestamp: new Date(),
    };

    this._fileManager.createFile(id + '.json', modelToSave);
    return modelToSave;
  }

  update(id: string, model: Device): Device {
    const modelToSave = {
      ...model,
      timestamp: new Date(),
    };

    this._fileManager.writeFile(id + '.json', model);
    return modelToSave;
  }

  delete(id: string): void {
    this._fileManager.deleteFile(id + '.json');
  }

  getAll(): Array<Device> {
    return this._fileManager.getAllData();
  }

  getById(id: string): Device {
    return this._fileManager.getFile(id + '.json');
  }
}

export default WebhookFileRepository;
