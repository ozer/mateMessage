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

export const sendMessageMutation = {
  type: new GraphQLObjectType({
    name: 'messageSendData',
    fields: () => ({
      id: {
        type: GraphQLString
      },
      messageId: {
        type: GraphQLString
      },
      conversationId: {
        type: GraphQLString
      },
      senderId: {
        type: GraphQLString
      },
      content: {
        type: GraphQLString
      }
    })
  }),
  args: {
    content: { type: GraphQLString, required: true },
    conversationId: { type: GraphQLString, required: true }
  },
  resolve: async (_, args, context) => {
    await delay();
    if (!context.user) {
      console.log('No Context!');
      return null;
    }
    const { user } = context;
    const { content, conversationId } = args;
    const conversation = await Conversation.findById(conversationId).populate({
      path: 'recipients',
      select: ['email', 'name']
      // match: { id: { $ne: user.id } }
    });
    if (!conversation) {
      return null;
    }
    const newMessage = new Message();
    newMessage.content = content;
    newMessage.senderId = user.id;
    newMessage.conversationId = conversation.id;
    await newMessage.save();

    const base64 = Buffer.from(`Message:${newMessage.id}`).toString('base64');

    sendMessageToRecipients({
      id: base64,
      messageId: newMessage.id,
      conversationId: conversation.id,
      senderId: user.id,
      recipients: conversation.recipients,
      content
    });

    return {
      id: base64,
      messageId: newMessage._id,
      conversationId: conversation.id,
      senderId: user.id,
      content
    };
  }
};
