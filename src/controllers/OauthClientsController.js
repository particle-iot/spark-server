// @flow

import Controller from './Controller';
import HttpError from '../lib/HttpError';
import httpVerb from '../decorators/httpVerb';
import route from '../decorators/route';

class OauthClientsController extends Controller {
  @httpVerb('post')
  @route('/v1/products/:productIDorSlug/clients/')
  // eslint-disable-next-line class-methods-use-this
  async createClient(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('put')
  @route('/v1/products/:productIDorSlug/clients/:clientID')
  // eslint-disable-next-line class-methods-use-this
  async editClient(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }

  @httpVerb('delete')
  @route('/v1/products/:productIDorSlug/clients/:clientID')
  // eslint-disable-next-line class-methods-use-this
  async deleteClient(): Promise<*> {
    throw new HttpError('not supported in the current server version');
  }
}

export default OauthClientsController;
