import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import pageInfoType from '../pageInfo/pageInfoType';
import userEdgeType from './userEdgeType';

const userConnectionType = new GraphQLObjectType({
  name: 'UserConnection',
  fields: () => ({
    edges: {
      type: new GraphQLList(userEdgeType),
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

export default userConnectionType;
