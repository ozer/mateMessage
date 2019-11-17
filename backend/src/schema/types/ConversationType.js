import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList
} from 'graphql';
import mongoose from 'mongoose';
import UserType from './UserType';
import MessageType from './MessageType';

const ConversationType = new GraphQLObjectType({
  name: 'Conversation',
  fields: () => ({
    title: {
      type: GraphQLString
    },
    avatar: {
      type: GraphQLString
    },
    messages: {
      type: GraphQLList(MessageType)
    },
    recipients: {
      type: GraphQLList(new GraphQLObjectType({
        name: 'recipients',
        fields: () => ({
          id: {
            type: GraphQLString,
          },
          recipient: {
            type: UserType
          }
        })
      }))
    },
    id: {
      type: GraphQLID
    }
  })
});

export default ConversationType;
