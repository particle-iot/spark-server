// @flow

import type { Device, DeviceRepository } from '../../types';

import settings from '../../settings';
import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';
import deviceToAPI from '../deviceToAPI';

class DevicesController extends Controller {
  _deviceRepository: DeviceRepository;

  constructor(deviceRepository: DeviceRepository) {
    super();

    this._deviceRepository = deviceRepository;
  }

  @httpVerb('get')
  @route('/v1/devices')
  async getDevices() {
    try {
      const devices = await this._deviceRepository.getAll();

      return this.ok(devices.map(device => deviceToAPI(device)));
    } catch (exception) {
      // I wish we could return no devices found but meh :/
      return this.ok([]);
    }
  }

  @httpVerb('post')
  @route('/v1/devices/:deviceID/:functionName')
  async callDeviceFunction(
    deviceID: string,
    functionName: string,
    postBody: Object,
  ) {
    try {
      const result = await this._deviceRepository.callFunction(
        deviceID,
        functionName,
        postBody,
      );

      const device = await this._deviceRepository.getByID(deviceID);
      return this.ok(deviceToAPI(device, result));
    } catch (exception) {
      if (exception.indexOf('Unknown Function') >= 0) {
        return this.bad(
          'Function not found',
          404,
        );
      }

      return this.bad(exception);
    }
  }
}

export default DevicesController;
