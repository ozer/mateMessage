import { GraphQLString } from 'graphql';
import Conversation from '../../../db/models/Conversation';
import { sendConversationToRecipients } from '../../subscriptions';
import conversationType from '../../types/conversation/conversationType';

const resolve = async (_, args, context) => {
  if (!context.user) {
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
      select: ['email', 'name', 'username']
    })
    .execPopulate();

  const base64 = Buffer.from(`Conversation:${newConversation.id}`).toString(
    'base64'
  );

  sendConversationToRecipients({
    id: newConversation.id,
    conversationId: newConversation.id,
    recipients: newConversation.recipients,
    messages: {
      __typename: 'MessageConnection',
      pageInfo: {
        __typename: 'PageInfo',
        hasPreviousPage: false,
        hasNextPage: false
      },
      edges: []
    }
  });

  return {
    id: newConversation.id,
    conversationId: newConversation.id,
    recipients: newConversation.recipients,
    messages: {
      __typename: 'MessageConnection',
      pageInfo: {
        __typename: 'PageInfo',
        hasPreviousPage: false,
        hasNextPage: false
      },
      edges: []
    }
  };
};

export const createConversationMutation = {
  type: conversationType,
  args: {
    recipientId: { type: GraphQLString, required: true }
  },
  resolve
};
