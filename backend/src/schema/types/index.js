import { GraphQLInt, GraphQLObjectType, GraphQLString } from 'graphql';
import mongoose, { ObjectId } from 'mongoose';
import { connectionArgs, connectionFromArray } from 'graphql-relay';
import { nodeField } from './node/nodeDefinition';
import userType, { userConnection } from './user/userType';
import { conversationConnection } from './conversation/conversationType';
import viewerType from './viewer/viewerType';

const User = mongoose.model('User');
const Conversation = mongoose.model('Conversation');

const getUserFromConnection = obj => obj;

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    viewer: {
      type: viewerType,
      resolve: (parent, args, context) => {
        if (!context.user) {
          return null;
        }
        context.user.isViewer = true;
        return context.user;
      }
    },
    node: nodeField,
    // users: {
    //   type: userConnection,
    //   args: {
    //     first: {
    //       type: GraphQLInt
    //     },
    //     after: {
    //       type: GraphQLString
    //     }
    //   },
    //   resolve: async (parent, args, context) => {
    //     if (!context.user) {
    //       return null;
    //     }
    //     const { user } = context;
    //
    //     const users = await User.find({ _id: { $ne: user.id } }).limit(2);
    //
    //     return connectionFromArray(users.map(getUserFromConnection), {});
    //   }
    // }
  })
});

export default RootQuery;
