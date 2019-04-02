import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  AsyncStorage,
  TouchableOpacity
} from 'react-native';
import { Mutation, withApollo } from 'react-apollo';
import { Navigation } from 'react-native-navigation';
import { SignInMutation } from '../../mutations/Auth';
import { Person } from '../../queries/Auth';
import { setToken, wsLink } from '../../../index';
import { goHome, goSignUp } from '../../../navigation';

const SignIn = props => {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const goToSignUp = () =>
    Navigation.setStackRoot('Auth.Stack', {
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
          <Mutation
            mutation={SignInMutation}
            variables={{ username, password }}
            update={async (cache, { data: { signIn } }) => {
              console.log('signIn -> ', signIn);
              if (signIn && signIn.state) {
                const { user } = signIn;
                const { id, name, username, email, jwt } = user;
                setToken(jwt);
                await AsyncStorage.setItem('token', jwt);
                await wsLink.subscriptionClient.connect();
                console.log('Connected!');
                cache.writeQuery({
                  query: Person,
                  data: {
                    id,
                    name,
                    username,
                    email,
                    jwt
                  }
                });
                goHome();
              }
            }}
          >
            {(signIn, { error, loading, data }) => (
              <View style={{ marginTop: 20, padding: 8 }}>
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
                    padding: 8,
                    color: 'brown'
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
                  <TouchableOpacity onPress={signIn}>
                    <View style={{ justifyContent: 'center' }}>
                      <Text style={{ fontSize: 22, color: 'black' }}>
                        Sign In!
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                {loading ? <Text>Spinner!</Text> : null}
              </View>
            )}
          </Mutation>
        </View>
      </ScrollView>
    </View>
  );
};

// class Signin extends React.Component {
//
//   componentWillMount() {}
//
//   render() {
//     return (
//       <View style={{ backgroundColor: 'white', flex: 1 }}>
//         <Mutation
//           onError={err => console.log('err at sign in ', err.networkError)}
//           mutation={SignInMutation}
//           update={async (cache, { data: { signIn } }) => {
//             console.log('signIn response -> ', signIn);
//             if (signIn && signIn.state) {
//               const { user } = signIn;
//               const abc = cache.readQuery({ query: Person });
//               const { email, id, jwt, name, username } = user;
//               await AsyncStorage.setItem('token', jwt);
//               cache.writeQuery({
//                 query: Person,
//                 data: {
//                   id,
//                   username,
//                   email,
//                   name,
//                   jwt
//                 }
//               });
//             }
//           }}
//         >
//           {(signIn, { data, loading, error }) => {
//             if (data) {
//               console.log('Data -> ', data);
//             }
//             return (
//               <View style={{ flex: 1, marginTop: 100 }}>
//                 <TouchableOpacity
//                   onPress={() =>
//                     signIn({
//                       variables: { username: 'ozeriko', password: '123456' }
//                     })
//                   }
//                 >
//                   <Text>Send Sign In Mutation</Text>
//                 </TouchableOpacity>
//                 {loading ? <Text>Loading...</Text> : null}
//                 {error ? <Text> {error.toString()}</Text> : null}
//               </View>
//             );
//           }}
//         </Mutation>
//       </View>
//     );
//   }
// }

export default withApollo(SignIn);
