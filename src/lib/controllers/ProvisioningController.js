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
    try {
      const device = await this._deviceRepository.provision(
        coreID,
        this.user.id,
        postBody.publicKey,
      );

      return this.ok(deviceToAPI(device));
    } catch (exception) {
      // I wish we could return no devices found but meh :/
      return this.ok([]);
    }
  }
}

export default ProvisioningController;
