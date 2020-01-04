import gql from 'graphql-tag';

export const Viewer = gql`
  query Viewer {
    viewer {
      id
      userId
      email
      name
      username
    }
  }
`;