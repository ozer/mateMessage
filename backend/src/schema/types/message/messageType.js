import { GraphQLObjectType, GraphQLString } from 'graphql';
import { globalIdField, connectionDefinitions } from 'graphql-relay';
import { nodeInterface } from '../node/nodeDefinition';
import { idMapping } from '../../../helpers/mapping';
import Message from '../../../db/models/Message';
import { resolveCursor } from '../../schemaHelper/connectionHelper';

const messageType = new GraphQLObjectType({
  name: 'Message',
  fields: () => ({
    id: globalIdField('Message', idMapping),
    messageId: {
      type: GraphQLString,
      resolve: idMapping
    },
    content: {
      type: GraphQLString
    },
    senderId: {
      type: GraphQLString
    },
    conversationId: {
      type: GraphQLString
    },
    created_at: {
      type: GraphQLString
    }
  }),
  interfaces: [nodeInterface]
});

export const { connectionType: messageConnection } = connectionDefinitions({
  nodeType: messageType,
  resolveCursor: ({ node }) => {
    return resolveCursor({ type: 'Message', id: node._id });
  }
});

export default messageType;
