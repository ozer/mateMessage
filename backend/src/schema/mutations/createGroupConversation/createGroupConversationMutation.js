import { GraphQLList, GraphQLString } from 'graphql';
import Conversation from '../../../db/models/Conversation';
import { sendMessageToRecipients } from '../../subscriptions';
import conversationType from '../../types/conversation/conversationType';

const resolve = async (_, args, context) => {
  if (!context.user) {
    return null;
  }
  const { user } = context;
  const { recipientIds } = args;
  let newConversation = new Conversation();
  newConversation.recipients.push(user.id);
  for (const recipientId of recipientIds) {
    if (recipientId !== user.id) {
      newConversation.recipients.push(recipientId);
    }
  }
  let result = await newConversation.save();
  result = await result
    .populate({
      path: 'recipients',
      select: ['email', 'name']
    })
    .execPopulate();
  sendMessageToRecipients({
    recipients: newConversation.recipients,
    senderId: user.id,
    conversationId: newConversation.id
  });
  return result;
};

export const createGroupConversationMutation = {
  type: conversationType,
  args: {
    recipientIds: { type: new GraphQLList(GraphQLString), required: true }
  },
  resolve
};
