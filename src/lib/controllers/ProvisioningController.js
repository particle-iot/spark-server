// @flow

import type { DeviceRepository } from '../../types';

import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';
import deviceToAPI from '../deviceToAPI';

class ProvisioningController extends Controller {
  _deviceRepository: DeviceRepository;

  constructor(deviceRepository: DeviceRepository) {
    super();

    this._deviceRepository = deviceRepository;
  }

  @httpVerb('post')
  @route('/v1/provisioning/:coreID')
  async provision(
    coreID: string,
    postBody: { publicKey: string },
  ): Promise<*> {
    const device = await this._deviceRepository.provision(
      coreID,
      this.user.id,
      postBody.publicKey,
    );

    return this.ok(deviceToAPI(device));
  }
}

export default ProvisioningController;
