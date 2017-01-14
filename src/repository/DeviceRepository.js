// @flow

import type { File } from 'express';
import type { DeviceServer } from 'spark-protocol';
import type {
  Device,
  DeviceAttributeRepository,
  DeviceAttributes,
  Repository,
} from '../types';
import type DeviceFirmwareRepository from './DeviceFirmwareFileRepository';

import fs from 'fs';
import Moniker from 'moniker';
import ursa from 'ursa';
import HttpError from '../lib/HttpError';
import FirmwareManager from '../managers/FirmwareManager';
import settings from '../settings';

const NAME_GENERATOR = Moniker.generator([Moniker.adjective, Moniker.noun]);

class DeviceRepository {
  _deviceAttributeRepository: DeviceAttributeRepository;
  _deviceFirmwareRepository: DeviceFirmwareRepository;
  _deviceKeyRepository: Repository<string>;
  _deviceServer: DeviceServer;

  constructor(
    deviceAttributeRepository: DeviceAttributeRepository,
    deviceFirmwareRepository: DeviceFirmwareRepository,
    deviceKeyRepository: Repository<string>,
    deviceServer: DeviceServer,
  ) {
    this._deviceAttributeRepository = deviceAttributeRepository;
    this._deviceFirmwareRepository = deviceFirmwareRepository;
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

    const device = this._deviceServer.getDevice(attributes.deviceID);

    const pingResponse = device
      ? device.ping()
      : {
        connected: false,
        lastPing: null,
      };

    return {
      ...attributes,
      connected: pingResponse.connected,
      lastFlashedAppName: null,
      lastHeard: pingResponse.lastPing,
    };
  };

  getDetailsByID = async (deviceID: string, userID: string): Promise<Device> => {
    const device = this._deviceServer.getDevice(deviceID);
    if (!device) {
      throw new HttpError('No device found', 404);
    }

    const [attributes, description] = await Promise.all([
      this._deviceAttributeRepository.getById(deviceID, userID),
      device.getDescription(),
    ]);

    if (!attributes) {
      throw new HttpError('No device found', 404);
    }

    return ({
      ...attributes,
      connected: true,
      functions: description.state.f,
      lastFlashedAppName: null,
      lastHeard: new Date(),
      variables: description.state.v,
    });
  };

  getAll = async (userID: string): Promise<Array<Device>> => {
    const devicesAttributes =
      await this._deviceAttributeRepository.getAll(userID);
    const devicePromises = devicesAttributes.map(async attributes => {
      const device = this._deviceServer.getDevice(attributes.deviceID);

      const pingResponse = device
        ? device.ping()
        : {
          connected: false,
          lastPing: null,
        };

      return {
        ...attributes,
        connected: pingResponse.connected,
        lastFlashedAppName: null,
        lastHeard: pingResponse.lastPing,
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
    if (await !this._deviceAttributeRepository.doesUserHaveAccess(deviceID, userID)) {
      throw new HttpError('No device found', 404);
    }

    const device = this._deviceServer.getDevice(deviceID);
    if (!device) {
      throw new HttpError('Could not get device for ID', 404);
    }

    return await device.callFunction(
      functionName,
      functionArguments,
    );
  };

  getVariableValue = async (
    deviceID: string,
    userID: string,
    varName: string,
  ): Promise<*> => {
    if (!await this._deviceAttributeRepository.doesUserHaveAccess(deviceID, userID)) {
      throw new HttpError('No device found', 404);
    }

    const device = this._deviceServer.getDevice(deviceID);
    if (!device) {
      throw new HttpError('Could not get device for ID', 404);
    }

    return await device.getVariableValue(varName);
  };

  flashBinary = async (
    deviceID: string,
    file: File,
  ) => {
    const device = this._deviceServer.getDevice(deviceID);
    if (!device) {
      throw new HttpError('Could not get device for ID', 404);
    }

    // TODO make FirmwareManager stateless
    const firmwareManager = new FirmwareManager(device.getSystemInformation());
    const otaUpdateConfig = null;// firmwareManager.getOtaUpdateConfig();

    console.log(otaUpdateConfig);

    if (otaUpdateConfig) {
      // TODO use a repository instead of just fetching from disk
      for (var i = 0; i < otaUpdateConfig.length; i++) {
        const config = otaUpdateConfig[i];
        const systemFile = fs.readFileSync(
          settings.BINARIES_DIRECTORY + '/' + config.binaryFileName,
        );
        console.log('FLASHING', systemFile.length, config.binaryFileName)
        await device.flash(systemFile, config.address);
        await new Promise(resolve => setTimeout(() => resolve(), 15000));
      };
    }
    return await device.flash(file.buffer);
  };

  flashKnownApp = async (
    deviceID: string,
    userID: string,
    appName: string,
  ) => {
    if (await !this._deviceAttributeRepository.doesUserHaveAccess(
      deviceID,
      userID,
    )) {
      throw new HttpError('No device found', 404);
    }

    const knownFirmware = this._deviceFirmwareRepository.getByName(appName);

    if (!knownFirmware) {
      throw new HttpError(`No firmware ${appName} found`);
    }

    const device = this._deviceServer.getDevice(deviceID);
    if (!device) {
      throw new HttpError('Could not get device for ID', 404);
    }

    return await device.flash(knownFirmware);
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

  raiseYourHand = async (
    deviceID: string,
    userID: string,
    shouldShowSignal: boolean,
  ): Promise<void> => {
    if (await !this._deviceAttributeRepository.doesUserHaveAccess(
      deviceID,
      userID,
    )) {
      throw new HttpError('No device found', 404);
    }

    const device = this._deviceServer.getDevice(deviceID);
    if (!device) {
      throw new HttpError('Could not get device for ID', 404);
    }

    return await device.raiseYourHand(shouldShowSignal);
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
