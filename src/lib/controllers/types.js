import type {Webhook} from '../../types';

export type RepositoryType<TModel> = {
  create(model: TModel) => TModel,
  delete(id: string) => void,
  getAll() => Array<TModel>,
  getById(id: string) => TModel,
};
