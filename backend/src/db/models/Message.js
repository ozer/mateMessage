import mongoose, { Schema, model } from 'mongoose';
import { ConversationSchema } from './Conversation';

export const MessageSchema = new Schema({
  content: String,
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: { type: Date, default: new Date() }
});

MessageSchema.index({ content: 1, senderId: 1, conversationId: 1 });

export default model('Message', MessageSchema, 'Message');
