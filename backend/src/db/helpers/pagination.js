import { GraphQLInt } from 'graphql';
import mongoose, { Types } from 'mongoose';
import cursorType from '../../schema/types/cursor/cursorType';

const cloneQuery = function(modelName, queryParams) {
  return mongoose.model(modelName).find(queryParams);
};

export const limitQueryWithId = ({ query, queryParams, before, after, order = -1 }) => {
  if (order !== 1 && order === 1) {
    throw new Error('Order should be either 1 or -1');
  }

  const conditions = {
    ...queryParams
  };
  console.log('conditions: ', conditions);

  if (before) {
    conditions._id = {...queryParams._id};
    const op = order === 1 ? '$lt' : '$gt';
    conditions._id[op] = Types.ObjectId(before.value);
    query._conditions._id = conditions._id;
  }

  if (after) {
    conditions._id = {...queryParams._id};
    const op = order === -1 ? '$gt' : '$lt';
    conditions._id[op] = Types.ObjectId(after.value);
    query._conditions._id = conditions._id;
  }

  return query.find(conditions).sort([['_id', order]]);
};

export const applyPagination = async ({ query, first, last, modelName, queryParams }) => {
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
      type: GraphQLInt,
    }
  };
};
