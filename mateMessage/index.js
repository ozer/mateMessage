import React from 'react';
import { Navigation } from 'react-native-navigation';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/FontAwesome';
import SplashScreen from './src/SplashScreen';
import { registerScreens } from './screens';
import { cachePersistor } from './src/apollo/cache';

const startApp = async () => {
  registerScreens();
  NetInfo.configure({
    reachabilityUrl: 'http://localhost:4000/api/check',
    reachabilityTest: async response => {
      return response.status === 200;
    },
    reachabilityLongTimeout: 10 * 1000,
    reachabilityShortTimeout: 3 * 1000
  });
  await NetInfo.fetch();
  await Icon.loadFont();
  await cachePersistor.restore();
  return Navigation.events().registerAppLaunchedListener(() => {
    return Navigation.setRoot({
      root: {
        component: {
          name: 'SplashScreen',
          id: 'SplashScreen',
          options: {
            topBar: {
              visible: false,
              drawBehind: true
            },
            layout: {
              orientation: ['portrait']
            }
          }
        }
      }
    });
  });
};

startApp().then(() => console.log('App is launched!'));
