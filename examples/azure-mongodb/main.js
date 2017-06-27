/*
* In this example we are using Azure storage for our SSL keys +
* MongoDB (Azure Cosmos DB)
*
* If you are using Cosmos and aren't replicating your data, be
* sure to remove the `replicaSet=globaldb` from your connection
* string.
*/

/* eslint-disable */

import arrayFlatten from 'array-flatten';
import azure from 'azure-storage';
import { Container } from 'constitute';
import express from 'express';
import http from 'http';
import https from 'https';
import os from 'os';
import path from 'path';
import settings from './settings';
import { MongoDb, createApp, defaultBindings, logger } from 'spark-server';

const NODE_PORT = process.env.NODE_PORT || settings.EXPRESS_SERVER_CONFIG.PORT;
const useHttp = NODE_PORT !== 443;

process.on('uncaughtException', (exception: Error) => {
  logger.error('uncaughtException', {
    message: exception.message,
    stack: exception.stack,
  }); // logging with MetaData
  process.exit(1); // exit with failure
});

const container = new Container();
defaultBindings(container, settings);

// you have to override database bindings to use MongoDB instead of neDB:
container.bindValue('DATABASE_URL', settings.DB_CONFIG.URL);
container.bindValue('DATABASE_OPTIONS', settings.DB_CONFIG.OPTIONS);
container.bindClass('Database', MongoDb, ['DATABASE_URL', 'DATABASE_OPTIONS']);

function promisify<T>(
  call: (serviceCallback: (error: StorageError, result: T) => void) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      call((error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
    } catch (err) {
      reject(err);
    }
  });
}

const blobService = azure.createBlobService(
  settings.AZURE_STORAGE_CONNECTION_KEY,
);

(async () => {
  try {
    const sslCertificate = await promisify(cb =>
      blobService.getBlobToText('keys', settings.SSL_CERTIFICATE, cb),
    );
    const privateKey = await promisify(cb =>
      blobService.getBlobToText('keys', settings.SSL_PRIVATE_KEY, cb),
    );

    const options = {
      cert: sslCertificate,
      key: privateKey,
      // This is necessary only if using the client certificate authentication.
      requestCert: true,
    };

    const deviceServer = container.constitute('DeviceServer');
    deviceServer.start();

    const app = express();
    createApp(container, settings, app);

    (useHttp
      ? http.createServer(app)
      : https.createServer(options, app)).listen(NODE_PORT, (): void =>
      console.log(`express server started on port ${NODE_PORT}`),
    );

    const addresses = arrayFlatten(
      Object.entries(os.networkInterfaces()).map(
        // eslint-disable-next-line no-unused-vars
        ([name, nic]: [string, mixed]): Array<string> =>
          (nic: any)
            .filter(
              (address: Object): boolean =>
                address.family === 'IPv4' && address.address !== '127.0.0.1',
            )
            .map((address: Object): boolean => address.address),
      ),
    );
    addresses.forEach((address: string): void =>
      console.log(`Your device server IP address is: ${address}`),
    );
  } catch (error) {
    console.log('SSL ERROR', error);
  }
})();
