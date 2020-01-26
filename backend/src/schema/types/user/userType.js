import { GraphQLObjectType, GraphQLString } from 'graphql';
import { nodeInterface } from '../node/nodeDefinition';
import { idMapping } from '../../../helpers/mapping';
import { globalIdField } from 'graphql-relay';
import User from '../../../db/models/User';

const userType = new GraphQLObjectType({
  name: 'User',
  isTypeOf: obj => {
   if (obj instanceof User) {
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

export default userType;
