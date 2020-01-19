import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { goHome } from '../../../navigation';
import { handleAuthFormSubmit } from '../authHelper';

const SignIn = ({ componentId }) => {
  const [username, setUsername] = useState('ozer');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/auth/signIn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({ username, password })
      }).then(res => res.json());

      console.log('response: ', response);
      if (response) {
        const { user } = response;
        const { jwt: token } = user;
        await handleAuthFormSubmit({ token });
        setLoading(false);
        return goHome();
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      Alert.alert(e);
    }
  }, [username, password]);

  const goToSignUp = useCallback(async () => {
    await Navigation.setStackRoot(componentId, {
      component: {
        name: 'Auth.SignUp',
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
  }, [componentId]);

  return (
    <View style={{ backgroundColor: 'white', flex: 1 }}>
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handle">
        <View style={{ flex: 1, padding: 20 }}>
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
            <Text style={{ marginVertical: 5, fontSize: 18 }}>Username</Text>
            <TextInput
              style={{
                marginVertical: 10,
                borderStyle: 'solid',
                borderWidth: 3,
                borderRadius: 5,
                borderColor: 'gray',
                padding: 8,
                color: 'brown'
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
                padding: 8,
                color: 'brown'
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
                marginTop: 25,
                alignItems: 'center'
              }}
            >
              <TouchableOpacity onPress={goToSignUp}>
                <Text style={{ fontSize: 16, color: 'red' }}>
                  Create Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submit}>
                <View style={{ justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22, color: 'black' }}>Sign In!</Text>
                </View>
              </TouchableOpacity>
            </View>
            {loading ? <Text>Spinner!</Text> : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

SignIn.options = () => ({
  topBar: {
    visible: false,
    drawBehind: true,
  },
});

export default SignIn;
