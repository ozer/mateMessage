import { GraphQLObjectType, GraphQLNonNull, GraphQLBoolean } from 'graphql';

const pageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    hasPreviousPage: {
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  }
});

export default pageInfoType;