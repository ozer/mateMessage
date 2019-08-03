import { PubSub } from 'apollo-server-express';
import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import MessageType from '../types/MessageType';
import ConversationType from '../types/ConversationType';
const pubSub = new PubSub();

export const publishMessage = params => {
  console.log('Params in publishMessage -> ', params);
  const { receiverId, content, conversationId, senderId, messageId } = params;
  const subscriptionPath = `${receiverId}-message`;
  pubSub.publish(subscriptionPath, {
    messageCreated: {
      id: messageId,
      content,
      conversation: {
        id: conversationId,
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
  pubSub.publish(subscriptionPath, {
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
      subscribe: (params, {}, context) => {
        console.log('messageCreated Subscribed');
        if (context && context.user) {
          const { user } = context;
          const { _id } = user;
          console.log('Subscribing to messageCreated -> ', _id);
          const subscriptionPath = `${_id}-message`;
          return pubSub.asyncIterator([subscriptionPath]);
        }
        return null;
      }
    },
    conversationCreated: {
      type: ConversationType,
      subscribe: (params, {}, context) => {
        if (context && context.user) {
          const { user } = context;
          const { _id } = user;
          console.log('Subscribing to conversationCreated ->', _id);
          const subscriptionPath = `${_id}-conversation`;
          return pubSub.asyncIterator([subscriptionPath]);
        }
        return null;
      }
    }
  }
});

export default subscriptions;
