// @flow

import type { Device, DeviceRepository } from '../types';
import type { ClaimCodeManager } from 'spark-protocol';

import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

class DeviceClaimsController extends Controller {
  _deviceRepository: DeviceRepository;
  _claimCodeManager: ClaimCodeManager;

  constructor(
    deviceRepository: DeviceRepository,
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
