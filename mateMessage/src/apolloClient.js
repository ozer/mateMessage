import { AsyncStorage } from 'react-native';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from '@apollo/react-hooks';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { CachePersistor } from 'apollo-cache-persist';

const cache = new InMemoryCache();

export const persistor = new CachePersistor({
    cache,
    storage: AsyncStorage
});

const httpLink = createHttpLink({
    uri: 'http://localhost:4000/graphql'
});

let token = '';

export const getToken = () => token;
export const setToken = newToken => (token = newToken);

export const wsLink = new WebSocketLink({
    uri: 'ws://localhost:4000/graphql',
    options: {
        connectionCallback: () => {
            console.log('Connection callback!');
            subscribeChannel();
        },
        connectionParams: () => ({
            authToken: token
        })
    }
});

const authLink = setContext(async (_, { headers }) => {
    // get the authentication token from local storage if it exists
    const authToken = await AsyncStorage.getItem('token', '');
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: `Bearer ${authToken}`
        }
    };
});

const link = split(
    ({ query }) => {
        const { kind, operation, name } = getMainDefinition(query);
        if (name && name.value) {
            console.log('name -> ', name.value);
        }
        return kind === 'OperationDefinition' && (operation === 'mutation' || operation === 'query');
    },
    authLink.concat(httpLink),
    wsLink
);

const apolloClient = new ApolloClient({
    link,
    cache,
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            returnPartialData: true,
        }
    }
});

const subscribeChannel = () => {
    apolloClient.subscribe({
        query: ConversationCreated,
        variables: { id: '' },
    });
};

export default ApolloClient;