import React from 'react';
import { View, StyleSheet } from 'react-native';
import MainCameraScreen from '../components/MainCameraScreen';

export default function Index() {
  return (
    <View style={styles.container}>
      <MainCameraScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});