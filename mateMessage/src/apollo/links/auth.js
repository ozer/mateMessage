import { setContext } from 'apollo-link-context';
import { AsyncStorage } from 'react-native';

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem('token', null);
  // return the headers to the context so http can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

export default authLink;