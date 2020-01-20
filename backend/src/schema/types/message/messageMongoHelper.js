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
  const query = limitQueryWithId({
    query: mongoose.model('Message').find(),
    queryParams,
    before,
    after,
    order
  });
  const pageInfo = await applyPagination({
    query,
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
