import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLBoolean
} from 'graphql';
import MessageType from './MessageType';
import UserType from './UserType';
import ConversationType from './ConversationType';

export const SearchResponse = new GraphQLObjectType({
  name: 'SearchResponse',
  fields: () => ({
    state: {
      type: GraphQLBoolean,
      default: false,
    },
    searchData: {
      type: GraphQLList(UserType)
    }
  }),
});

export const CreateConversationResponse = new GraphQLObjectType({
  name: 'CreateConversationResponse',
  fields: () => ({
    state: {
      type: GraphQLBoolean,
      default: false
    },
    conversationData: {
      type: ConversationType
    }
  })
});

export const SendMessageResponse = new GraphQLObjectType({
  name: 'SendMessageResponse',
  fields: () => ({
    state: {
      type: GraphQLBoolean,
      default: false
    },
    messageData: {
      type: MessageType,
    }
  })
});

export const SignInResponse = new GraphQLObjectType({
  name: 'SignInResponse',
  fields: () => ({
    state: {
      type: GraphQLBoolean,
      default: false
    },
    message: {
      type: GraphQLString,
    },
    user: {
      type: UserType
    }
  })
});

export const SignUpResponse = new GraphQLObjectType({
  name: 'SignUpResponse',
  fields: () => ({
    state: {
      type: GraphQLBoolean,
      default: false
    },
    message: {
      type: GraphQLString,
    },
    user: {
      type: UserType
    }
  })
});