import { GraphQLObjectType } from 'graphql';
import mongoose, { ObjectId } from 'mongoose';
import { connectionArgs } from 'graphql-relay';
import { nodeField } from './node/nodeDefinition';
import userType, { userConnection } from './user/userType';
import { conversationConnection } from './conversation/conversationType';
import viewerType from './viewer/viewerType';

const User = mongoose.model('User');
const Conversation = mongoose.model('Conversation');

ObjectId.prototype.valueOf = function() {
  console.log('asdasdas');
  return this.toString();
};

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
      args: connectionArgs
    },
    feed: {
      type: conversationConnection,
      args: connectionArgs,
      resolve: async (parentValue, args, context) => {
        console.log('Fetching feed!');
        console.log('args', args);
        if (context && context.user) {
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
        return null;
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
