import { GraphQLObjectType } from 'graphql';
import { nodeField } from './node/nodeDefinition';
import viewerType from './viewer/viewerType';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    viewer: {
      type: viewerType,
      resolve: (parent, args, context) => {
        if (!context.user) {
          return null;
        }
        context.user.isViewer = true;
        return context.user;
      }
    },
    node: nodeField
  })
});

export default RootQuery;
