import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';

export const withProvider = (Component, client) => {
  return props => {
    return (
      <ApolloProvider client={client}>
        <Component {...props} />
      </ApolloProvider>
    );
  };
};