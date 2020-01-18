import React, {
  AsyncStorage,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { wsLink } from '../../../index';
import { goAuth } from '../../../navigation';
import { useApolloClient } from '@apollo/react-hooks';
import { useCallback } from 'react';

const Settings = () => {
  const apolloClient = useApolloClient();

  const signOut = useCallback(async () => {
    console.log('signOut');
    const { props } = this;
    const { client } = props;
    console.log('client -> ', client);
    // Close socket connection.
    wsLink.subscriptionClient.close();
    // Remove token from AsyncStorage.
    await AsyncStorage.removeItem('token');
    // Clear the cache.
    await apolloClient.clearStore();
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
