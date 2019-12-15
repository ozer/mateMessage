import { GraphQLList, GraphQLString } from 'graphql';
import Conversation from '../../../db/models/Conversation';
import { sendMessageToRecipients } from '../../subscriptions';
import conversationType from '../../types/conversation/conversationType';

const resolve = async (_, args, context) => {
  console.log('createGroupConversationMutation!');
  if (!context.user) {
    console.log('No Context');
    return null;
  }
  const { user } = context;
  const { recipientIds } = args;
  let newConversation = new Conversation();
  newConversation.recipients.push(user.id);
  for (const recipientId of recipientIds) {
    newConversation.recipients.push(recipientId);
  }
  let result = await newConversation.save();
  result = await result
    .populate({
      path: 'recipients',
      select: ['email', 'name']
    })
    .execPopulate();
  newConversation.forEach(convo => {
    const meIdx = convo.recipients.findIndex(r => r.id === user.id);
    convo.recipients.splice(meIdx, 1);
  });
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
