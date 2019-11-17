import { Schema, model } from "mongoose";

export const MessageSchema = new Schema(
    {
      content: String,
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      created_at: { type: Date, default: new Date() }
    },
);

MessageSchema.index({ content: 1, sender: 1 });

export default model("Message", MessageSchema, "Message");
