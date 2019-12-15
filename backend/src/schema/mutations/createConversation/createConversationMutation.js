import { GraphQLString } from 'graphql';
import Conversation from '../../../db/models/Conversation';
import { sendMessageToRecipients } from '../../subscriptions';
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
  sendMessageToRecipients({
    recipients: newConversation.recipients,
    senderId: user.id,
    conversationId: newConversation.id
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
