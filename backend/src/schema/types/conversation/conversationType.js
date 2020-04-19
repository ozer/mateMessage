import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { nodeInterface } from '../node/nodeDefinition';
import { idMapping } from '../../../helpers/mapping';
import Conversation from '../../../db/models/Conversation';
import userType from '../user/userType';
import messageConnectionType from '../message/messageConnectionType';
import { createConnectionArguments } from '../../../db/helpers/pagination';
import { findMessages } from '../message/messageMongoHelper';

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
    created_at: {
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
          $and: [
            {
              conversationId: convoId
            }
          ]
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

        const { userLoader } = context;
        const recipients = await userLoader.loadMany(parent.recipients);

        return recipients;
      }
    }
  }),
  interfaces: [nodeInterface]
});

export default conversationType;
