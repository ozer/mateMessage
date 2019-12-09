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
    id: {
      type: GraphQLString,
      resolve: (parentVal) => {
        if (parentVal.id) {
          return parentVal.id.toString();
        }

        if(parentVal._id) {
          return parentVal._id.toString();
        }

        return null;
      }
    },
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
      type: GraphQLList(
        new GraphQLObjectType({
          name: 'recipients',
          fields: () => ({
            id: {
              type: GraphQLString,
              resolve: (parentVal) => {
                if (parentVal.id) {
                  return parentVal.id.toString();
                }

                if(parentVal._id) {
                  return parentVal._id.toString();
                }

                return null;
              },
            },
            name: {
              type: GraphQLString
            },
            email: {
              type: GraphQLString
            }
          })
        })
      )
    },
  })
});

export default ConversationType;
