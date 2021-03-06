import { validateToken } from '../helpers/Authenticator';
import User from '../db/models/User';
import { userLoader } from '../dataloaders/userLoader';

export const buildContext = ({ req, connection }) => {
  if (connection) {
    return connection.context;
  }

  // get the user token from the headers
  if (req && req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
      return validateToken(token).then(result => {
        if (result && result.id) {
          return User.findById(result.id, { password: 0 }).then(user => {
            if (user) {
              return {
                state: true,
                user,
                userLoader: userLoader
              };
            }
          });
        }
        return { state: false, user: null };
      });
    }
    return { state: false, user: null };
  }
  return { state: false, user: null };
};
