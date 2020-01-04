import gql from 'graphql-tag';

export const ConversationCreated = gql`
  subscription ConversationCreated {
    conversationCreated {
      id
      recipients {
        id
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
    }
  }
`;
