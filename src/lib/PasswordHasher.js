/**
*    Copyright (C) 2013-2014 Spark Labs, Inc. All rights reserved. -  https://www.spark.io/
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU Affero General Public License, version 3,
*    as published by the Free Software Foundation.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU Affero General Public License for more details.
*
*    You should have received a copy of the GNU Affero General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*    You can download the source here: https://github.com/spark/spark-server
*
* @flow
*
*/

import crypto from 'crypto';

const HASH_DIGEST = 'sha256';
const HASH_ITERATIONS = 30000;
const KEY_LENGTH = 64;

class PasswordHasher {
  static generateSalt(size: number = 64): Promise<*> {
    return new Promise((resolve: Function, reject: Function) => {
      crypto.randomBytes(size, (error: ?Error, buffer: Buffer) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(buffer.toString('base64'));
      });
    });
  }

  static hash(password: string, salt: string): Promise<*> {
    return new Promise((resolve: Function, reject: Function) => {
      crypto.pbkdf2(
        password,
        salt,
        HASH_ITERATIONS,
        KEY_LENGTH,
        HASH_DIGEST,
        (error: ?Error, key: Buffer) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(key.toString('base64'));
        },
      );
    });
  }
}

export default PasswordHasher;
