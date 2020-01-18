import { GraphQLString } from 'graphql';
import Conversation from '../../../db/models/Conversation';
import {
  sendConversationToRecipients,
  sendMessageToRecipients
} from '../../subscriptions';
import conversationType from '../../types/conversation/conversationType';

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

  const base64 = Buffer.from(`Conversation:${newConversation.id}`).toString(
    'base64'
  );

  sendConversationToRecipients({
    id: newConversation.id,
    conversationId: newConversation.id,
    recipients: newConversation.recipients,
    messages: []
  });

  return newConversation;
};

export const createConversationMutation = {
  type: conversationType,
  args: {
    recipientId: { type: GraphQLString, required: true }
  },
  resolve
};
