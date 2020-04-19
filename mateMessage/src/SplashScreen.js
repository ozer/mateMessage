import React, { useCallback } from 'react';
import { useQuery } from 'react-apollo';
import { View, Text, StyleSheet } from 'react-native';
import { goAuth, goHome } from '../navigation';
import { Viewer } from './queries/Viewer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20
  }
});

const SplashScreen = ({ componentId }) => {
  useQuery(Viewer, {
    onCompleted: async ({ viewer }) => {
      if (viewer) {
        return goHome();
      }
      return auth();
    },
    onError: (e) => {
      console.log('e', e);
      return goHome();
    }
  });

  const auth = useCallback(() => {
    setTimeout(async () => {
      await goAuth(componentId);
    }, 1500);
  }, [componentId]);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 28, color: 'black', textAlign: 'center' }}>
        {'Welcome, Mate!'}
      </Text>
      <Text
        style={{
          fontSize: 18,
          color: 'black',
          textAlign: 'center',
          marginTop: 40
        }}
      >
        {'We are settings things done for you...'}
      </Text>
    </View>
  );
};

export default SplashScreen;
