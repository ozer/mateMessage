import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    name: String,
    email: String,
    username: String,
    password: String,
    avatar: String,
    jwt: String,
    created_at: { type: Date, default: new Date() }
  },
  { collection: 'user' }
);

const User = model('User', UserSchema, 'User');

export default User;
