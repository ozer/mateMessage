import React, { useEffect } from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { View, Text, StyleSheet, KeyboardAvoidingView, TextInput, TouchableOpacity, Button } from 'react-native';
import { goAuth, goHome } from '../navigation';
import { wsLink, setToken } from '../index';
import { Navigation } from 'react-native-navigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20
  }
});

const SplashScreen = (props) => {

  const { data, error, loading } = useQuery(gql`
    query {
      me {
        id
        name
        email
        username
        jwt
      }
    }
  `);

  console.log('loading -> ', props);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 28, color: 'black', textAlign: 'center' }}>
          {'Welcome, Mate!'}
        </Text>
        <Text style={{ fontSize: 18, color: 'black', textAlign: 'center', marginTop: 40 }}>
          {'We are settings things done for you...'}
        </Text>
      </View>
    );
  }

  if (!data.me) {
    return goAuth('SplashScreen');
  }

  if (data.me) {
    setToken(data.me.jwt);
    wsLink.subscriptionClient.connect();
    return goHome();
  }

};

export default SplashScreen;
