// @flow

import type { Device, DeviceRepository } from '../types';
import type { DeviceAPIType } from '../lib/deviceToAPI';


import Controller from './Controller';
import HttpError from '../lib/HttpError';
import allowUpload from '../decorators/allowUpload';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';
import deviceToAPI from '../lib/deviceToAPI';

class DeviceClaimsController extends Controller {
  _deviceRepository: DeviceRepository;

  constructor(deviceRepository: DeviceRepository) {
    super();
    this._deviceRepository = deviceRepository;
  }

  @httpVerb('post')
  @route('/v1/device_claims')
  async claimDevice(postBody: { id: string }): Promise<*> {
    const claimCode = await this._deviceRepository.generateClaimCode(
      this.user.id,
    );
    const devices = await this._deviceRepository.getAll(this.user.id);
    const deviceIDs = devices.map(
      device => device.deviceID,
    );
    return this.ok({claim_code: claimCode, device_ids: deviceIDs});
  }
}

export default DeviceClaimsController;
