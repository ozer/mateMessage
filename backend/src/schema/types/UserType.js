import { GraphQLObjectType, GraphQLString, GraphQLID } from 'graphql';
import mongoose from 'mongoose';

const User = mongoose.model('User');

const UserType = new GraphQLObjectType({
  name: 'UserType',
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
      type: GraphQLID
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
