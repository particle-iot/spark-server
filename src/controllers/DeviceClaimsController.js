// @flow

import type {
  Device,
  DeviceRepository,
  UserRepository,
} from '../types';

import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

class DeviceClaimsController extends Controller {
  _deviceRepository: DeviceRepository;
  _userRepository: UserRepository;


  constructor(
    deviceRepository: DeviceRepository,
    userRepository: UserRepository,
  ) {
    super();

    this._deviceRepository = deviceRepository;
    this._userRepository = userRepository;
  }

  @httpVerb('post')
  @route('/v1/device_claims')
  async generateClaimCode(): Promise<*> {
    const claimCode = await this._deviceRepository.generateClaimCode(
      this.user.id,
    );

    await this._userRepository.addClaimCode(this.user.id, claimCode);
    const devices = await this._deviceRepository.getAll(this.user.id);
    const deviceIDs = devices.map(
      (device: Device): string => device.deviceID,
    );
    return this.ok({ claim_code: claimCode, device_ids: deviceIDs });
  }
}

export default DeviceClaimsController;
