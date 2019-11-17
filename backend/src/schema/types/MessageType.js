import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from 'graphql';
import mongoose from 'mongoose';
import UserType from './UserType';
import ConversationType from './ConversationType';

const MessageType = new GraphQLObjectType({
  name: 'Message',
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    content: {
      type: GraphQLString,
    },
    sender: {
      type: UserType,
    },
    conversation: {
      type: ConversationType,
    },
  }),
});

export default MessageType;