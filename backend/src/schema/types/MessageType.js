import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList
} from 'graphql';
import mongoose from 'mongoose';
import UserType from './UserType';
import ConversationType from './ConversationType';

const MessageType = new GraphQLObjectType({
  name: 'Message',
  fields: () => ({
    id: {
      type: GraphQLID,
      resolve: (parentVal) => {
        console.log('conversation id ', parentVal);
        if (parentVal.id) {
          return parentVal.id.toString();
        }

        if(parentVal._id) {
          return parentVal._id.toString();
        }

        return null;
      },
    },
    content: {
      type: GraphQLString
    },
    sender: {
      type: UserType
    },
    created_at: {
      type: GraphQLString
    },
    conversation: {
      type: ConversationType
    }
  })
});

export default MessageType;
