import gql from 'graphql-tag';

export const Users = gql`
  query People {
    people {
      username
      id
      name
      email
    }
  }
`;

export const ConversationsQuery = gql`
  query ($id: String){
    feed(id: $id){
      id
      recipients {
        id
        name
      }
      messages {
        id
        content
        sender {
          id
        }
      }
    }
  }
`;

export const FindConversation = gql`
  query FindConversation($id: String) {
    feed(id: $id) {
      id
      recipients {
        id
        name
      }
      messages {
        id
        content
        sender {
          id
        }
      }
    }
  }
`;