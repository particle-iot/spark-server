// @flow

import uuid from 'uuid';
import ursa from 'ursa';

const uuidSet = new Set();
const privateKeys = new Set();

class TestData {
  static getUser = (): {password: string, username: string} => {
    return {
      password: 'password',
      username: `testUser+${TestData.getID()}@test.com`,
    };
  };

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
