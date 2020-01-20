import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import messageEdgeType from './messageEdgeType';
import pageInfoType from '../pageInfo/pageInfoType';

const messageConnectionType = new GraphQLObjectType({
  name: 'MessageConnection',
  fields: () => ({
    edges: {
      type: new GraphQLList(messageEdgeType),
      resolve: async parent => {
        const result = await parent.query;
        return result;
      }
    },
    pageInfo: {
      type: new GraphQLNonNull(pageInfoType)
    }
  })
});

export default messageConnectionType;