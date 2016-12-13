// @flow

import type { Device, DeviceRepository } from '../../types';
import type { DeviceAPIType } from '../deviceToAPI';


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
  async getDevices(): Promise<*> {
    try {
      const devices = await this._deviceRepository.getAll();

      return this.ok(devices.map((device: Device): DeviceAPIType =>
        deviceToAPI(device)));
    } catch (exception) {
      // I wish we could return no devices found but meh :/
      return this.ok([]);
    }
  }

  @httpVerb('get')
  @route('/v1/devices/:deviceID')
  async getDevice(deviceID: string): Promise<*> {
    try {
      const device = await this._deviceRepository.getDetailsByID(deviceID);
      return this.ok(deviceToAPI(device));
    } catch (exception) {
      return this.bad(exception);
    }
  }

  @httpVerb('put')
  @route('/v1/devices/:deviceID')
  async updateDevice(
    deviceID: string,
    postBody: { app_id?: string, name?: string },
  ): Promise<*> {
    try {
      // 1 rename device
      if (postBody.name) {
        const updatedAttributes = await this._deviceRepository.renameDevice(
          deviceID,
          postBody.name,
        );

        return this.ok({ name: updatedAttributes.name, ok: true });
      }
      // TODO not implemented yet
      // 2 flash device with known app
      if (postBody.app_id) {
        await this._deviceRepository.flashKnownApp(
          deviceID,
          postBody.app_id,
        );
        return this.ok({ id: deviceID, status: 'Update started' });
      }

      // TODO not implemented yet
      // 3 flash device with precompiled binary
      if (this.request.files) {
        await this._deviceRepository.flashBinary(deviceID, this.request.files);
        return this.ok({ id: deviceID, status: 'Update started' });
      }
    } catch (exception) {
      return this.bad(exception);
    }
  }

  @httpVerb('post')
  @route('/v1/devices/:deviceID/:functionName')
  async callDeviceFunction(
    deviceID: string,
    functionName: string,
    postBody: Object,
  ): Promise<*> {
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
