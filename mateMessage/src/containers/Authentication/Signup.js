import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  AsyncStorage,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Animated
} from 'react-native';
import { Mutation } from 'react-apollo';
import { Navigation } from 'react-native-navigation';
import { SignUpMutation } from '../../mutations/Auth';
import { setToken, wsLink } from '../../../index';
import { Person } from '../../queries/Auth';
import { goAuth, goHome, goSignUp } from '../../../navigation';


const SignUp = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
          <Mutation
            mutation={SignUpMutation}
            variables={{ email, name, username, password }}
            update={async (cache, { data: { signUp } }) => {
              console.log('signUn -> ', signUp);
              if (signUp && signUp.state) {
                goToSignIn();
              }
            }}
          >
            {(signUp, { error, loading, data }) => (
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
                <Text style={{ marginVertical: 5, fontSize: 18 }}>
                  Username
                </Text>
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
                <Text style={{ marginVertical: 5, fontSize: 18 }}>
                  Password
                </Text>
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
                  <TouchableOpacity onPress={signUp}>
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
            )}
          </Mutation>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default SignUp;
