import gql from 'graphql-tag';

export const CreateConversation = gql`
  mutation CreateConversation($recipientId: String!) {
    createConversation(recipientId: $recipientId) {
      id
      conversationId
      title
      recipients {
        id
        name
      }
      messages {
        edges {
          node {
            id
            messageId
            senderId
            conversationId
            content
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
      messageId
      conversationId
      senderId
      content
      __typename
    }
  }
`;
