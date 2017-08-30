// @flow

import type { CollectionName } from './collectionNames';
import type { IBaseDatabase, IProductRepository, Product } from '../types';

import COLLECTION_NAMES from './collectionNames';
import BaseRepository from './BaseRepository';

class ProductDatabaseRepository extends BaseRepository
  implements IProductRepository {
  _database: IBaseDatabase;
  _collectionName: CollectionName = COLLECTION_NAMES.PRODUCTS;

  constructor(database: IBaseDatabase) {
    super(database, COLLECTION_NAMES.PRODUCTS);
    this._database = database;
  }

  create = async (model: $Shape<Product>): Promise<Product> =>
    await this._database.insertOne(this._collectionName, {
      ...(await this._formatProduct(model)),
      created_at: new Date(),
      product_id: (await this._database.count(this._collectionName)) + 1,
    });

  deleteByID = async (id: string): Promise<void> =>
    await this._database.remove(this._collectionName, { _id: id });

  getAll = async (userID: ?string = null): Promise<Array<Product>> => {
    // TODO - this should probably just query the organization
    const query = userID ? { ownerID: userID } : {};
    return await this._database.find(this._collectionName, query);
  };

  getByID = async (id: string): Promise<?Product> =>
    await this._database.findOne(this._collectionName, { _id: id });

  getByIDOrSlug = async (productIDOrSlug: string): Promise<?Product> =>
    await this._database.findOne(this._collectionName, {
      $or: [
        {
          product_id: !isNaN(productIDOrSlug)
            ? parseInt(productIDOrSlug, 10)
            : null,
        },
        { slug: productIDOrSlug },
      ],
    });

  updateByID = async (id: string, product: Product): Promise<Product> =>
    await this._database.findAndModify(
      this._collectionName,
      { _id: id },
      { $set: { ...(await this._formatProduct(product)) } },
    );

  _formatProduct = async (
    product: $Shape<Product>,
  ): Promise<$Shape<Product>> => {
    const slug = `${product.name.trim()} ${product.hardware_version.trim()}`
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text

    const existingProduct = await this._database.findOne(this._collectionName, {
      slug,
    });

    if (existingProduct && existingProduct.product_id !== product.product_id) {
      throw new Error('Product name or version already in use');
    }

    return {
      ...product,
      slug,
    };
  };
}

export default ProductDatabaseRepository;
