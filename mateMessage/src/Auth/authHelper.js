import { AsyncStorage } from 'react-native';
import { wsLink } from '../../index';

export const handleAuthFormSubmit = async ({ token }) => {
  await AsyncStorage.setItem('token', token);
  await wsLink.subscriptionClient.connect();
};
