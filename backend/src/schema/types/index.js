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
    users: {
      type: userConnection,
      args: {
        first: {
          type: GraphQLInt
        },
        after: {
          type: GraphQLString
        }
      },
      resolve: async (parent, args, context) => {
        if (!context.user) {
          return null;
        }
        const { user } = context;

        const users = await User.find({ _id: { $ne: user.id } }).limit(2);

        return connectionFromArray(users.map(getUserFromConnection), {});
      }
    },
    feed: {
      type: conversationConnection,
      args: connectionArgs,
      resolve: async (parentValue, args, context) => {
        if (!context.user) {
          return null;
        }
        const { user } = context;
        const feed = await Conversation.aggregate([
          {
            $match: {
              recipients: {
                $in: [mongoose.Types.ObjectId(user.id)]
              }
            }
          },
          {
            $lookup: {
              from: 'Message',
              localField: '_id',
              foreignField: 'conversationId',
              as: 'messages'
            }
          },
          {
            $lookup: {
              from: 'User',
              localField: 'recipients',
              foreignField: '_id',
              as: 'recipients'
            }
          }
        ]);

        return feed;
      }
    },
    isTokenAuthenticated: {
      type: userType,
      resolve(parentValue, _, context) {
        if (context && context.state && context.user) {
          const { user } = context;
          return user;
        }
        return null;
      }
    }
  })
});

export default RootQuery;
