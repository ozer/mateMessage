import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloClient } from 'apollo-client';
import { onError } from 'apollo-link-error';
import { cache } from './cache';
import wsLink from './links/ws';
import authLink from './links/auth';
import httpLink from './links/http';

const link = split(
  ({ query }) => {
    const { kind, operation, name } = getMainDefinition(query);
    // Send Message through WebSocket
    if (operation === 'mutation' && name.value === 'SendMessage') {
      return true;
    }
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink)
);

const apolloClient = new ApolloClient({
  link,
  cache,
  resolvers: {
    Message: {
      onFlight: () => {
        return false;
      }
    },
  },
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      returnPartialData: true,
    }
  },
  onError: onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );

    if (networkError) console.log(`[Network error]: ${networkError}`);
  })
});

export default apolloClient;