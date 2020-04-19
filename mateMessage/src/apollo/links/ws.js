import { WebSocketLink } from 'apollo-link-ws';
import { AsyncStorage } from 'react-native';

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/api/graphql',
  options: {
    connectionCallback: () => {
      console.log('Connection callback!');
    },
    connectionParams: async () => {
      const token = await AsyncStorage.getItem('token', null);
      return {
        authToken: token
      };
    },
    reconnect: true,
    reconnectionAttempts: 10,
    timeout: 2500
  },
});

export const wsClient = wsLink.subscriptionClient;

export default wsLink;