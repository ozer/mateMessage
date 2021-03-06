import mongoose from 'mongoose';
import Conversation from '../../../db/models/Conversation';
import {
  applyPagination,
  limitQueryWithId
} from '../../../db/helpers/pagination';

export const findConversations = async (
  { first, last, before, after, order },
  queryParams
) => {
  const { query, conditions } = limitQueryWithId({
    query: mongoose.model('Conversation').find({}),
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
    modelName: 'Conversation',
    queryParams
  });
  return {
    query,
    pageInfo
  };
};
