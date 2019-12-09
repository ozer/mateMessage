import { GraphQLID, GraphQLObjectType, GraphQLString } from 'graphql';
import { SendMessageResponse } from '../../types/ResponseTypes';
import { sendMessageToRecipients } from '../../subscriptions';
import Conversation from '../../../db/models/Conversation';
import Message from '../../../db/models/Message';

const delay = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

export const resolve = async (_, args, context) => {
  console.log('sendMessageMutation!');
  await delay();
  if (!context.user) {
    console.log('No Context!');
    return null;
  }
  const { user } = context;
  const { content, conversationId } = args;
  const conversation = await Conversation.findById(conversationId).populate({
    path: 'recipients',
    select: ['email', 'name'],
    match: { id: { $ne: user.id } }
  });
  if (!conversation) {
    return null;
  }
  console.log('conversation in sendMessage -> ', conversation.id);
  const newMessage = new Message();
  newMessage.content = content;
  newMessage.sender = user.id;
  newMessage.conversation = conversation.id;
  await newMessage.save();
  console.log('newMessage -> ', newMessage);

  sendMessageToRecipients({
    recipients: conversation.recipients,
    content,
    senderId: user.id,
    conversationId: conversation.id,
    messageId: newMessage.id
  });

  return {
    content,
    id: newMessage.id,
    sender: user.id,
    conversation: conversation.id
  };
};

export const sendMessageMutation = {
  type: new GraphQLObjectType({
    name: 'messageSendData',
    fields: () => ({
      id: {
        type: GraphQLID
      },
      content: {
        type: GraphQLString
      },
      sender: {
        type: GraphQLString
      },
      conversation: {
        type: GraphQLString
      }
    })
  }),
  args: {
    content: { type: GraphQLString, required: true },
    conversationId: { type: GraphQLString, required: true }
  },
  resolve
};
