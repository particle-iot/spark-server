// @flow

import type { Device, DeviceManager } from '../types';
import type { ClaimCodeManager } from 'spark-protocol';

import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

class DeviceClaimsController extends Controller {
  _deviceRepository: DeviceManager;
  _claimCodeManager: ClaimCodeManager;

  constructor(
    deviceRepository: DeviceManager,
    claimCodeManager: ClaimCodeManager,
  ) {
    super();

    this._deviceRepository = deviceRepository;
    this._claimCodeManager = claimCodeManager;
  }

  @httpVerb('post')
  @route('/v1/device_claims')
  async createClaimCode(): Promise<*> {
    const claimCode = this._claimCodeManager.createClaimCode(
      this.user.id,
    );

    const devices = await this._deviceRepository.getAll(this.user.id);
    const deviceIDs = devices.map(
      (device: Device): string => device.deviceID,
    );
    return this.ok({ claim_code: claimCode, device_ids: deviceIDs });
  }
}

export default DeviceClaimsController;
