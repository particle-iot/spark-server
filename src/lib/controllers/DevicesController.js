// @flow

import type { Device, DeviceRepository } from '../../types';
import type { DeviceAPIType } from '../deviceToAPI';


import Controller from './Controller';
import HttpError from '../HttpError';
import allowUpload from '../decorators/allowUpload';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';
import deviceToAPI from '../deviceToAPI';

class DevicesController extends Controller {
  _deviceRepository: DeviceRepository;

  constructor(deviceRepository: DeviceRepository) {
    super();

    this._deviceRepository = deviceRepository;
  }

  @httpVerb('post')
  @route('/v1/devices')
  async claimDevice(postBody: { id: string }): Promise<*> {
    const deviceID = postBody.id;
    await this._deviceRepository.claimDevice(deviceID, this.user.id);

    return this.ok({ ok: true });
  }

  @httpVerb('post')
  @route('/v1/binaries')
  compileSources() {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('delete')
  @route('/v1/devices/:deviceID')
  async unclaimDevice(deviceID: string): Promise<*> {
    await this._deviceRepository.unclaimDevice(deviceID, this.user.id);
    return this.ok({ ok: true });
  }

  @httpVerb('get')
  @route('/v1/devices')
  async getDevices(): Promise<*> {
    try {
      const devices = await this._deviceRepository.getAll(this.user.id);
      return this.ok(devices.map((device: Device): DeviceAPIType =>
        deviceToAPI(device)),
      );
    } catch (error) {
      // I wish we could return no devices found but meh :/
      return this.ok([]);
    }
  }

  @httpVerb('get')
  @route('/v1/devices/:deviceID')
  async getDevice(deviceID: string): Promise<*> {
    const device = await this._deviceRepository.getDetailsByID(
      deviceID,
      this.user.id,
    );
    return this.ok(deviceToAPI(device));
  }

  @httpVerb('get')
  @route('/v1/devices/:deviceID/:varName/')
  async getVariableValue(
    deviceID: string,
    varName: string,
  ): Promise<*> {
    try {
      const varValue = await this._deviceRepository.getVariableValue(
        deviceID,
        this.user.id,
        varName,
      );

      return this.ok({ result: varValue });
    } catch (error) {
      if (error.indexOf && error.indexOf('Variable not found') >= 0) {
        throw new HttpError('Variable not found', 404);
      }
      throw error;
    }
  }

  @httpVerb('put')
  @route('/v1/devices/:deviceID')
  @allowUpload('file', 1)
  async updateDevice(
    deviceID: string,
    postBody: { app_id?: string, name?: string, file_type?: 'binary' },
  ): Promise<*> {
    // 1 rename device
    if (postBody.name) {
      const updatedAttributes = await this._deviceRepository.renameDevice(
        deviceID,
        this.user.id,
        postBody.name,
      );

      return this.ok({ name: updatedAttributes.name, ok: true });
    }
    // TODO not implemented yet
    // 2 flash device with known app
    try {
      if (postBody.app_id) {
        this._deviceRepository.flashKnownApp(
          deviceID,
          postBody.app_id,
        );
        return this.ok({ id: deviceID, status: 'Update started' });
      }

      const file = this.request.files.file[0];
      if (file && file.originalname.endsWith('.bin')) {
        await this._deviceRepository.flashBinary(deviceID, file);
        return this.ok({ id: deviceID, status: 'Update started' });
      }
    } catch (error) {
      throw new HttpError(error.message);
    }

    throw new HttpError('Did not update device');
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
        this.user.id,
        functionName,
        postBody,
      );

      const device = await this._deviceRepository.getByID(
        deviceID,
        this.user.id,
      );
      return this.ok(deviceToAPI(device, result));
    } catch (error) {
      if (error.indexOf && error.indexOf('Unknown Function') >= 0) {
        throw new HttpError('Function not found', 404);
      }
      throw new HttpError(error.message);
    }
  }
}

export default DevicesController;
