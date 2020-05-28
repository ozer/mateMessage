import gql from 'graphql-tag';

export const HomeQuery = gql`
  query HomeQuery {
    viewer {
      id
      userId
      email
      name
      username
      messageCount
    }
  }
`;
