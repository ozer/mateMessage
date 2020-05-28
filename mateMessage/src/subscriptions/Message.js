import gql from 'graphql-tag';

export const ConversationCreated = gql`
  subscription ConversationCreated {
    convoCreated {
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
          hasNextPage
          hasPreviousPage
        }
        edges {
          cursor
          node {
            id
          }
        }
      }
    }
  }
`;

export const MessageCreated = gql`
  subscription MessageCreated {
    messageCreated {
      id
      messageId
      senderId
      conversationId
      content
      created_at
      onFlight @client
    }
  }
`;
