import gql from "graphql-tag";

export const FeedFragment = gql`
  fragment FeedFragment on Conversation {
    id
    messages {
      id
      content
      onFlight @client		
    }
    recipients {
      id
      name
      email
    }
  }
`;
