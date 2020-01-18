import gql from 'graphql-tag';

export const ConversationCreated = gql`
  subscription ConversationCreated {
    conversationCreated {
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
            conversationId
            senderId
            content
            onFlight @client
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
      senderId
      messageId
      conversationId
      content
      created_at
      onFlight @client
    }
  }
`;
