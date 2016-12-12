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

  getByID = async (deviceID: string): Promise<Device> => {
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
  };

  getDetailsByID = async (deviceID: string): Promise<Device> => {
    const core = this._deviceServer.getCore(deviceID);
    if (!core) {
      throw new Error('Could not get device for ID');
    }

    return Promise.all([
      this._deviceAttributeRepository.getById(deviceID),
      core.onApiMessage(
        deviceID,
        { cmd: 'Describe' },
      ),
    ]).then(([attributes, description]): Device => ({
      ...attributes,
      connected: true,
      functions: description.f,
      lastFlashedAppName: null,
      lastHeard: new Date(),
      variables: description.v,
    }));
  };

  getAll = async (): Promise<Array<Device>> => {
    const devicesAttributes = await this._deviceAttributeRepository.getAll();
    const devicePromises = devicesAttributes.map(async attributes => {
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
    });

    return Promise.all(devicePromises);
  };

  callFunction= async (
    deviceID: string,
    functionName: string,
    functionArguments: Object,
  ): Promise<*> => {
    const core = this._deviceServer.getCore(deviceID);
    if (!core) {
      return null;
    }
    const result = await core.onApiMessage(
      deviceID,
      { cmd: 'CallFn', name: functionName, args: functionArguments },
    );

    if (result.error) {
      throw result.error;
    }

    return result.result;
  };

  flashBinary = async (
    deviceID: string,
    files: string,
  ) => {
    // TODO not implemented yet
    const core = this._deviceServer.getCore(deviceID);
    if (!core) {
      return null;
    }

    const result = await core.onApiMessage(
      deviceID,
      { cmd: 'UFlash', args: { data: files[0].buffer } },
    );

    if (result.error) {
      throw result.error;
    }

    return result.result;
  };

  flashKnownApp = async (
    deviceID: string,
    app: string,
  ) => {
    // TODO not implemented yet
    const core = this._deviceServer.getCore(deviceID);
    if (!core) {
      return null;
    }

    const result = await core.onApiMessage(
      deviceID,
      { cmd: 'FlashKnown', app },
    );

    if (result.error) {
      throw result.error;
    }

    return result.result;
  };

  provision = async (
    deviceID: string,
    userID: string,
    publicKey: string,
  ): Promise<*> => {
    if (!deviceID) {
      throw new Error('No deviceID provided');
    }

    try {
      const createdKey = ursa.createPublicKey(publicKey);
      if (!publicKey || !ursa.isPublicKey(createdKey)) {
        throw new Error('No key provided');
      }
    } catch (exception) {
      logger.error('error while parsing publicKey', exception);
      throw new Error(`Key error ${exception}`);
    }
    this._deviceKeyRepository.update(deviceID, publicKey);
    const existingAttributes = this._deviceAttributeRepository.getById(
      deviceID,
    );
    const attributes = {
      deviceID,
      name: NAME_GENERATOR.choose(),
      ...existingAttributes,
      registrar: userID,
      timestamp: new Date(),
    };
    this._deviceAttributeRepository.update(attributes);

    return await this.getByID(deviceID);
  };

  renameDevice = (deviceID: string, name: string): DeviceAttributes => {
    const attributes = this._deviceAttributeRepository.getById(deviceID);
    const attributesToSave = {
      ...attributes,
      name,
    };
    return this._deviceAttributeRepository.update(attributesToSave);
  }
}

export default DeviceRepository;
