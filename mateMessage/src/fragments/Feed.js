import gql from 'graphql-tag';

export const Convo = gql`
  fragment Convo on Conversation {
    id
  }
`;
