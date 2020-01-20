import mongoose from 'mongoose';
import User from '../../../db/models/User';
import { applyPagination, limitQueryWithId } from '../../../db/helpers/pagination';

export const findUsers = async (
  { first, last, before, after, order },
  queryParams
) => {
  const query = limitQueryWithId({
    query: mongoose.model('User').find(),
    queryParams,
    before,
    after,
    order
  });
  const pageInfo = await applyPagination({
    query,
    first,
    last,
    modelName: 'User',
    queryParams
  });
  return {
    query,
    pageInfo
  };
};
