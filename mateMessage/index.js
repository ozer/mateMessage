import React from "react";
import gql from "graphql-tag";
import { AsyncStorage } from "react-native";
import { Navigation } from "react-native-navigation";
import { split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "@apollo/react-hooks";
import { createHttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { setContext } from "apollo-link-context";
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from "apollo-cache-inmemory";
import { CachePersistor } from "apollo-cache-persist";
import SplashScreen from "./src/SplashScreen";
import Settings from "./src/containers/Settings";
import SignIn from "./src/containers/Authentication/Signin";
import SignUp from "./src/containers/Authentication/Signup";
import MateList from "./src/Mates/screens/MateList";
import ConversationList from "./src/Conversations/screens/ConversationList";
import Conversation from "./src/Conversations/screens/Conversation";
import { Feed } from "./src/queries/Feed";
import MatePreview from "./src/Mates/screens/MatePreview";
import Home from "./src/Home/screens/Home";
import introspectionQueryResultData from "./src/fragmentTypes";

const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData
});

const cache = new InMemoryCache({
  dataIdFromObject: object => object.id,
  fragmentMatcher
});

export const persistor = new CachePersistor({
  cache,
  storage: AsyncStorage
});

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql"
});

console.log("mateMessage");
let token = "";

export const getToken = () => token;
export const setToken = newToken => (token = newToken);

export const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
  options: {
    connectionCallback: () => {
      console.log("Connection callback!");
    },
    connectionParams: async () => {
      console.log("callback of connectionParams");
      const token = await AsyncStorage.getItem("token");
      return {
        authToken: token
      };
    },
    reconnect: true,
    reconnectionAttempts: 30,
    timeout: 2500
  },
  onDisconnected: function(event) {
    console.log("event");
  },
  on: eventName => {
    console.log("eventName ->", eventName);
  },
  onConnecting: event => {
    console.log("onConnecting", event);
  },
  onConnected: event => {
    console.log("onConnected!", event);
  },
  onReconnecting: event => {
    console.log("onReconnecting!", event);
  }
});

const authLink = setContext(async (_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem("token", null);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

const link = split(
  ({ query }) => {
    const { kind, operation, name } = getMainDefinition(query);
    // Send Message through WebSocket
    if (operation === "mutation" && name.value === "SendMessage") {
      return true;
    }
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  authLink.concat(httpLink)
);

const mApolloClient = new ApolloClient({
  link,
  cache,
  resolvers: {
    Message: {
      onFlight: () => {
        return false;
      }
    }
  },
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      returnPartialData: true
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

Navigation.registerComponent("Auth.SignIn", () => withProvider(SignIn));

Navigation.registerComponent("Auth.SignUp", () => withProvider(SignUp));

Navigation.registerComponent("Home", () => withProvider(Home));

Navigation.registerComponent("MateList", () => withProvider(MateList));

Navigation.registerComponent("ConversationList", () =>
  withProvider(ConversationList)
);

Navigation.registerComponent("Conversation", () => withProvider(Conversation));

Navigation.registerComponent("MatePreview", () => withProvider(MatePreview));

Navigation.registerComponent("navigation.playground.Settings", () =>
  withProvider(Settings)
);

const startApp = async () =>
  Navigation.events().registerAppLaunchedListener(() => {
    return Navigation.setRoot({
      root: {
        stack: {
          children: [
            {
              component: {
                name: "SplashScreen",
                id: "SplashScreen",
                options: {
                  topBar: {
                    visible: false,
                    drawBehind: true
                  },
                  layout: {
                    orientation: ["portrait"]
                  }
                }
              }
            }
          ]
        }
      }
    });
  });

startApp().then(() => console.log("App is launched!"));
