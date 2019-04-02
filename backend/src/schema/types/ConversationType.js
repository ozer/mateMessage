import {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList} from 'graphql';
import mongoose from 'mongoose';
import UserType from './UserType';
import MessageType from './MessageType';

const ConversationType = new GraphQLObjectType({
  name: 'ConversationType',
  fields: () => ({
    title: {
      type: GraphQLString,
    },
    avatar: {
      type: GraphQLString,
    },
    recipients: {
      type: GraphQLList(UserType),
    },
    messages: {
      type: GraphQLList(MessageType),
    },
    id: {
      type: GraphQLID,
    },
  })
});

export default ConversationType;