// @flow

import type { File } from 'express';
import type { EventPublisher } from 'spark-protocol';
import type PermissionManager from './PermissionManager';
import type {
  Device,
  DeviceAttributes,
  IDeviceKeyRepository,
  IDeviceAttributeRepository,
  IDeviceFirmwareRepository,
} from '../types';

import { SPARK_SERVER_EVENTS } from 'spark-protocol';
import NodeRSA from 'node-rsa';
import HttpError from '../lib/HttpError';

class DeviceManager {
  _deviceAttributeRepository: IDeviceAttributeRepository;
  _deviceFirmwareRepository: IDeviceFirmwareRepository;
  _deviceKeyRepository: IDeviceKeyRepository;
  _permissionManager: PermissionManager;
  _eventPublisher: EventPublisher;

  constructor(
    deviceAttributeRepository: IDeviceAttributeRepository,
    deviceFirmwareRepository: IDeviceFirmwareRepository,
    deviceKeyRepository: IDeviceKeyRepository,
    permissionManager: PermissionManager,
    eventPublisher: EventPublisher,
  ) {
    this._deviceAttributeRepository = deviceAttributeRepository;
    this._deviceFirmwareRepository = deviceFirmwareRepository;
    this._deviceKeyRepository = deviceKeyRepository;
    this._permissionManager = permissionManager;
    this._eventPublisher = eventPublisher;
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

    const pingResponse = await this._eventPublisher.publishAndListenForResponse({
      context: { deviceID },
      name: SPARK_SERVER_EVENTS.PING_DEVICE,
    });

    return {
      ...attributes,
      connected: pingResponse.connected || false,
      lastFlashedAppName: null,
      lastHeard: pingResponse.lastPing || attributes.lastHeard,
    };
  };

  getDetailsByID = async (deviceID: string): Promise<Device> => {
    const [attributes, description, pingResponse] = await Promise.all([
      this._permissionManager.getEntityByID('deviceAttributes', deviceID),
      this._eventPublisher.publishAndListenForResponse({
        context: { deviceID },
        name: SPARK_SERVER_EVENTS.GET_DEVICE_DESCRIPTION,
      }),
      this._eventPublisher.publishAndListenForResponse({
        context: { deviceID },
        name: SPARK_SERVER_EVENTS.PING_DEVICE },
      ),
    ]);

    if (!attributes) {
      throw new HttpError('No device found', 404);
    }

    return {
      ...attributes,
      connected: pingResponse.connected,
      functions: description.state ? description.state.f : null,
      lastFlashedAppName: null,
      lastHeard: pingResponse.lastPing || attributes.lastHeard,
      variables: description.state ? description.state.v : null,
    };
  };

  getAll = async (): Promise<Array<Device>> => {
    const devicesAttributes =
      await this._permissionManager.getAllEntitiesForCurrentUser('deviceAttributes');

    const devicePromises = devicesAttributes.map(
      async (attributes: DeviceAttributes): Promise<Object> => {
        const pingResponse = this._eventPublisher.publishAndListenForResponse({
          context: { deviceID: attributes.deviceID },
          name: SPARK_SERVER_EVENTS.PING_DEVICE,
        });

        return {
          ...attributes,
          connected: pingResponse.connected || false,
          lastFlashedAppName: null,
          lastHeard: pingResponse.lastPing || attributes.lastHeard,
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
    const callFunctionResponse =
      await this._eventPublisher.publishAndListenForResponse({
        context: { deviceID, functionArguments, functionName },
        name: SPARK_SERVER_EVENTS.CALL_DEVICE_FUNCTION,
      });

    const { error } = callFunctionResponse;
    if (error) {
      throw new HttpError(error);
    }

    return callFunctionResponse;
  };

  getVariableValue = async (
    deviceID: string,
    variableName: string,
  ): Promise<*> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );

    const getVariableResponse =
      await this._eventPublisher.publishAndListenForResponse({
        context: { deviceID, variableName },
        name: SPARK_SERVER_EVENTS.GET_DEVICE_VARIABLE_VALUE,
      });

    const { error, result } = getVariableResponse;
    if (error) {
      throw new HttpError(error);
    }

    return result;
  };

  flashBinary = async (
    deviceID: string,
    file: File,
  ): Promise<*> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );

    const flashResponse = await this._eventPublisher.publishAndListenForResponse({
      context: { deviceID, fileBuffer: file.buffer },
      name: SPARK_SERVER_EVENTS.FLASH_DEVICE,
    });

    const { error } = flashResponse;
    if (error) {
      throw new HttpError(error);
    }

    return flashResponse;
  };

  flashKnownApp = async (
    deviceID: string,
    appName: string,
  ): Promise<*> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );

    const knownFirmware = this._deviceFirmwareRepository.getByName(appName);

    if (!knownFirmware) {
      throw new HttpError(`No firmware ${appName} found`, 404);
    }

    const flashResponse = await this._eventPublisher.publishAndListenForResponse({
      context: { deviceID, fileBuffer: knownFirmware },
      name: SPARK_SERVER_EVENTS.FLASH_DEVICE,
    });

    const { error } = flashResponse;
    if (error) {
      throw new HttpError(error);
    }

    return flashResponse;
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
      const createdKey = new NodeRSA(
        publicKey,
        'pkcs1-public-pem',
        {
          encryptionScheme: 'pkcs1',
          signingScheme: 'pkcs1',
        },
      );
      if (!createdKey.isPublic()) {
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

    const raiseYourHandResponse =
      await this._eventPublisher.publishAndListenForResponse({
        context: { deviceID, shouldShowSignal },
        name: SPARK_SERVER_EVENTS.RAISE_YOUR_HAND,
      });

    const { error } = raiseYourHandResponse;
    if (error) {
      throw new HttpError(error);
    }

    return raiseYourHandResponse;
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
