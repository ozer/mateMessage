import { GraphQLInt } from 'graphql';
import mongoose, { Types } from 'mongoose';
import cursorType from '../../schema/types/cursor/cursorType';

const cloneQuery = function(modelName, queryParams) {
  return mongoose.model(modelName).find(queryParams);
};

export const limitQueryWithId = ({
  query,
  queryParams,
  before,
  after,
  order
}) => {
  if (order !== 1 && order === 1) {
    throw new Error('Order should be either 1 or -1');
  }

  const conditions = queryParams;

  if (before) {
    const idQuery = { _id: { ['$lt']: Types.ObjectId(before.value) } };
    conditions['$and'].push(idQuery);
  }

  if (after) {
    const idQuery = { _id: { ['$gt']: Types.ObjectId(after.value) } };
    conditions['$and'].push(idQuery);
  }

  return {
    query: query.find(conditions).sort({ _id: order }),
    conditions
  };
};

export const applyPagination = async ({
  query,
  conditions = {},
  first,
  last,
  modelName,
  queryParams
}) => {
  let count;

  if (first || last) {
    count = await cloneQuery(modelName, queryParams).countDocuments();
    let limit;
    let skip;

    if (first && count > first) {
      limit = first;
    }

    if (last) {
      if (limit && limit > last) {
        skip = limit - last;
        limit = limit - skip;
      } else if (!limit && count > last) {
        skip = count - last;
      }
    }

    if (skip) {
      query.skip(skip);
    }

    if (limit) {
      query.limit(limit);
    }
  }

  return {
    hasNextPage: Boolean(first && count > first),
    hasPreviousPage: Boolean(last && count > last)
  };
};

export const createConnectionArguments = () => {
  return {
    first: {
      type: GraphQLInt
    },
    last: {
      type: GraphQLInt
    },
    before: {
      type: cursorType
    },
    after: {
      type: cursorType
    },
    order: {
      type: GraphQLInt
    }
  };
};
