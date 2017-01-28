// @flow

import type { UserCredentials } from '../../src/types';

import crypto from 'crypto';
import uuid from 'uuid';
import ursa from 'ursa';
import fs from 'fs';
import settings from './settings';


const uuidSet = new Set();
const privateKeys = new Set();

type CreateCustomFirmwareResult = {
  filePath: string,
  fileBuffer: Buffer,
};

class TestData {
  static createCustomFirmwareBinary = (): Promise<CreateCustomFirmwareResult> =>
    new Promise((
      resolve: (result: CreateCustomFirmwareResult) => void,
      reject: (error: Error) => void,
    ) => {
      const filePath =
        `${settings.CUSTOM_FIRMWARE_DIRECTORY}/customApp-${TestData.getID()}.bin`;
      const fileBuffer = crypto.randomBytes(100);

      fs.writeFile(
        filePath,
        fileBuffer,
        (error: ?Error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve({ fileBuffer, filePath });
        },
      );
    });

  static deleteCustomFirmwareBinary = (filePath: string): Promise<void> =>
    new Promise((
      resolve: () => void,
      reject: (error: Error) => void,
    ) => {
      fs.unlink(
        filePath,
        (error: ?Error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    });

  static getUser = (): UserCredentials => ({
    password: 'password',
    username: `testUser+${TestData.getID()}@test.com`,
  });

  static getID = (): string => {
    let newID = uuid();
    while (uuidSet.has(newID)) {
      newID = uuid();
    }

    uuidSet.add(newID);
    return newID;
  };

  static getPublicKey = (): string => {
    let key = ursa.generatePrivateKey();

    while (privateKeys.has(key.toPrivatePem())) {
      key = ursa.generatePrivateKey();
    }

    privateKeys.add(key.toPrivatePem());
    return key.toPublicPem();
  };
}

export default TestData;
