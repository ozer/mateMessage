import mongoose from 'mongoose';
import Conversation from '../../../db/models/Conversation';
import {
  applyPagination,
  limitQueryWithId
} from '../../../db/helpers/pagination';

export const findConversations = async ({ first, last, before, after }) => {
  const query = limitQueryWithId({
    query: mongoose.model('Conversation').find(),
    before,
    after
  });
  const pageInfo = await applyPagination({ query, first, last });
  return {
    query,
    pageInfo
  };
};
