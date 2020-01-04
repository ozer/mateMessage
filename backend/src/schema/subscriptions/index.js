import { PubSub } from 'apollo-server-express';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean
} from 'graphql';
import messageType from '../types/message/messageType';
const pubSub = new PubSub();

export const sendIsTypingToRecipients = ({
  recipients,
  conversationId,
  senderId,
  isTyping
}) => {
  for (const recipient of recipients) {
    if (senderId !== recipient.id) {
      pubSub.publish(recipient.id, {
        isTyping: {
          conversationId,
          senderId,
          isTyping
        }
      });
    }
  }
};

export const sendMessageToRecipients = ({
  id,
  messageId,
  conversationId,
  senderId,
  content,
  recipients
}) => {
  console.log('recipients ', recipients);
  for (const recipient of recipients) {
    if (senderId !== recipient.id) {
      publishMessage({
        id,
        messageId,
        conversationId,
        senderId,
        recipientId: recipient.id,
        content
      });
    }
  }
};

export const publishMessage = ({
  id,
  messageId,
  conversationId,
  senderId,
  recipientId,
  content
}) => {
  return pubSub.publish(recipientId, {
    messageCreated: {
      id,
      messageId,
      conversationId,
      content,
      senderId
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
        if (context && context.user) {
          const { user } = context;
          console.log('Subscribing to messageCreated -> ', user.id);
          const subscriptionPath = user.id;
          return pubSub.asyncIterator([subscriptionPath]);
        }
        return null;
      }
    },
    isTyping: {
      type: new GraphQLObjectType({
        name: 'IsTyping',
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
      subscribe: (params, {}, context) => {
        if (!context.user) {
          return null;
        }
        const { user } = context;
        const subscriptionPath = user.id;
        return pubSub.asyncIterator([subscriptionPath]);
      }
    }
  }
});

export default subscriptions;
