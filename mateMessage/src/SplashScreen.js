import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, TextInput, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20
  }
});

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 28, color: 'black', textAlign: 'center' }}>
        Welcome, Mate!
      </Text>
      <Text style={{ fontSize: 18, color: 'black', textAlign: 'center', marginTop: 40 }}>
        We are settings things done for you...
      </Text>
    </View>
  );
};

export default SplashScreen;
