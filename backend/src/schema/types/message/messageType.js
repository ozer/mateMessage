import { GraphQLObjectType, GraphQLString } from 'graphql';
import { globalIdField } from 'graphql-relay';
import { nodeInterface } from '../node/nodeDefinition';
import { idMapping } from '../../../helpers/mapping';
import Message from '../../../db/models/Message';
import userType from '../user/userType';

const messageType = new GraphQLObjectType({
  name: 'Message',
  fields: () => ({
    id: globalIdField('Message', idMapping),
    messageId: {
      type: GraphQLString,
      resolve: idMapping
    },
    content: {
      type: GraphQLString
    },
    senderId: {
      type: GraphQLString
    },
    // sender: {
    //   type: userType,
    //   resolve: async (parent, _, context) => {
    //     const { userLoader } = context;
    //     const { senderId } = parent;
    //     const sender = await userLoader.load(senderId);
    //     return sender;
    //   }
    // },
    conversationId: {
      type: GraphQLString
    },
    created_at: {
      type: GraphQLString
    }
  }),
  interfaces: [nodeInterface]
});


export default messageType;
