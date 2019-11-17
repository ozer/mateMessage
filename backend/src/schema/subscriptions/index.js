import { PubSub } from 'apollo-server-express';
import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import MessageType from '../types/MessageType';
import ConversationType from '../types/ConversationType';
const pubSub = new PubSub();

export const sendMessageToRecipients = ({ recipients, conversationId, senderId, messageId, content }) => {
  console.log('sendMessageToRecipients -> ', recipients);
  const recs = recipients.map(r => {
    return {
      id: r.id, recipient: { id: r.recipient.id, name: r.recipient.name }
    }
  })
  for (const recipient of recipients) {
    publishMessage({ content, conversationId, senderId, messageId, recipientId: recipient.recipient.id, recipients: recs });
  }
};

export const publishMessage = ({ content, conversationId, senderId, messageId, recipientId, recipients }) => {
  console.log('Params in publishMessage -> ', content, conversationId, senderId, messageId, recipientId);
  return pubSub.publish(recipientId, {
    messageCreated: {
      id: messageId,
      content,
      conversation: {
        id: conversationId,
        recipients
      },
      sender: {
        id: senderId,
      },
    }
  });
};

export const publishConversation = params => {
  console.log('Params in publishConversation -> ', params);
  const { receiverId, conversationId, recipients } = params;
  const subscriptionPath = `${receiverId}-conversation`;
  return pubSub.publish(subscriptionPath, {
    conversationCreated: {
      id: conversationId,
      recipients
    }
  });
};

const subscriptions = new GraphQLObjectType({
  name: 'subscription',
  fields: {
    messageCreated: {
      type: MessageType,
      subscribe: (params, { }, context) => {
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
    },
    conversationCreated: {
      type: ConversationType,
      subscribe: (params, { }, context) => {
        if (context && context.user) {
          const { user } = context;
          const { _id } = user;
          console.log('Subscribing to conversationCreated ->', _id);
          const subscriptionPath = `${_id}-conversation`;
          return pubSub.asyncIterator([subscriptionPath]);
        }
        return null;
      }
    },
  },
});

export default subscriptions;
