import DataLoader from 'dataloader';
import User from '../db/models/User';

export const getuserLoader = () =>
  new DataLoader(
    async userIds => {
      return await User.find(
        { _id: { $in: userIds } },
        { password: 0, jwt: 0 }
      );
    },
    { cacheKeyFn: key => key.toString() }
  );
