import { Schema, model, Types } from "mongoose";
import { MessageSchema } from './Message';

export const ConversationSchema = new Schema(
  {
    title: String,
    avatar: String,
    recipients: {
      type: [{
        recipient: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      }]
    },
    messages: {
      type: [MessageSchema]
    },
    created_at: { type: Date, default: new Date() }
  },
);

ConversationSchema.index({ 'recipients.recipient': 1 });

export default model("Conversation", ConversationSchema, "Conversation");
