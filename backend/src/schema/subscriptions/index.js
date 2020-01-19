import { PubSub } from 'apollo-server-express';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean
} from 'graphql';
import messageType from '../types/message/messageType';
import conversationType from '../types/conversation/conversationType';
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
  recipients,
  created_at
}) => {
  for (const recipient of recipients) {
    if (senderId !== recipient.id) {
      publishMessage({
        id,
        messageId,
        conversationId,
        senderId,
        recipientId: recipient.id,
        content,
        created_at
      });
    }
  }
};

export const sendConversationToRecipients = ({
  id,
  conversationId,
  senderId,
  title,
  messages,
  recipients
}) => {
  for (const recipient of recipients) {
    if (senderId !== recipient.id) {
      console.log('publishing conversation ', id);
      publishConversation({
        id,
        conversationId,
        messages,
        recipients,
        title,
        recipientId: recipient.id
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
  content,
  created_at
}) => {
  return pubSub.publish(recipientId, {
    messageCreated: {
      id,
      messageId,
      conversationId,
      content,
      senderId,
      created_at
    }
  });
};

export const publishConversation = ({
  id,
  conversationId,
  recipients,
  messages,
  title,
  recipientId
}) => {
  return pubSub.publish(recipientId, {
    conversationCreated: {
      id,
      conversationId,
      recipients,
      messages: {
        __typename: 'MessageConnection',
        edges: []
      },
      title
    }
  });
};

const subscriptions = new GraphQLObjectType({
  name: 'subscription',
  fields: {
    conversationCreated: {
      type: conversationType,
      subscribe: (params, {}, context) => {
        if (!context.user) {
          return null;
        }
        const { user } = context;
        console.log('Subscribing to conversationCreated -> ', user.id);
        const subscriptionPath = user.id;
        return pubSub.asyncIterator([subscriptionPath]);
      }
    },
    messageCreated: {
      type: messageType,
      subscribe: (params, {}, context) => {
        if (!context.user) {
          return null;
        }
        const { user } = context;
        console.log('Subscribing to messageCreated -> ', user.id);
        const subscriptionPath = user.id;
        return pubSub.asyncIterator([subscriptionPath]);
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
