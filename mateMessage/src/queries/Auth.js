import gql from 'graphql-tag';

export const Person = gql`
  query Person {
    id
    username
    email
    name
    jwt
  }
`;