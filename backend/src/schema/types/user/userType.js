import { GraphQLObjectType, GraphQLString, GraphQLID } from 'graphql';
import { nodeInterface } from '../node/nodeDefinition';
import { idMapping } from '../../../helpers/mapping';
import { globalIdField, connectionDefinitions } from 'graphql-relay';
import User from '../../../db/models/User';
import { resolveCursor } from '../../schemaHelper/connectionHelper';

const userType = new GraphQLObjectType({
  name: 'User',
  isTypeOf: obj => {
   if (!obj.isViewer) {
     return obj;
   }
  },
  fields: () => ({
    id: globalIdField('User', idMapping),
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
    }
  }),
  interfaces: [nodeInterface]
});

export const { connectionType: userConnection } = connectionDefinitions({
  nodeType: userType,
  resolveCursor: ({ node }) => {
    return resolveCursor({ type: 'User', id: node._id });
  },
});

export default userType;
