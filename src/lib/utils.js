// @flow

import crypto from 'crypto';
import { promisify } from './promisify';

export const generateRandomToken = async (): Promise<string> => {
  const randomBytesBuffer = await promisify(crypto, 'randomBytes', 256);
  return crypto.createHash('sha1').update(randomBytesBuffer).digest('hex');
};
