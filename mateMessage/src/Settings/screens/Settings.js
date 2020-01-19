import React, { useCallback } from 'react';
import {
  AsyncStorage,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { goAuth } from '../../../navigation';
import { useApolloClient } from '@apollo/react-hooks';
import { cachePersistor } from '../../apollo/cache';
import { wsClient } from '../../apollo/links/ws';

const Settings = () => {
  const apolloClient = useApolloClient();

  const signOut = useCallback(async () => {
    console.log('signOut');
    // Close socket connection.
    wsClient.close();
    // Remove token from AsyncStorage.
    await AsyncStorage.removeItem('token');
    // Clear the store
    await apolloClient.clearStore();
    // Clear the cache
    await cachePersistor.purge();
    // Go Auth.
    return goAuth();
  }, [apolloClient]);

  return (
    <View>
      <TouchableOpacity
        style={{ backgroundColor: '#fff', paddingLeft: 15, marginVertical: 10 }}
      >
        <View
          style={{
            borderBottomStyle: 'solid',
            borderBottomWidth: 1,
            borderBottomColor: 'gray',
            marginRight: 15
          }}
        >
          <Text style={{ fontSize: 16, marginBottom: 3 }}>Profile</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ backgroundColor: '#fff', paddingLeft: 15, marginVertical: 10 }}
      >
        <View
          style={{
            borderBottomStyle: 'solid',
            borderBottomWidth: 1,
            borderBottomColor: 'gray',
            marginRight: 15
          }}
        >
          <Text style={{ fontSize: 16, marginBottom: 3 }}>Notification</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={signOut}
        style={{ backgroundColor: '#fff', paddingLeft: 15, marginVertical: 10 }}
      >
        <View
          style={{
            borderBottomStyle: 'solid',
            borderBottomWidth: 1,
            borderBottomColor: 'gray',
            marginRight: 15
          }}
        >
          <Text style={{ fontSize: 16, marginBottom: 3 }}>Sign Out!</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;
