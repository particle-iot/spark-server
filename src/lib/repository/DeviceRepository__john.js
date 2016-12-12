// @flow

import type { DeviceServer } from 'spark-protocol';
import type { Device, DeviceAttributes, Repository } from '../../types';

import Moniker from 'moniker';
import ursa from 'ursa';
import logger from '../logger';

const NAME_GENERATOR = Moniker.generator([Moniker.adjective, Moniker.noun]);

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

  async getByID(deviceID: string): Promise<Device> {
    const attributes = await this._deviceAttributeRepository.getById(deviceID);
    const core = this._deviceServer.getCore(attributes.deviceID);
    // TODO: Not sure if this should actually be the core ID that gets sent
    // but that's what the old source code does :/
    const response = core
      ? await core.onApiMessage(
        attributes.deviceID,
        { cmd: 'Ping' },
      )
      : {
        connected: false,
        lastPing: null,
      };

    return {
      ...attributes,
      connected: response.connected,
      lastFlashedAppName: null,
      lastHeard: response.lastPing,
    };
  }

  async getAll(): Promise<Array<Device>> {
    const devicesAttributes = await this._deviceAttributeRepository.getAll();
    const devicePromises = devicesAttributes.map(async attributes => {
      const core = this._deviceServer.getCore(attributes.deviceID);
      console.log(attributes);
      // TODO: Not sure if this should actually be the core ID that gets sent
      // but that's what the old source code does :/
      const response = core
        ? await core.onApiMessage(
          attributes.deviceID,
          { cmd: 'Ping' },
        )
        : {
          connected: false,
          lastPing: null,
        };

      return {
        ...attributes,
        connected: response.connected,
        lastFlashedAppName: null,
        lastHeard: response.lastPing,
      };
    });

    return Promise.all(devicePromises);
  }

  async callFunction(
    deviceID: string,
    functionName: string,
    functionArguments: Object,
  ): Promise<*> {
    const core = this._deviceServer.getCore(deviceID);
    if (!core) {
      return null;
    }

    const result = await core.onApiMessage(
      deviceID,
      { cmd:'CallFn', name: functionName, args: functionArguments },
    );

    if (result.error) {
      throw result.error;
    }

    return result.result;
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
    const existingAttributes = this._deviceAttributeRepository.getById(
      deviceID,
    );
    const attributes = {
      name: NAME_GENERATOR.choose(),
      ...existingAttributes,
      registrar: userID,
      timestamp: new Date(),
    };
    this._deviceAttributeRepository.update(attributes);

    return await this.getByID(deviceID);
  }
}

export default DeviceRepository;
