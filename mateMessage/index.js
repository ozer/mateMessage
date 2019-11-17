import React from 'react';
import gql from 'graphql-tag';
import { AsyncStorage } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from '@apollo/react-hooks';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';
import { Person } from './src/queries/Auth';
import SplashScreen from './src/SplashScreen';
import { goAuth, goHome } from './navigation';
import Settings from './src/containers/Settings';
import People from './src/containers/People';
import Conversation from './src/containers/Conversation';
import { TokenAuthMutation } from './src/mutations/Auth';
import { ConversationCreated } from './src/subscriptions/Message';
import { ConversationsQuery } from './src/queries/Feed';
import SignIn from './src/containers/Authentication/Signin';
import SignUp from './src/containers/Authentication/Signup';
import MateList from './src/Mates/screens/MateList';
import ConversationList from './src/Conversations/screens/ConversationList';

const cache = new InMemoryCache({
  dataIdFromObject: object => object.id
});

export const persistor = new CachePersistor({
  cache,
  storage: AsyncStorage,
});

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql'
});

console.log('mateMessage');
let token = '';

export const getToken = () => token;
export const setToken = newToken => (token = newToken);

export const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    connectionCallback: () => {
      console.log('Connection callback!');
    },
    connectionParams: () => ({
      authToken: token
    })
  }
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem('token', null);
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
    const { kind, operation, name } = getMainDefinition(query);
    if (name && name.value) {
      console.log('name -> ', name.value);
    }
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink),
);

const mApolloClient = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      returnPartialData: true,
    }
  },
  onError: ({ networkError, graphQLErrors }) => {
    console.log('graphQLErrors', graphQLErrors)
    console.log('networkError', networkError);
  }
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

Navigation.registerComponent(`SplashScreen`, () => withProvider(SplashScreen));

Navigation.registerComponent('Auth.SignIn', () => withProvider(SignIn));

Navigation.registerComponent('Auth.SignUp', () => withProvider(SignUp));

Navigation.registerComponent('navigation.playground.Conversations', () =>
  withProvider(ConversationList)
);

Navigation.registerComponent('navigation.playground.Conversation', () =>
  withProvider(Conversation)
);

Navigation.registerComponent('navigation.playground.People', () =>
  withProvider(MateList)
);

Navigation.registerComponent('navigation.playground.Settings', () =>
  withProvider(Settings)
);


const startApp = async () => Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: 'SplashScreen',
              id: 'SplashScreen',
              options: {
                topBar: {
                  visible: false,
                  drawBehind: true
                },
                layout: {
                  orientation: ['portrait']
                }
              },
            },
          },
        ]
      },
    }
  });
});

startApp().then(() => console.log('App is launched!'));
