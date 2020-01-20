import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import {
  globalIdField,
} from 'graphql-relay';
import { nodeInterface } from '../node/nodeDefinition';
import { idMapping } from '../../../helpers/mapping';
import Conversation from '../../../db/models/Conversation';
import User from '../../../db/models/User';
import userType from '../user/userType';
import messageConnectionType from '../message/messageConnectionType';
import { createConnectionArguments } from '../../../db/helpers/pagination';
import { findMessages } from '../message/messageMongoHelper';

const getMessage = obj => {
  return obj;
};

const conversationType = new GraphQLObjectType({
  name: 'Conversation',
  isTypeOf: obj => {
    if (obj.recipients) {
      return obj;
    }
  },
  fields: () => ({
    id: globalIdField('Conversation', idMapping),
    conversationId: {
      type: GraphQLString,
      resolve: idMapping
    },
    title: {
      type: GraphQLString,
      resolve: (parent, _, context) => {
        return parent.title;
      }
    },
    avatar: {
      type: GraphQLString
    },
    messages: {
      type: messageConnectionType,
      args: createConnectionArguments(),
      resolve: (parent, args, context) => {
        if (!context.user) {
          return null;
        }
        const convoId = parent._id ? parent._id : parent.id;
        const queryParams = {
          conversationId: convoId
        };
        return findMessages(args, queryParams);
      }
    },
    recipients: {
      type: GraphQLList(userType),
      resolve: async (parent, args, context) => {
        if (!context.user) {
          return null;
        }

        const recipients = await User.find(
          { _id: { $in: parent.recipients } },
          { password: 0, jwt: 0 }
        );
        return recipients;
      }
    }
  }),
  interfaces: [nodeInterface]
});

// export const { connectionType: conversationConnection } = connectionDefinitions(
//   {
//     nodeType: conversationType,
//     resolveCursor: ({ node }) => {
//       return resolveCursor({ type: 'Conversation', id: node._id });
//     }
//   }
// );

export default conversationType;
