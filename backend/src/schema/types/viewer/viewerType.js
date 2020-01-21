import { GraphQLObjectType, GraphQLString } from 'graphql';
import {
  globalIdField,
} from 'graphql-relay';
import { nodeInterface } from '../node/nodeDefinition';
import { idMapping } from '../../../helpers/mapping';
import conversationConnectionType from '../conversation/conversationConnectionType';
import { findConversations } from '../conversation/conversationMongoHelper';
import { createConnectionArguments } from '../../../db/helpers/pagination';
import userConnectionType from '../user/userConnectionType';
import { findUsers } from '../user/userMongoHelper';

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
      type: userConnectionType,
      args: createConnectionArguments(),
      resolve: async (parentVal, args, context) => {
        if (!context.user) {
          return null;
        }
        const { user } = context;
        const queryParams = {
          _id: { $ne: user.id }
        };
        return await findUsers(args, queryParams);
      }
    },
    feed: {
      type: conversationConnectionType,
      args: createConnectionArguments(),
      resolve: (parent, args, context) => {
        if (!context.user) {
          return null;
        }
        const { user } = context;
        const queryParams = {
          recipients: {
            $in: [user.id]
          }
        };
        return findConversations(args, queryParams);
      }
    }
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
