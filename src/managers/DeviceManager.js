// @flow

import type { File } from 'express';
import type { DeviceServer } from 'spark-protocol';
import type PermissionManager from './PermissionManager';
import type {
  Device,
  DeviceAttributes,
  IDeviceKeyRepository,
  IDeviceAttributeRepository,
  IDeviceFirmwareRepository,
} from '../types';

import ursa from 'ursa';
import HttpError from '../lib/HttpError';

class DeviceManager {
  _deviceAttributeRepository: IDeviceAttributeRepository;
  _deviceFirmwareRepository: IDeviceFirmwareRepository;
  _deviceKeyRepository: IDeviceKeyRepository;
  _deviceServer: DeviceServer;
  _permissionManager: PermissionManager;

  constructor(
    deviceAttributeRepository: IDeviceAttributeRepository,
    deviceFirmwareRepository: IDeviceFirmwareRepository,
    deviceKeyRepository: IDeviceKeyRepository,
    deviceServer: DeviceServer,
    permissionManager: PermissionManager,
  ) {
    this._deviceAttributeRepository = deviceAttributeRepository;
    this._deviceFirmwareRepository = deviceFirmwareRepository;
    this._deviceKeyRepository = deviceKeyRepository;
    this._deviceServer = deviceServer;
    this._permissionManager = permissionManager;
  }

  claimDevice = async (
    deviceID: string,
    userID: string,
  ): Promise<DeviceAttributes> => {
    const deviceAttributes =
      await this._deviceAttributeRepository.getByID(deviceID);

    if (!deviceAttributes) {
      throw new HttpError('No device found', 404);
    }
    if (deviceAttributes.ownerID && deviceAttributes.ownerID !== userID) {
      throw new HttpError('The device belongs to someone else.');
    }

    if (deviceAttributes.ownerID && deviceAttributes.ownerID === userID) {
      throw new HttpError('The device is already claimed.');
    }

    const attributesToSave = {
      ...deviceAttributes,
      ownerID: userID,
    };
    return await this._deviceAttributeRepository.update(attributesToSave);
  };

  unclaimDevice = async (deviceID: string): Promise<DeviceAttributes> => {
    const deviceAttributes =
      await this._permissionManager.getEntityByID('deviceAttributes', deviceID);

    if (!deviceAttributes) {
      throw new HttpError('No device found', 404);
    }

    const attributesToSave = {
      ...deviceAttributes,
      ownerID: null,
    };
    return await this._deviceAttributeRepository.update(attributesToSave);
  };

  getByID = async (deviceID: string): Promise<Device> => {
    const attributes = await this._permissionManager.getEntityByID(
      'deviceAttributes',
      deviceID,
    );

    if (!attributes) {
      throw new HttpError('No device found', 404);
    }

    const device = this._deviceServer.getDevice(attributes.deviceID);

    return {
      ...attributes,
      connected: device && device.ping().connected || false,
      lastFlashedAppName: null,
      lastHeard: device && device.ping().lastPing || attributes.lastHeard,
    };
  };

  getDetailsByID = async (deviceID: string): Promise<Device> => {
    const device = this._deviceServer.getDevice(deviceID);

    const [attributes, description] = await Promise.all([
      this._permissionManager.getEntityByID('deviceAttributes', deviceID),
      device && device.getDescription(),
    ]);

    if (!attributes) {
      throw new HttpError('No device found', 404);
    }

    return {
      ...attributes,
      connected: device && device.ping().connected || false,
      functions: description ? description.state.f : null,
      lastFlashedAppName: null,
      lastHeard: device && device.ping().lastPing || attributes.lastHeard,
      variables: description ? description.state.v : null,
    };
  };

  getAll = async (): Promise<Array<Device>> => {
    const devicesAttributes =
      await this._permissionManager.getAllEntitiesForCurrentUser('deviceAttributes');

    const devicePromises = devicesAttributes.map(
      async (attributes: DeviceAttributes): Promise<Object> => {
        const device = this._deviceServer.getDevice(attributes.deviceID);

        return {
          ...attributes,
          connected: device && device.ping().connected || false,
          lastFlashedAppName: null,
          lastHeard: device && device.ping().lastPing || attributes.lastHeard,
        };
      },
    );

    return Promise.all(devicePromises);
  };

  callFunction = async (
    deviceID: string,
    functionName: string,
    functionArguments: {[key: string]: string},
  ): Promise<*> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );

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
    varName: string,
  ): Promise<*> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );

    const device = this._deviceServer.getDevice(deviceID);
    if (!device) {
      throw new HttpError('Could not get device for ID', 404);
    }

    return await device.getVariableValue(varName);
  };

  flashBinary = async (
    deviceID: string,
    file: File,
  ): Promise<string> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );

    const device = this._deviceServer.getDevice(deviceID);
    if (!device) {
      throw new HttpError('Could not get device for ID', 404);
    }

    return await device.flash(file.buffer);
  };

  flashKnownApp = async (
    deviceID: string,
    appName: string,
  ): Promise<string> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );

    const knownFirmware = this._deviceFirmwareRepository.getByName(appName);

    if (!knownFirmware) {
      throw new HttpError(`No firmware ${appName} found`, 404);
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
    algorithm: 'ecc' | 'rsa',
  ): Promise<*> => {
    if (algorithm === 'ecc') {
      return null;
    }

    try {
      const createdKey = ursa.createPublicKey(publicKey);
      if (!ursa.isPublicKey(createdKey)) {
        throw new HttpError('Not a public key');
      }
    } catch (error) {
      throw new HttpError(`Key error ${error}`);
    }

    await this._deviceKeyRepository.update({ deviceID, key: publicKey });
    const existingAttributes = await this._deviceAttributeRepository.getByID(
      deviceID,
    );
    const attributes = {
      deviceID,
      ...existingAttributes,
      ownerID: userID,
      registrar: userID,
      timestamp: new Date(),
    };
    await this._deviceAttributeRepository.update(attributes);

    return await this.getByID(deviceID);
  };

  raiseYourHand = async (
    deviceID: string,
    shouldShowSignal: boolean,
  ): Promise<void> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );

    const device = this._deviceServer.getDevice(deviceID);
    if (!device) {
      throw new HttpError('Could not get device for ID', 404);
    }

    return await device.raiseYourHand(shouldShowSignal);
  };

  renameDevice = async (
    deviceID: string,
    name: string,
  ): Promise<DeviceAttributes> => {
    const attributes = await this._permissionManager.getEntityByID(
      'deviceAttributes',
      deviceID,
    );

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

export default DeviceManager;
