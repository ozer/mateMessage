import {
  GraphQLObjectType,
} from 'graphql';
import { sendMessageMutation } from './sendMessage/sendMessageMutation';
import { createConversationMutation } from './createConversation/createConversationMutation';
import { createGroupConversationMutation } from './createGroupConversation/createGroupConversationMutation';
import { sendIsTypingMutation } from './sendIsTyping/sendIsTypingMutation';

const mutations = new GraphQLObjectType({
  name: 'mutation',
  fields: () => ({
    sendMessage: sendMessageMutation,
    sendIsTyping: sendIsTypingMutation,
    createConversation: createConversationMutation,
    createGroupConversation: createGroupConversationMutation
  })
});

export default mutations;
