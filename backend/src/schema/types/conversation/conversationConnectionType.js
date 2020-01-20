import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import conversationEdgeType from './conversationEdgeType';
import pageInfoType from '../pageInfo/pageInfoType';

const conversationConnectionType = new GraphQLObjectType({
  name: 'ConversationConnection',
  fields: () => ({
    edges: {
      type: new GraphQLList(conversationEdgeType),
      resolve: async (parent) => {
        const result = await parent.query;
        return result;
      },
    },
    pageInfo: {
      type: new GraphQLNonNull(pageInfoType),
    },
  }),
});

export default conversationConnectionType;