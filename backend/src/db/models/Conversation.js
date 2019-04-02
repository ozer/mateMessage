import { Schema, model } from "mongoose";
import MessageSchema from './Message';
import User from './User';

const ConversationSchema = new Schema(
    {
      title: String,
      avatar: String,
      recipients: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      messages: [MessageSchema],
      created_at: { type: Date, default: new Date() }
    },
    { collection: "conversation" }
);

const Conversation = model("Conversation", ConversationSchema, "Conversation");

export default ConversationSchema;
