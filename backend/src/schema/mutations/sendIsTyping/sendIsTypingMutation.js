import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';
import Conversation from '../../../db/models/Conversation';
import Message from '../../../db/models/Message';
import { sendIsTypingToRecipients } from '../../subscriptions';

export const resolve = async (_, args, context) => {
  console.log('sendIsTypingMutation!');
  if (!context.user) {
    console.log('No Context!');
    return null;
  }
  const { user } = context;
  const { isTyping, conversationId } = args;

  const conversation = await Conversation.findById(conversationId).populate({
    path: 'recipients',
    select: ['id'],
    match: { id: { $ne: user.id } }
  });
  if (!conversation) {
    return null;
  }
  console.log('conversation in sendIsTypingMutation -> ', conversation.id);

  sendIsTypingToRecipients({
    isTyping,
    recipients: conversation.recipients,
    senderId: user.id,
    conversationId: conversation.id
  });

  return {
    isTyping,
    senderId: user.id,
    conversationId: conversation.id
  };
};

export const sendIsTypingMutation = {
  type: new GraphQLObjectType({
    name: 'sendIsTypingData',
    fields: () => ({
      isTyping: {
        type: GraphQLBoolean
      },
      senderId: {
        type: GraphQLString
      },
      conversationId: {
        type: GraphQLString
      }
    })
  }),
  args: {
    isTyping: { type: GraphQLBoolean, required: true },
    conversationId: { type: GraphQLString, required: true }
  },
  resolve
};
