import axios from 'axios';
const url = `http://localhost:4000/graphql`;

// 1-) SET DB ENV URL
// 2-) CLEAR DB FIRST!
// 3-) ALSO TEST TO SIGN UP A USER WHICH ALREADY SIGNED UP.

export const signIn = async ({ username = '', password = '' }) => {
  try {
    const response = await axios.post(url, {
      query: `mutation SignIn($username: String!, $password: String!) {
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
                  }`,
      variables: { username, password }
    });
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const signUp = async ({ email, name, username, password }) => {
  try {
    const response = await axios.post(url, {
      query: `mutation SignUp($email: String!, $name: String!, $username: String!, $password: String!) {
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
          }`,
      variables: { email, name, username, password }
    });
    return response.data.data;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const isTokenAuthenticated = async ({ token }) => {
  try {
    const response = await axios.post(
      url,
      {
        query: `mutation IsTokenAuthenticated {
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
          }`
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.data;
  } catch (e) {
    // console.log(e);
    throw e;
  }
};
