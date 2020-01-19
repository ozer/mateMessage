import { AsyncStorage } from 'react-native';
import { wsClient } from '../apollo/links/ws';

export const handleAuthFormSubmit = async ({ token }) => {
  await AsyncStorage.setItem('token', token);
  await wsClient.connect();
};
