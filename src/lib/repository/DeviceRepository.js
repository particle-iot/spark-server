// @flow

import type { File } from 'express';
import type { DeviceServer } from 'spark-protocol';
import type { Device, DeviceAttributes, Repository } from '../../types';

import Moniker from 'moniker';
import ursa from 'ursa';
import logger from '../logger';
import HttpError from '../HttpError';

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

  claimDevice = async (
    deviceID: string,
    userID: string,
  ): Promise<DeviceAttributes> => {
    const deviceAttributes = await this._deviceAttributeRepository.getById(deviceID);

    if (!deviceAttributes) {
      throw new HttpError('No device found', 404);
    }
    if (deviceAttributes.ownerID && deviceAttributes.ownerID !== userID) {
      throw new HttpError('The device belongs to someone else.');
    }

    const attributesToSave = {
      ...deviceAttributes,
      ownerID: userID,
    };
    return await this._deviceAttributeRepository.update(attributesToSave);
  };

  unclaimDevice = async (
    deviceID: string,
    userID: string,
  ): Promise<DeviceAttributes> => {
    const deviceAttributes =
      await this._deviceAttributeRepository.getById(deviceID, userID);

    if (!deviceAttributes) {
      throw new HttpError('No device found', 404);
    }

    const attributesToSave = {
      ...deviceAttributes,
      ownerID: null,
    };
    return await this._deviceAttributeRepository.update(attributesToSave);
  };

  getByID = async (deviceID: string, userID: string): Promise<Device> => {
    const attributes = await this._deviceAttributeRepository.getById(
      deviceID,
      userID,
    );
    if (!attributes) {
      throw new HttpError('No device found', 404);
    }

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

  getDetailsByID = async (deviceID: string, userID: string): Promise<Device> => {
    const core = this._deviceServer.getCore(deviceID);
    if (!core) {
      throw new HttpError('No device found', 404);
    }

    const [ attributes, description ] = await Promise.all([
      this._deviceAttributeRepository.getById(deviceID, userID),
      core.onApiMessage(
        deviceID,
        { cmd: 'Describe' },
      ),
    ]);

    if (!attributes) {
      throw new HttpError('No device found', 404);
    }

    return ({
      ...attributes,
      connected: true,
      functions: description.f,
      lastFlashedAppName: null,
      lastHeard: new Date(),
      variables: description.v,
    });
  };

  getAll = async (userID: string): Promise<Array<Device>> => {
    const devicesAttributes = await this._deviceAttributeRepository.getAll(userID);
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

  callFunction = async (
    deviceID: string,
    userID: string,
    functionName: string,
    functionArguments: Object,
  ): Promise<*> => {
    if (!this._deviceAttributeRepository.doesUserHaveAccess(deviceID, userID)) {
      throw new HttpError('No device found', 404);
    }

    const core = this._deviceServer.getCore(deviceID);
    if (!core) {
      throw new HttpError('Could not get device for ID', 404);
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
    file: File,
  ) => {
    const core = this._deviceServer.getCore(deviceID);
    if (!core) {
      throw new HttpError('Could not get device for ID', 404);
    }

    const result = await core.onApiMessage(
      deviceID,
      { cmd: 'UFlash', args: { data: file.buffer } },
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
      throw new HttpError('Could not get device for ID', 404);
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
    try {
      const createdKey = ursa.createPublicKey(publicKey);
      if (!ursa.isPublicKey(createdKey)) {
        throw new HttpError('Not a public key');
      }
    } catch (error) {
      throw new HttpError(`Key error ${error}`);
    }

    await this._deviceKeyRepository.update(deviceID, publicKey);
    const existingAttributes = await this._deviceAttributeRepository.getById(
      deviceID,
    );
    const attributes = {
      deviceID,
      name: NAME_GENERATOR.choose(),
      ...existingAttributes,
      ownerID: userID,
      registrar: userID,
      timestamp: new Date(),
    };
    await this._deviceAttributeRepository.update(attributes);

    return await this.getByID(deviceID, userID);
  };

  renameDevice = async (
    deviceID: string,
    userID: string,
    name: string,
  ): Promise<DeviceAttributes> => {
    const attributes = await this._deviceAttributeRepository.getById(deviceID, userID);

    if (!attributes) {
      throw new HttpError('No device found', 404);
    }

    const attributesToSave = {
      ...attributes,
      name,
    };
    return await this._deviceAttributeRepository.update(attributesToSave);
  }
}

export default DeviceRepository;
