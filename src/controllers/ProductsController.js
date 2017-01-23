// @flow

import Controller from './Controller';
import HttpError from '../lib/HttpError';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

class ProductsController extends Controller {
  @httpVerb('get')
  @route('/v1/products')
  // eslint-disable-next-line class-methods-use-this
  async getProducts(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('post')
  @route('/v1/products')
  // eslint-disable-next-line class-methods-use-this
  async createProduct(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('get')
  @route('/v1/products/:productIdOrSlug')
  // eslint-disable-next-line class-methods-use-this
  async getProductDetails(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('post')
  @route('/v1/products/:productIdOrSlug/device_claims')
  // eslint-disable-next-line class-methods-use-this
  async generateClaimCode(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('delete')
  @route('/v1/products/:productIdOrSlug/devices/:deviceID')
  // eslint-disable-next-line class-methods-use-this
  async removeDeviceFromProduct(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('delete')
  @route('/v1/products/:productIdOrSlug/team/:username')
  // eslint-disable-next-line class-methods-use-this
  async removeTeamMember(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }
}

export default ProductsController;
