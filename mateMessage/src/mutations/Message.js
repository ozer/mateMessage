import gql from 'graphql-tag';

export const CreateConversation = gql`
  mutation CreateConversation($recipientId: String!) {
    createConversation(recipientId: $recipientId) {
      id
      conversationId
      title
      recipients {
        id
        userId
        name
      }
      messages {
        pageInfo {
          hasPreviousPage
          hasNextPage
        }
        edges {
          node {
            id
            messageId
            senderId
            conversationId
            content
            created_at
          }
        }
      }
    }
  }
`;

export const SendMessage = gql`
  mutation SendMessage(
    $content: String!
    $conversationId: String!
    $created: String!
  ) {
    sendMessage(
      content: $content
      conversationId: $conversationId
      created: $created
    ) {
      id
      messageId
      conversationId
      senderId
      content
      created_at
      __typename
    }
  }
`;
