import { PubSub } from 'apollo-server-express';
import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import messageType from '../types/message/messageType';
const pubSub = new PubSub();

export const sendMessageToRecipients = ({
  recipients,
  conversationId,
  senderId,
  messageId,
  content
}) => {
  console.log('sendMessageToRecipients -> ', conversationId);
  for (const recipient of recipients) {
    if (senderId !== recipient.id) {
      publishMessage({
        content,
        conversationId,
        senderId,
        messageId,
        recipientId: recipient.id,
        recipients
      });
    }
  }
};

export const publishMessage = ({
  content,
  conversationId,
  senderId,
  messageId,
  recipientId,
  recipients
}) => {
  return pubSub.publish(recipientId, {
    messageCreated: {
      id: messageId,
      content,
      conversation: {
        id: conversationId,
        recipients
      },
      sender: {
        id: senderId
      }
    }
  });
};

const subscriptions = new GraphQLObjectType({
  name: 'subscription',
  fields: {
    messageCreated: {
      type: messageType,
      subscribe: (params, {}, context) => {
        console.log('messageCreated Subscribed');
        console.log('new Message');
        if (context && context.user) {
          const { user } = context;
          console.log('Subscribing to messageCreated -> ', user.id);
          const subscriptionPath = user.id;
          return pubSub.asyncIterator([subscriptionPath]);
        }
        return null;
      }
    }
  }
});

export default subscriptions;
