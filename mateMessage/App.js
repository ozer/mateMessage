import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  AsyncStorage
} from 'react-native';
import { compose, withApollo, Mutation, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { SignInMutation } from './src/mutations/Auth';
import { Person } from './src/queries/Auth';

class App extends Component {
  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1, }}>
        <Mutation
          onError={err => console.log('err at sign in ', err.networkError)}
          mutation={SignInMutation}
          update={async (cache, { data: { signIn } }) => {
            console.log('signIn response -> ', signIn);
            if (signIn && signIn.state) {
              const { user } = signIn;
              const abc = cache.readQuery({ query: Person });
              const { email, id, jwt, name, username } = user;
              await AsyncStorage.setItem('token', jwt);
              cache.writeQuery({
                query: Person,
                data: {
                  id,
                  username,
                  email,
                  name,
                  jwt
                }
              });
            }
          }}
        >
          {(signIn, { data, loading, error }) => (
            <View style={{ flex: 1, marginTop: 100 }}>
              <TouchableOpacity
                onPress={() =>
                  signIn({
                    variables: { username: 'cr1', password: '123456' }
                  })
                }
              >
                <Text>Send Sign In Mutation</Text>
              </TouchableOpacity>
              {loading ? <Text>Loading...</Text> : null}
              {error ? <Text> {error.toString()}</Text> : null}
            </View>
          )}
        </Mutation>
      </View>
    );
  }
}

export default App;
