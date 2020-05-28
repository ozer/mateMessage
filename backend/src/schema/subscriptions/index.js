import { PubSub } from 'apollo-server-express';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLNonNull
} from 'graphql';
import messageType from '../types/message/messageType';
import conversationType from '../types/conversation/conversationType';
const pubSub = new PubSub();

const MESSAGE_TOPIC = 'MESSAGE';
const CONVERSATION_TOPIC = 'CONVERSATION';

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
    if (!recipient._id) {
      return null;
    }
    if (senderId !== recipient._id.toString()) {
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
  recipients,
  created_at
}) => {
  for (const recipient of recipients) {
    if (true) {
      publishConversation({
        id,
        recipients,
        created_at,
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
  return pubSub.publish(`${recipientId}:${MESSAGE_TOPIC}`, {
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

export const publishConversation = async ({
  id,
  recipients,
  title = '',
  recipientId,
  created_at
}) => {
  const subscriptionPath = `${recipientId}:${CONVERSATION_TOPIC}`;
  return pubSub.publish(subscriptionPath, {
    convoCreated: {
      id,
      title,
      created_at,
      recipients,
      messages: {
        __typename: 'MessageConnection',
        pageInfo: {
          __typename: 'PageInfo',
          hasPreviousPage: false,
          hasNextPage: false
        },
        edges: []
      }
    }
  });
};

const subscriptions = new GraphQLObjectType({
  name: 'subscription',
  fields: {
    convoCreated: {
      type: new GraphQLNonNull(conversationType),
      subscribe: (params, {}, context) => {
        if (!context.user) {
          return null;
        }
        const { user } = context;
        const subscriptionPath = `${user.id}:${CONVERSATION_TOPIC}`;
        console.log(
          'subscriptionPath from convoCreated: ',
          subscriptionPath,
          user.name
        );
        return pubSub.asyncIterator(subscriptionPath);
      }
    },
    messageCreated: {
      type: messageType,
      subscribe: (params, {}, context) => {
        if (!context.user) {
          return null;
        }
        const { user } = context;
        const subscriptionPath = `${user.id}:${MESSAGE_TOPIC}`;
        return pubSub.asyncIterator(subscriptionPath);
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
