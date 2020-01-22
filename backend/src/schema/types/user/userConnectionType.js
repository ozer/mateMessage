import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import pageInfoType from '../pageInfo/pageInfoType';
import userEdgeType from './userEdgeType';

const userConnectionType = new GraphQLObjectType({
  name: 'UserConnection',
  fields: () => ({
    edges: {
      type: new GraphQLList(userEdgeType),
      resolve: async (parent, _, context) => {
        const { userLoader } = context;
        const result = await parent.query;
        for (const user of result) {
          userLoader.prime(user._id, user);
        }
        return result;
      }
    },
    pageInfo: {
      type: new GraphQLNonNull(pageInfoType)
    }
  })
});

export default userConnectionType;
