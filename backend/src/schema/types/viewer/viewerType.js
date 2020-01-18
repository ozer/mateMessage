import { GraphQLObjectType, GraphQLString } from 'graphql';
import {
  globalIdField,
  connectionFromArray,
  connectionArgs
} from 'graphql-relay';
import mongoose from 'mongoose';
import { nodeInterface } from '../node/nodeDefinition';
import { userConnection } from '../user/userType';
import { conversationConnection } from '../conversation/conversationType';
import Conversation from '../../../db/models/Conversation';
import { idMapping } from '../../../helpers/mapping';
import User from '../../../db/models/User';

const getConversation = obj => {
  return obj;
};

const viewerType = new GraphQLObjectType({
  name: 'Viewer',
  isTypeOf: obj => {
    if (obj.isViewer) {
      return obj;
    }
  },
  fields: () => ({
    id: globalIdField('Viewer', idMapping),
    userId: {
      type: GraphQLString,
      resolve: idMapping
    },
    name: {
      type: GraphQLString
    },
    username: {
      type: GraphQLString
    },
    email: {
      type: GraphQLString
    },
    avatar: {
      type: GraphQLString
    },
    mates: {
      type: userConnection,
      args: connectionArgs,
      resolve: async (parentVal, args, context) => {
        console.log('resolver of mates');
        if (!context.user) {
          return null;
        }
        const { user } = context;
        const mates = await User.find({ _id: { $ne: user.id } });
        return connectionFromArray(mates, args);
      }
    },
    feed: {
      type: conversationConnection,
      args: connectionArgs,
      resolve: async (parentValue, args, context) => {
        console.log('Fetching feed!', args);
        if (context && context.user) {
          const { user } = context;

          const feed = await Conversation.find({
            recipients: {
              $in: [user.id]
            }
          });

          // const feed = await Conversation.aggregate([
          //   {
          //     $match: {
          //       recipients: {
          //         $in: [mongoose.Types.ObjectId(user.id)]
          //       }
          //     }
          //   },
          //   {
          //     $lookup: {
          //       from: 'Message',
          //       localField: '_id',
          //       foreignField: 'conversationId',
          //       as: 'messages'
          //     }
          //   },
          //   {
          //     $lookup: {
          //       from: 'User',
          //       localField: 'recipients',
          //       foreignField: '_id',
          //       as: 'recipients'
          //     }
          //   },
          //   {
          //     $sort: { 'message._id': -1 }
          //   }
          // ]);

          return connectionFromArray(feed.map(getConversation), args);
        }
        return null;
      }
    }
  }),
  interfaces: [nodeInterface]
});

export default viewerType;
