import {
  CreateConversationResponse,
  SendMessageResponse
} from '../../types/ResponseTypes';
import { GraphQLString } from 'graphql';
import Conversation from '../../../db/models/Conversation';
import { sendMessageToRecipients } from '../../subscriptions';
import ConversationType from '../../types/ConversationType';

const resolve = async (_, args, context) => {
  console.log('createConversationMutation!');
  if (!context.user) {
    console.log('No Context');
    return null;
  }
  const { user } = context;
  const { recipientId } = args;

  const conversation = await Conversation.findOne({
    $and: [
      { recipients: recipientId },
      { recipients: user.id },
      { recipients: { $size: 2 } }
    ]
  }).populate({
    path: 'recipients',
    select: ['email', 'name']
  });
  conversation.forEach(convo => {
    const meIdx = convo.recipients.findIndex(r => r.id === user.id);
    convo.recipients.splice(meIdx, 1);
  });
  if (conversation) {
    return conversation;
  }
  let newConversation = new Conversation();
  newConversation.recipients.push(user.id);
  newConversation.recipients.push(recipientId);
  newConversation = await newConversation.save();
  newConversation = await newConversation
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
  return newConversation;
};

export const createConversationMutation = {
  type: ConversationType,
  args: {
    recipientId: { type: GraphQLString, required: true }
  },
  resolve
};
