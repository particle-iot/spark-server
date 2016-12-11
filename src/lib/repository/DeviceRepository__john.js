// @flow

import type { DeviceServer } from 'spark-protocol';
import type { Device, DeviceAttributes, Repository } from '../../types';

class DeviceRepository {
  _deviceAttributeRepository: Repository<DeviceAttributes>;
  _deviceServer: DeviceServer;

  constructor(
    deviceAttributeRepository: Repository<DeviceAttributes>,
    deviceServer: DeviceServer,
  ) {
    this._deviceAttributeRepository = deviceAttributeRepository;
    this._deviceServer = deviceServer;
  }

  async getAll(): Promise<Array<Device>> {
    const deviceAttributes = await this._deviceAttributeRepository.getAll();

    const devicePromises = deviceAttributes.map(async attributes => {
      const core = this._deviceServer.getCore(attributes.coreID);

      // TODO: Not sure if this should actually be the core ID that gets sent
      // but that's what the old source code does :/
      const response = core
        ? await core.onApiMessage(
          attributes.coreID,
          { cmd: 'Ping' },
        )
        : {
          connected: false,
          lastPing: null,
        };

      return {
        ...attributes,
        connected: response.connected,
        lastHeard: response.lastPing,
      };
    });

    return Promise.all(devicePromises);
  }
}

export default DeviceRepository;
