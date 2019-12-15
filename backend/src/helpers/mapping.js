import { Types } from 'mongoose';

export const idMapping = parentVal => {
  if (parentVal.id && typeof parentVal.id === 'object') {
    return Types.ObjectId(parentVal.id).toString();
  }

  if (parentVal._id && typeof parentVal._id === 'object') {
    return Types.ObjectId(parentVal._id).toString();
  }

  return parentVal.id || parentVal._id;
};
