// @flow

import type { DeviceServer } from 'spark-protocol';
import type { Device, DeviceAttributes, Repository } from '../../types';

import ursa from 'ursa';
import logger from '../logger';

class DeviceRepository {
  _deviceAttributeRepository: Repository<DeviceAttributes>;
  _deviceKeyRepository: Repository<string>;
  _deviceServer: DeviceServer;

  constructor(
    deviceAttributeRepository: Repository<DeviceAttributes>,
    deviceKeyRepository: Repository<string>,
    deviceServer: DeviceServer,
  ) {
    this._deviceAttributeRepository = deviceAttributeRepository;
    this._deviceKeyRepository = deviceKeyRepository;
    this._deviceServer = deviceServer;
  }

  async getAll(): Promise<Array<Device>> {
    const deviceAttributes = await this._deviceAttributeRepository.getAll();

    const devicePromises = deviceAttributes.map(async attributes => {
      const core = this._deviceServer.getCore(attributes.coreID);

      // TODO: Not sure if this should actually be the core ID that gets sent
      // but that's what the old source code does :/
      const response = core
        ? await core.onApiMessage(
          attributes.coreID,
          { cmd: 'Ping' },
        )
        : {
          connected: false,
          lastPing: null,
        };

      return {
        ...attributes,
        connected: response.connected,
        lastHeard: response.lastPing,
      };
    });

    return Promise.all(devicePromises);
  }

  async callFunction(
    deviceID: string,
    functionName: string,
    functionArguments: string,
  ): Promise<*> {
    const core = this._deviceServer.getCore(deviceID);
    if (!core) {
      return null;
    }

    const result = await core.onApiMessage(
      deviceID,
      { cmd:'CallFn', name: functionName, args: functionArguments },
    );

    console.log();
    console.log();
    console.log(result);
    console.log();
    console.log();
  }

  async provision(
    deviceID: string,
    userID: string,
    publicKey: string,
  ): Promise<*> {

		if (!deviceID) {
			throw 'No deviceID provided';
		}

		try {
			const createdKey = ursa.createPublicKey(publicKey);
			if (!publicKey || !ursa.isPublicKey(createdKey)) {
        throw 'No key provided';
			}
		} catch (exception) {
			logger.error('error while parsing publicKey', exception);
			throw 'Key error ' + exception;
		}
    this._deviceKeyRepository.update(deviceID, publicKey);
    const attributes = {
      registrar: userID,
      timestamp: new Date(),
    };
    console.log(attributes);
    this._deviceAttributeRepository.update(deviceID, attributes);
  }
}

export default DeviceRepository;
