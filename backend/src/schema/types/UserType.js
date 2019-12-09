import { GraphQLObjectType, GraphQLString, GraphQLID } from 'graphql';
import mongoose from 'mongoose';

const User = mongoose.model('User');

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    name: {
      type: GraphQLString
    },
    username: {
      type: GraphQLString
    },
    email: {
      type: GraphQLString
    },
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
      }
    },
    jwt: {
      type: GraphQLString
    },
    avatar: {
      type: GraphQLString
    }
  })
});

export default UserType;
