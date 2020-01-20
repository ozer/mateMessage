import { GraphQLObjectType } from 'graphql';
import cursorType from '../cursor/cursorType';
import messageType from './messageType';

const messageEdgeType = new GraphQLObjectType({
  name: 'MessageEdge',
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
      type: messageType,
      resolve: parent => parent
    }
  })
});

export default messageEdgeType;
