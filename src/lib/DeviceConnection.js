import {EventEmitter} from 'events';

let CONNECTION_COUNTER = 0;

class DeviceConnection {
  _socketId: number;

  constructor() {
    this._socketId = CONNECTION_COUNTER++;
  }

  getDeviceById(coreId: string): Device {
    
  }
}

export default DeviceConnection;
