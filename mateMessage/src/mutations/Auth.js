import gql from 'graphql-tag';

export const SignInMutation = gql`
  mutation SignIn($username: String!, $password: String!) {
    signIn(username: $username, password: $password){
      state
      message
      user {
        id
        name
        email
        username
        jwt
      }
    }
  }
`;

export const SignUpMutation = gql`
  mutation SignUp($email: String!, $name: String!, $username: String!, $password: String!) {
    signUp(email: $email, name: $name, username: $username, password: $password) {
      state
      message
      user {
        id
        name
        email
        username
        jwt
      }
    }
  }
`;

export const TokenAuthMutation = gql`
  mutation IsTokenAuthenticated {
    isTokenAuthenticated {
      state
      user {
        id
        name
        username
        email
        jwt
      }
    }
  }
`;