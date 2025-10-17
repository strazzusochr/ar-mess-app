import React from 'react';
import { View, StyleSheet } from 'react-native';
import CalibrationScreen from '../components/CalibrationScreen';
import { useRouter } from 'expo-router';

export default function CalibrationPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CalibrationScreen onComplete={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});