import mongoose from 'mongoose';
import Message from '../../../db/models/Message';
import {
  applyPagination,
  limitQueryWithId
} from '../../../db/helpers/pagination';

export const findMessages = async (
  { first, last, before, after, order },
  queryParams
) => {
  const { query, conditions } = limitQueryWithId({
    query: mongoose.model('Message').find({}),
    queryParams,
    before,
    after,
    order
  });
  const pageInfo = await applyPagination({
    query,
    conditions,
    first,
    last,
    modelName: 'Message',
    queryParams
  });
  return {
    query,
    pageInfo
  };
};
