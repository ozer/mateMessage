import gql from 'graphql-tag';

export const Users = gql`
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
  }
`;

export const Feed = gql`
  query FindConversation($id: String) {
    feed(id: $id) {
      id
      ...FeedFragment
    }
  }

  fragment FeedFragment on Conversation {
    id
    messages {
      id
      content
    }
    recipients {
      id
      recipient {
        id
        name
      }
    }
  }
`;