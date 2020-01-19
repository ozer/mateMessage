import { Navigation } from 'react-native-navigation';
import SplashScreen from './src/SplashScreen';
import SignIn from './src/Auth/screens/SignIn';
import SignUp from './src/Auth/screens/SignUp';
import Home from './src/Home/screens/Home';
import MateList from './src/Mates/screens/MateList';
import ConversationList from './src/Conversations/screens/ConversationList';
import Conversation from './src/Conversations/screens/Conversation';
import MatePreview from './src/Mates/screens/MatePreview';
import Settings from './src/Settings/screens/Settings';
import apolloClient from './src/apollo/client';
import { withProvider } from './src/apollo/utils';

export const registerScreens = () => {
  Navigation.registerComponent(`SplashScreen`, () =>
    withProvider(SplashScreen, apolloClient)
  );

  Navigation.registerComponent('Auth.SignIn', () => SignIn);

  Navigation.registerComponent('Auth.SignUp', () => SignUp);

  Navigation.registerComponent('Home', () => withProvider(Home, apolloClient));

  Navigation.registerComponent('MateList', () =>
    withProvider(MateList, apolloClient)
  );

  Navigation.registerComponent('ConversationList', () =>
    withProvider(ConversationList, apolloClient)
  );

  Navigation.registerComponent('Conversation', () =>
    withProvider(Conversation, apolloClient)
  );

  Navigation.registerComponent('MatePreview', () =>
    withProvider(MatePreview, apolloClient)
  );

  Navigation.registerComponent('Settings', () =>
    withProvider(Settings, apolloClient)
  );
};
