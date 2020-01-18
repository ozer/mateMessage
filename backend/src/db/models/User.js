import mongoose, { Schema, model } from 'mongoose';
import { ConversationSchema } from './Conversation';

export const UserSchema = new Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  avatar: String,
  jwt: String,
  created_at: { type: Date, default: new Date() }
});

UserSchema.index({ name: 1, email: 1, username: 1 });

export default model('User', UserSchema, 'User');
