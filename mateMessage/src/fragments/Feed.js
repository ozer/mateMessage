import gql from "graphql-tag";

export const FeedFragment = gql`
  fragment FeedFragment on ConversationConnection {
    edges {
      node {
        id
        recipients {
          id
          name
        }
        messages {
          edges {
            node {
              id
              content
            }
          }
        }
      }
    }
  }
`;
