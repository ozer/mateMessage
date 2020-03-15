import mongoose from 'mongoose';
import DataLoader from 'dataloader';
import User from '../db/models/User';

export const getuserLoader = () =>
  new DataLoader(
    async userIds => {
      return await User.find(
        {
          _id: { $in: userIds.map(userId => mongoose.Types.ObjectId(userId)) }
        },
        {
          password: 0,
          jwt: 0
        }
      );
    },
    {
      cacheKeyFn: key => {
        return key.toString();
      }
    }
  );
