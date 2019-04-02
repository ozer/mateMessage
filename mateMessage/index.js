import React from 'react';
import { AsyncStorage } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import { Person } from './src/queries/Auth';
import SplashScreen from './src/SplashScreen';
import { goAuth, goHome } from './navigation';
import Conversations from './src/containers/Conversations';
import Settings from './src/containers/Settings';
import SearchResult from './src/containers/Search/SearchResult';
import People from './src/containers/People';
import Conversation from './src/containers/Conversation';
import { TokenAuthMutation } from './src/mutations/Auth';
import { ConversationCreated } from './src/subscriptions/Message';
import { ConversationsQuery } from './src/queries/Feed';
import SignIn from './src/containers/Authentication/Signin';
import SignUp from './src/containers/Authentication/Signup';

const cache = new InMemoryCache();

export const persistor = new CachePersistor({
  cache,
  storage: AsyncStorage
});

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql'
});

console.log('mateMessage');
let token = '';

export const getToken = () => token;
export const setToken = newToken => token = newToken;

export const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    connectionCallback: () => {
      console.log('Connection callback!');
    },
    connectionParams: () => ({
      authToken: token
    })
  },
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem('token', null);
  console.log('authLink Token -> ', token);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

const link = split(
  ({ query }) => {
    console.log('Query -> ', query);
    const { kind, operation, name } = getMainDefinition(query);
    console.log('Name -> ', name);
    console.log('Kind -> ', kind);
    console.log('Operation -> ', operation);
    return kind === 'OperationDefinition' && operation === 'mutation';
  },
  authLink.concat(httpLink),
  wsLink
);

const mApolloClient = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

const withProvider = (Component, client = mApolloClient) => {
  return props => {
    return (
      <ApolloProvider client={client}>
        <Component {...props} />
      </ApolloProvider>
    );
  };
};

Navigation.registerComponent(`navigation.playground.SplashScreen`, () =>
  withProvider(SplashScreen)
);

Navigation.registerComponent('Auth.SignIn', () => withProvider(SignIn));

Navigation.registerComponent('Auth.SignUp', () => withProvider(SignUp));

Navigation.registerComponent('navigation.playground.Conversations', () =>
  withProvider(Conversations)
);

Navigation.registerComponent('navigation.playground.Conversation', () =>
  withProvider(Conversation)
);

Navigation.registerComponent('navigation.playground.People', () =>
  withProvider(People)
);

Navigation.registerComponent(
  'navigation.playground.SearchResult',
  () => SearchResult
);

Navigation.registerComponent('navigation.playground.Settings', () => withProvider(Settings));

const startApp = async () => {
  Navigation.events().registerAppLaunchedListener(async () => {
    await Navigation.setRoot({
      root: {
        component: {
          name: 'navigation.playground.SplashScreen',
          options: {
            topBar: {
              visible: false,
              drawBehind: true
            },
            layout: {
              orientation: ['portrait']
            }
          }
        }
      }
    });
  });

  try {
    await persistor.restore();
    console.log('Persistor is restored!');
    const Me = null;
    const token = await AsyncStorage.getItem('token');
    console.log('Token -> ', token);
    if (token) {
      console.log('Person', Me);
      const result = await mApolloClient.mutate({
        mutation: TokenAuthMutation,
        variables: {}
      });
      console.log('isTokenAuthenticated result -> ', result);
      if (result.data && result.data.isTokenAuthenticated) {
        const { data } = result;
        const { isTokenAuthenticated } = data;
        const { state, user } = isTokenAuthenticated;
        if (state && user) {
          cache.writeQuery({
            query: ConversationsQuery,
            data: {
              feed: []
            }
          });
          cache.writeQuery({
            query: Person,
            data: {
              id: user.id,
              name: user.name,
              username: user.username,
              email: user.email,
              jwt: user.jwt
            }
          });
          setToken(user.jwt);
          await wsLink.subscriptionClient.connect();
          setTimeout(() => {
            mApolloClient.subscribe({
              query: ConversationCreated,
              variables: { id: '' },
            });
            return goHome();
          }, 2000);
        } else {
          console.log('INVALID TOKEN - GO TO SIGN !');
          cache.writeQuery({
            query: Person,
            data: {
              id: '',
              name: '',
              username: '',
              email: '',
              jwt: '',
            }
          });
          return goAuth();
        }
      } else {
        console.log('INVALID TOKEN - GO TO SIGN !');
        cache.writeQuery({
          query: Person,
          data: {
            id: '',
            name: '',
            username: '',
            email: '',
            jwt: '',
          }
        });
        return goAuth();
      }
    } else {
      console.log('NO TOKEN - GO TO SIGN !');
      cache.writeQuery({
        query: Person,
        data: {
          id: '',
          name: '',
          username: '',
          email: '',
          jwt: '',
        }
      });
      return goAuth();
    }
  } catch(e) {
    console.log('ERROR AT INITIAL', e);
    return goAuth();
  }
};

startApp().then(() => console.log('App is launched!'));
