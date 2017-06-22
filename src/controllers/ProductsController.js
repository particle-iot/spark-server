// @flow
/* eslint-disable */

import type DeviceManager from '../managers/DeviceManager';

import Controller from './Controller';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';
import HttpError from '../lib/HttpError';

class ProductsController extends Controller {
  _deviceManager: DeviceManager;

  constructor(deviceManager: DeviceManager) {
    super();

    this._deviceManager = deviceManager;
  }

  @httpVerb('get')
  @route('/v1/products')
  async getProducts(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('post')
  @route('/v1/products')
  async createProduct(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('get')
  @route('/v1/products/:productIdOrSlug')
  async getProduct(productIdOrSlug: string): Promise<*> {
    throw new HttpError('Not implemented');
  }

  @httpVerb('post')
  @route('/v1/products/:productIdOrSlug/device_claims')
  async generateClaimCode(productIdOrSlug: string): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('get')
  @route('/v1/products/:productIdOrSlug/firmware')
  async getFirmware(productIdOrSlug: string): Promise<*> {
    throw new HttpError('Not implemented');
  }

  // {version: number, name: 'current', binary: File, title: string, description: string}
  @httpVerb('post')
  @route('/v1/products/:productIdOrSlug/firmware')
  async getFirmware(productIdOrSlug: string): Promise<*> {
    /*
    {
    "updated_at": "2017-01-23T05:55:11.592Z",
    "uploaded_on": "2017-01-23T05:55:11.592Z",
    "uploaded_by": {
      "__v": 3,
      "_id": "aaa",
      "access_token": "asdf",
      "access_token_expires_at": "2015-05-14T02:46:54.216Z",
      "created_at": "2014-12-05T14:17:32.000Z",
      "updated_at": "2017-01-14T15:45:26.877Z",
      "username": "foo@gmail.com",
      "tos": {
        "accepted": true
      },
      "subscription_ids": [
        3632,
        3633,
        7312
      ]
    },
    "version": 1,
    "product_id": 647,
    "size": 40648,
    "name": "p1_firmware_1485150795661.bin",
    "title": "Test",
    "description": "test",
    "_id": "asdf",
    "current": false,
    "device_count": 0
  }
  */
    throw new HttpError('Not implemented');
  }

  @httpVerb('get')
  @route('/v1/products/:productIdOrSlug/devices')
  async getDevices(productIdOrSlug: string): Promise<*> {
    throw new HttpError('Not implemented');
  }

  @httpVerb('put')
  @route('/v1/products/:productIdOrSlug/devices/:deviceID')
  async setFirmwareVersion(
    productIdOrSlug: string,
    deviceID: string,
    body: { desired_firmware_version: number },
  ): Promise<*> {
    /*
    {
      "desired_firmware_version": 1,
      "updated_at": "2017-01-23T05:59:35.809Z",
      "id": "some_device_id"
    }
    */
    throw new HttpError('Not implemented');
  }

  @httpVerb('delete')
  @route('/v1/products/:productIdOrSlug/devices/:deviceID')
  async removeDeviceFromProduct(
    productIdOrSlug: string,
    deviceID: string,
  ): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('get')
  @route('/v1/products/:productIdOrSlug/config')
  async getConfig(productIdOrSlug: string): Promise<*> {
    /*
    {
      "product_configuration": [
        {
          "org_id": "57a0a70786ddb6f9501032d6",
          "__v": 0,
          "id": "57a0a71086ddb6f9501032d8",
          "product_id": 647
        }
      ]
    }
    */
    throw new HttpError('Not implemented');
  }

  @httpVerb('get')
  @route('/v1/products/:productIdOrSlug/events/:eventPrefix?*')
  async getEvents(productIdOrSlug: string, eventName: string): Promise<*> {
    throw new HttpError('Not implemented');
  }

  @httpVerb('delete')
  @route('/v1/products/:productIdOrSlug/team/:username')
  async removeTeamMember(
    productIdOrSlug: string,
    username: string,
  ): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }
}

export default ProductsController;
/* eslint-enable */
