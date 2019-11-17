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
      content
      conversation {
        id
        recipients {
          id
          recipient {
            id
            name
          }
        }
      }
    }
  }
`;
