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

const HASH_DIGEST = 'sha1';
const HASH_ITERATIONS = 30000;
const KEY_LENGTH = 64;

class PasswordHasher {
  static generateSalt(callback: (error: ?Error, buffer: Buffer) => void) {
    crypto.randomBytes(64, callback);
  }

  static hash(
    password: Buffer,
    salt: Buffer,
    callback: (error: ?Error, key: string) => void,
  ) {
    crypto.pbkdf2(
      password.toString('base64'),
      salt.toString('base64'),
      HASH_ITERATIONS,
      KEY_LENGTH,
      HASH_DIGEST,
      (error: ?Error, key: Buffer): void =>
        callback(error, key.toString('base64')),
    );
  }
}

export default PasswordHasher;
