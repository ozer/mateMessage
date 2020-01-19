import { WebSocketLink } from 'apollo-link-ws';
import { AsyncStorage } from 'react-native';

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/api/graphql',
  options: {
    connectionCallback: () => {
      console.log('Connection callback!');
    },
    connectionParams: async () => {
      console.log('callback of connectionParams');
      const token = await AsyncStorage.getItem('token', null);
      return {
        authToken: token
      };
    },
    reconnect: true,
    reconnectionAttempts: 10,
    timeout: 2500
  },
  onDisconnected: function(event) {
    console.log('event');
  },
  on: eventName => {
    console.log('eventName ->', eventName);
  },
  onConnecting: event => {
    console.log('onConnecting', event);
  },
  onConnected: event => {
    console.log('onConnected!', event);
  },
  onReconnecting: event => {
    console.log('onReconnecting!', event);
  }
});

export const wsClient = wsLink.subscriptionClient;

export default wsLink;