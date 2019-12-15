import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLBoolean
} from 'graphql';
import messageType from './message/messageType';
import userType from './user/userType';
import conversationType from './conversation/conversationType';

export const SearchResponse = new GraphQLObjectType({
  name: 'SearchResponse',
  fields: () => ({
    state: {
      type: GraphQLBoolean,
      default: false
    },
    searchData: {
      type: GraphQLList(userType)
    }
  })
});

export const CreateConversationResponse = new GraphQLObjectType({
  name: 'CreateConversationResponse',
  fields: () => ({
    state: {
      type: GraphQLBoolean,
      default: false
    },
    conversationData: {
      type: conversationType
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
      type: messageType
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
      type: GraphQLString
    },
    user: {
      type: userType
    },
    jwt: {
      type: GraphQLString
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
      type: GraphQLString
    },
    user: {
      type: userType
    }
  })
});
