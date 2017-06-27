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

import ECKey from 'ec-key';
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
    // todo check: we may not need to get attributes from db here.
    const attributes = await this._deviceAttributeRepository.getByID(deviceID);

    if (!attributes) {
      throw new HttpError('No device found', 404);
    }
    if (attributes.ownerID && attributes.ownerID !== userID) {
      throw new HttpError('The device belongs to someone else.');
    }

    if (attributes.ownerID && attributes.ownerID === userID) {
      throw new HttpError('The device is already claimed.');
    }

    // update connected device attributes
    await this._eventPublisher.publishAndListenForResponse({
      context: { attributes: { ownerID: userID }, deviceID },
      name: SPARK_SERVER_EVENTS.UPDATE_DEVICE_ATTRIBUTES,
    });

    // todo check: we may not need to update attributes in db here.
    return await this._deviceAttributeRepository.updateByID(deviceID, {
      ownerID: userID,
    });
  };

  unclaimDevice = async (deviceID: string): Promise<DeviceAttributes> => {
    await this.getByID(deviceID);

    // update connected device attributes
    await this._eventPublisher.publishAndListenForResponse({
      context: { attributes: { ownerID: null }, deviceID },
      name: SPARK_SERVER_EVENTS.UPDATE_DEVICE_ATTRIBUTES,
    });

    return await this._deviceAttributeRepository.updateByID(deviceID, {
      ownerID: null,
    });
  };

  getAttributesByID = async (deviceID: string): Promise<DeviceAttributes> => {
    // eslint-disable-next-line no-unused-vars
    const { connected, ...attributes } = await this.getByID(deviceID);
    return attributes;
  };

  getByID = async (deviceID: string): Promise<Device> => {
    const connectedDeviceAttributes = await this._eventPublisher.publishAndListenForResponse(
      {
        context: { deviceID },
        name: SPARK_SERVER_EVENTS.GET_DEVICE_ATTRIBUTES,
      },
    );

    const attributes = !connectedDeviceAttributes.error &&
      this._permissionManager.doesUserHaveAccess(connectedDeviceAttributes)
      ? connectedDeviceAttributes
      : await this._permissionManager.getEntityByID(
          'deviceAttributes',
          deviceID,
        );

    if (!attributes) {
      throw new HttpError('No device found', 404);
    }

    return {
      ...attributes,
      connected: !connectedDeviceAttributes.error,
      lastFlashedAppName: null,
    };
  };

  getAll = async (): Promise<Array<Device>> => {
    const devicesAttributes = await this._permissionManager.getAllEntitiesForCurrentUser(
      'deviceAttributes',
    );

    const devicePromises = devicesAttributes.map(
      async (attributes: DeviceAttributes): Promise<Object> => {
        const pingResponse = await this._eventPublisher.publishAndListenForResponse(
          {
            context: { deviceID: attributes.deviceID },
            name: SPARK_SERVER_EVENTS.PING_DEVICE,
          },
        );
        return {
          ...attributes,
          connected: pingResponse.connected || false,
          lastFlashedAppName: null,
          lastHeard: pingResponse.lastHeard || attributes.lastHeard,
        };
      },
    );

    return Promise.all(devicePromises);
  };

  callFunction = async (
    deviceID: string,
    functionName: string,
    functionArguments: { [key: string]: string },
  ): Promise<*> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );
    const callFunctionResponse = await this._eventPublisher.publishAndListenForResponse(
      {
        context: { deviceID, functionArguments, functionName },
        name: SPARK_SERVER_EVENTS.CALL_DEVICE_FUNCTION,
      },
    );

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

    const getVariableResponse = await this._eventPublisher.publishAndListenForResponse(
      {
        context: { deviceID, variableName },
        name: SPARK_SERVER_EVENTS.GET_DEVICE_VARIABLE_VALUE,
      },
    );

    const { error, result } = getVariableResponse;
    if (error) {
      throw new HttpError(error);
    }

    return result;
  };

  flashBinary = async (deviceID: string, file: File): Promise<*> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );

    const flashResponse = await this._eventPublisher.publishAndListenForResponse(
      {
        context: { deviceID, fileBuffer: file.buffer },
        name: SPARK_SERVER_EVENTS.FLASH_DEVICE,
      },
    );

    const { error } = flashResponse;
    if (error) {
      throw new HttpError(error);
    }

    return flashResponse;
  };

  flashKnownApp = async (deviceID: string, appName: string): Promise<*> => {
    await this._permissionManager.checkPermissionsForEntityByID(
      'deviceAttributes',
      deviceID,
    );

    const knownFirmware = this._deviceFirmwareRepository.getByName(appName);

    if (!knownFirmware) {
      throw new HttpError(`No firmware ${appName} found`, 404);
    }

    const flashResponse = await this._eventPublisher.publishAndListenForResponse(
      {
        context: { deviceID, fileBuffer: knownFirmware },
        name: SPARK_SERVER_EVENTS.FLASH_DEVICE,
      },
    );

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
      try {
        const eccKey = new ECKey(publicKey, 'pem');
        if (eccKey.isPrivateECKey) {
          throw new HttpError('Not a public key');
        }
      } catch (error) {
        throw new HttpError(`Key error ${error}`);
      }
    } else {
      try {
        const createdKey = new NodeRSA(publicKey);

        if (!createdKey.isPublic()) {
          throw new HttpError('Not a public key');
        }
      } catch (error) {
        throw new HttpError(`Key error ${error}`);
      }
    }

    await this._deviceKeyRepository.updateByID(deviceID, {
      algorithm,
      deviceID,
      key: publicKey,
    });

    await this._deviceAttributeRepository.updateByID(deviceID, {
      ownerID: userID,
      registrar: userID,
      timestamp: new Date(),
    });
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

    const raiseYourHandResponse = await this._eventPublisher.publishAndListenForResponse(
      {
        context: { deviceID, shouldShowSignal },
        name: SPARK_SERVER_EVENTS.RAISE_YOUR_HAND,
      },
    );

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
    // eslint-disable-next-line no-unused-vars
    const attributes = await this.getAttributesByID(deviceID);

    // update connected device attributes
    await this._eventPublisher.publishAndListenForResponse({
      context: { attributes: { name }, deviceID },
      name: SPARK_SERVER_EVENTS.UPDATE_DEVICE_ATTRIBUTES,
    });

    return await this._deviceAttributeRepository.updateByID(deviceID, { name });
  };
}

export default DeviceManager;
