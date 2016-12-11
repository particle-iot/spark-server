// @flow

import type { Device, DeviceRepository } from '../../types';

import settings from '../../settings';
import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

type APIType = {|
  connected: boolean,
  id: string,
  last_app: ?string,
  last_heard: ?Date,
  name: string;
|};
const toAPI = (device: Device): APIType => ({
  connected: device.connected,
  id: device.coreID,
  last_app: device.lastFlashedAppName,
  last_heard: device.lastHeard,
  name: device.name,
});

class DevicesController extends Controller {
  _deviceRepository: DeviceRepository;

  constructor(deviceRepository: DeviceRepository) {
    super();

    this._deviceRepository = deviceRepository;
  }

  @httpVerb('get')
  @route('/v1/devices')
  async get() {
    try {
      const devices = await this._deviceRepository.getAll();

      return this.ok(devices.map(device => toAPI(device)));
    } catch (exception) {
      // I wish we could return no devices found but meh :/
      return this.ok([]);
    }
  }
}

export default DevicesController;
