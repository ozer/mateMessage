import { Schema, model } from "mongoose";
import User from './User';

const MessageSchema = new Schema(
    {
      content: String,
      conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'conversation',
      },
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      created_at: { type: Date, default: new Date() }
    },
    { collection: "message" }
);

const Message = model("Message", MessageSchema, "Message");

export default MessageSchema;
