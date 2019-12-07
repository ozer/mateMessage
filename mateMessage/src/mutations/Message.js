import gql from 'graphql-tag';

export const CreateConversation = gql`
  mutation CreateConversation($receiverId: String!) {
    createConversation(receiverId: $receiverId) {
      state
      conversationData {
        id
        recipients {
          id
          name
        }
        messages {
          id
          content
          sender {
            id
          }
        }
      }
    }
  }
`;

export const SendMessage = gql`
  mutation SendMessage($content: String!, $conversationId: String) {
    sendMessage(content: $content, conversationId: $conversationId) {
	  id
      content
    }
  }
`;
