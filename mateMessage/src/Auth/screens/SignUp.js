import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from 'react-native-navigation';
import {
  Alert,
  AsyncStorage,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { setToken, wsLink } from '../../../index';
import { goHome } from '../../../navigation';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/auth/signUp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({ username, password, email, name })
      }).then(res => res.json());

      console.log('response: ', response);
      if (response) {
        const { user } = response;
        const { jwt } = user;
        setToken(jwt);
        await AsyncStorage.setItem('token', jwt);
        await wsLink.subscriptionClient.connect();
        setLoading(false);
        return goHome();
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      Alert.alert(e);
    }
  }, [username, password]);

  const goToSignIn = () =>
    Navigation.setStackRoot('Auth.Stack', {
      component: {
        name: 'Auth.SignIn',
        options: {
          animations: {
            setRoot: {
              alpha: {
                from: 0,
                to: 1,
                duration: 2500,
                interpolation: 'accelerate'
              }
            }
          }
        }
      }
    });

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1, padding: 20 }}
          behavior="position"
        >
          <View
            style={{
              padding: 8,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 28, color: 'black' }}>mate</Text>
            <Text style={{ fontSize: 32, color: 'brown', marginLeft: 6 }}>
              Message
            </Text>
          </View>
          <View style={{ marginTop: 20, padding: 8 }}>
            <Text style={{ marginVertical: 5, fontSize: 18 }}>E-Mail</Text>
            <TextInput
              style={{
                marginVertical: 10,
                borderStyle: 'solid',
                borderWidth: 3,
                borderRadius: 5,
                borderColor: 'gray',
                padding: 8
              }}
              keyboardAppearance="dark"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email"
              defaultValue={email}
              onChangeText={setEmail}
            />
            <Text style={{ marginVertical: 5, fontSize: 18 }}>Name</Text>
            <TextInput
              style={{
                marginVertical: 10,
                borderStyle: 'solid',
                borderWidth: 3,
                borderRadius: 5,
                borderColor: 'gray',
                padding: 8
              }}
              keyboardAppearance="dark"
              placeholder="Name"
              defaultValue={name}
              onChangeText={setName}
            />
            <Text style={{ marginVertical: 5, fontSize: 18 }}>Username</Text>
            <TextInput
              style={{
                marginVertical: 10,
                borderStyle: 'solid',
                borderWidth: 3,
                borderRadius: 5,
                borderColor: 'gray',
                padding: 8
              }}
              keyboardAppearance="dark"
              autoCapitalize="none"
              placeholder="Username"
              defaultValue={username}
              onChangeText={setUsername}
            />
            <Text style={{ marginVertical: 5, fontSize: 18 }}>Password</Text>
            <TextInput
              style={{
                marginVertical: 10,
                borderStyle: 'solid',
                borderWidth: 3,
                borderRadius: 5,
                borderColor: 'gray',
                padding: 8
              }}
              keyboardAppearance="dark"
              secureTextEntry
              placeholder="Password"
              defaultValue={password}
              onChangeText={setPassword}
            />
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 10,
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 20
              }}
            >
              <TouchableOpacity
                onPress={goToSignIn}
                style={{ flexDirection: 'row' }}
              >
                <Text style={{ fontSize: 16, color: 'red' }}>
                  Already have an account?
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submit}>
                <View
                  style={{
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ fontSize: 22 }}>Sign Up!</Text>
                </View>
              </TouchableOpacity>
            </View>
            {loading ? <Text>Spinner!</Text> : null}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default SignUp;
