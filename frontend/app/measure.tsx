import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMeasurementStore } from '../store/measurementStore';
import CameraView from '../components/CameraView';
import { useRouter } from 'expo-router';

export default function MeasureScreen() {
  const { currentMode, setMode, toggleUnit, unit } = useMeasurementStore();
  const [showModeSelector, setShowModeSelector] = useState(false);
  const router = useRouter();

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'distance':
        return 'resize';
      case 'area':
        return 'square-outline';
      case 'volume':
        return 'cube-outline';
      default:
        return 'resize';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'distance':
        return '#4CAF50';
      case 'area':
        return '#2196F3';
      case 'volume':
        return '#FF9800';
      default:
        return '#4CAF50';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView />

      {/* Top Bar */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, { backgroundColor: getModeColor(currentMode) }]}
          onPress={() => setShowModeSelector(!showModeSelector)}
        >
          <Ionicons name={getModeIcon(currentMode)} size={20} color="white" />
          <Text style={styles.modeButtonText}>
            {currentMode === 'distance'
              ? 'Distanz'
              : currentMode === 'area'
              ? 'Fläche'
              : 'Volumen'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.unitButton} onPress={toggleUnit}>
          <Text style={styles.unitButtonText}>{unit === 'metric' ? 'm' : 'ft'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Mode Selector */}
      {showModeSelector && (
        <View style={styles.modeSelectorContainer}>
          <TouchableOpacity
            style={[styles.modeSelectorItem, currentMode === 'distance' && styles.selectedMode]}
            onPress={() => {
              setMode('distance');
              setShowModeSelector(false);
            }}
          >
            <Ionicons name="resize" size={24} color="#4CAF50" />
            <Text style={styles.modeSelectorText}>Distanz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeSelectorItem, currentMode === 'area' && styles.selectedMode]}
            onPress={() => {
              setMode('area');
              setShowModeSelector(false);
            }}
          >
            <Ionicons name="square-outline" size={24} color="#2196F3" />
            <Text style={styles.modeSelectorText}>Fläche</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeSelectorItem, currentMode === 'volume' && styles.selectedMode]}
            onPress={() => {
              setMode('volume');
              setShowModeSelector(false);
            }}
          >
            <Ionicons name="cube-outline" size={24} color="#FF9800" />
            <Text style={styles.modeSelectorText}>Volumen</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 22,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 6,
  },
  modeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  unitButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 22,
  },
  unitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modeSelectorContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 16,
    padding: 8,
    zIndex: 1000,
  },
  modeSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  selectedMode: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeSelectorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});