import {EventEmitter} from 'events';

let CONNECTION_COUNTER = 0;

class DeviceConnection {
  _socketId: number;

  constructor() {
    this._socketId = CONNECTION_COUNTER++;
  }

  async getStatus(deviceID: string): Object {
    
  }
}

export default DeviceConnection;
