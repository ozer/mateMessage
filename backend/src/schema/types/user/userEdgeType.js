import { GraphQLObjectType } from 'graphql';
import cursorType from '../cursor/cursorType';
import userType from './userType';

const userEdgeType = new GraphQLObjectType({
  name: 'UserEdge',
  fields: () => ({
    cursor: {
      type: cursorType,
      resolve: parent => {
        return {
          value: parent._id.toString()
        };
      }
    },
    node: {
      type: userType,
      resolve: parent => parent
    }
  }),
});

export default userEdgeType;