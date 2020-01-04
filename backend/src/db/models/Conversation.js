import mongoose, { Schema, model } from "mongoose";

export const ConversationSchema = new Schema(
  {
    title: String,
    avatar: String,
    recipients: {
      type: [{
		  type: Schema.Types.ObjectId,
		  ref: 'User',
	  }]
    },
    created_at: { type: Date, default: new Date() }
  },
);

ConversationSchema.index({ 'recipients': 1 });

export default model("Conversation", ConversationSchema, "Conversation");
