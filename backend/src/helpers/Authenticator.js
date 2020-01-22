import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { v4 } from 'uuid';
import User from '../db/models/User';

jwt.verify = promisify(jwt.verify);

export const generateToken = credentials => {
  const { email, id, username, name } = credentials;
  const session = {
    email,
    id,
    username,
    name,
    uuid: v4(),
  };
  const token = jwt.sign(session, 'mateMessage', {
    expiresIn: 60 * 60 * 24 * 7 * 30
  });
  return token;
};

export const validateToken = async token => {
  try {
    const user = await jwt.verify(token, 'mateMessage');
    return user;
  } catch (e) {
    console.log('ERROR AT VALIDATE TOKEN', e); // eslint-disable-line
    throw e;
  }
};