import DataLoader from 'dataloader';
import User from '../db/models/User';

export const getuserLoader = () =>
  new DataLoader(userIds => {
    return User.find({ _id: { $in: userIds } }, { password: 0, jwt: 0 }).exec();
  });
