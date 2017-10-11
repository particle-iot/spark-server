// @flow

import type { UserCredentials } from '../../src/types';

import crypto from 'crypto';
import uuid from 'uuid';
import NodeRSA from 'node-rsa';
import fs from 'fs';
import settings from './settings';

const uuidSet = new Set();

type CreateCustomFirmwareResult = {
  filePath: string,
  fileBuffer: Buffer,
};

class TestData {
  static createCustomFirmwareBinary = (): Promise<CreateCustomFirmwareResult> =>
    new Promise(
      (
        resolve: (result: CreateCustomFirmwareResult) => void,
        reject: (error: Error) => void,
      ) => {
        const filePath = `${settings.CUSTOM_FIRMWARE_DIRECTORY}/customApp-${TestData.getID()}.bin`;
        const fileBuffer = crypto.randomBytes(100);

        fs.writeFile(filePath, fileBuffer, (error: ?Error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve({ fileBuffer, filePath });
        });
      },
    );

  static deleteCustomFirmwareBinary = (filePath: string): Promise<void> =>
    new Promise((resolve: () => void, reject: (error: Error) => void) => {
      fs.unlink(filePath, (error: ?Error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
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
    const key = new NodeRSA({ b: 1024 });

    return key.exportKey('pkcs8-public-pem');
  };
}

export default TestData;
