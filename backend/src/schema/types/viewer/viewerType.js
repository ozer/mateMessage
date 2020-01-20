import { GraphQLObjectType, GraphQLString } from 'graphql';
import mongoose from 'mongoose';
import {
  globalIdField,
  connectionFromArray,
  connectionArgs
} from 'graphql-relay';
import { nodeInterface } from '../node/nodeDefinition';
import Conversation from '../../../db/models/Conversation';
import { idMapping } from '../../../helpers/mapping';
import User from '../../../db/models/User';
import conversationConnectionType from '../conversation/conversationConnectionType';
import { findConversations } from '../conversation/conversationMongoHelper';
import { createConnectionArguments } from '../../../db/helpers/pagination';

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
    // mates: {
    //   type: userConnection,
    //   args: connectionArgs,
    //   resolve: async (parentVal, args, context) => {
    //     console.log('resolver of mates');
    //     if (!context.user) {
    //       return null;
    //     }
    //     const { user } = context;
    //     const mates = await User.find({ _id: { $ne: user.id } });
    //     return connectionFromArray(mates, args);
    //   }
    // },
    allConversations: {
      type: conversationConnectionType,
      args: createConnectionArguments(),
      resolve: (parent, args, context) => {
        if (!context.user) {
          return null;
        }
        return findConversations(args);
      }
    },
    // feed: {
    //   type: conversationConnection,
    //   args: connectionArgs,
    //   resolve: async (parentValue, args, context) => {
    //     if (context && context.user) {
    //       const { user } = context;
    //
    //       const feed = await Conversation.find({
    //         recipients: {
    //           $in: [user.id]
    //         }
    //       });
    //
    //       return connectionFromArray(feed.map(getConversation), args);
    //     }
    //     return null;
    //   }
    // }
  }),
  interfaces: [nodeInterface]
});

export default viewerType;
