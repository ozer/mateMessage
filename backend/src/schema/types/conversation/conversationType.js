import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList
} from 'graphql';
import {
  globalIdField,
  connectionArgs,
  connectionDefinitions,
  connectionFromArray
} from 'graphql-relay';
import { nodeInterface } from '../node/nodeDefinition';
import { messageConnection } from '../message/messageType';
import recipientType from '../recipient/recipientType';
import { idMapping } from '../../../helpers/mapping';
import Conversation from '../../../db/models/Conversation';
import { resolveCursor } from '../../schemaHelper/connectionHelper';

const getMessage = obj => {
  return obj;
};

const conversationType = new GraphQLObjectType({
  name: 'Conversation',
  fields: () => ({
    id: globalIdField('Conversation', idMapping),
    conversationId: {
      type: GraphQLString,
      resolve: idMapping
    },
    title: {
      type: GraphQLString
    },
    avatar: {
      type: GraphQLString
    },
    messages: {
      type: messageConnection,
      args: connectionArgs,
      resolve: (parent, args, context) => {
        if (!context.user) {
          return null;
        }
        return connectionFromArray(parent.messages.map(getMessage), args);
      }
    },
    recipients: {
      type: GraphQLList(recipientType)
    }
  }),
  interfaces: [nodeInterface]
});

export const { connectionType: conversationConnection } = connectionDefinitions(
  {
    nodeType: conversationType,
    resolveCursor: ({ node }) => {
      return resolveCursor({ type: 'Conversation', id: node._id });
    },
  },
);

export default conversationType;
