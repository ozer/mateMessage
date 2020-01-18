import React, { Component } from 'react';
import { View, Text, TouchableOpacity, TouchableHighlight, AsyncStorage } from 'react-native';
import { withApollo } from 'react-apollo';
import { Navigation } from 'react-native-navigation';
import { persistor, wsLink } from '../../index';
import { goAuth } from '../../navigation';

class Settings extends Component {

  signOut = async () => {
    console.log('signOut');
    const { props } = this;
    const { client } = props;
    console.log('client -> ', client);
    // Close socket connection.
    wsLink.subscriptionClient.close();
    await AsyncStorage.removeItem('token');
    return goAuth();
  };

  render() {
    const { signOut } = this;
    return (
      <View>
        <TouchableOpacity style={{ backgroundColor: '#fff', paddingLeft: 15, marginVertical: 10 }}>
          <View style={{ borderBottomStyle: 'solid', borderBottomWidth: 1, borderBottomColor: 'gray', marginRight: 15 }}>
            <Text style={{ fontSize: 16, marginBottom: 3 }}>
              Profile
          </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={{ backgroundColor: '#fff', paddingLeft: 15, marginVertical: 10 }}>
          <View style={{ borderBottomStyle: 'solid', borderBottomWidth: 1, borderBottomColor: 'gray', marginRight: 15 }}>
            <Text style={{ fontSize: 16, marginBottom: 3 }}>
              Notification
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={signOut} style={{ backgroundColor: '#fff', paddingLeft: 15, marginVertical: 10 }}>
          <View style={{ borderBottomStyle: 'solid', borderBottomWidth: 1, borderBottomColor: 'gray', marginRight: 15 }}>
            <Text style={{ fontSize: 16, marginBottom: 3 }}>
              Sign Out!
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

export default withApollo(Settings);
