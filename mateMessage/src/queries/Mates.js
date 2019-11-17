import gql from 'graphql-tag';

export const Mates = gql`
query People {
    people {
      ...PeopleFragment
    }
  }

  fragment PeopleFragment on User {
    id
    username
    name
    email
  }`;