import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Circle } from 'react-native-svg';
import { useMeasurementStore } from '../store/measurementStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CalibrationScreenProps {
  onComplete: () => void;
}

export default function CalibrationScreen({ onComplete }: CalibrationScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const { setCalibration } = useMeasurementStore();

  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Lade...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#666" />
        <Text style={styles.permissionText}>Kamerazugriff erforderlich</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Kamera erlauben</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTap = (event: any) => {
    if (points.length >= 2) return;

    const { locationX, locationY } = event.nativeEvent;
    setPoints([...points, { x: locationX, y: locationY }]);

    if (points.length === 1) {
      // Second point set, calculate calibration
      const dx = locationX - points[0].x;
      const dy = locationY - points[0].y;
      const distancePixels = Math.sqrt(dx * dx + dy * dy);

      // A4 paper width is 210mm
      const referenceDistanceMm = 210;
      const pixelsPerMm = distancePixels / referenceDistanceMm;

      Alert.alert(
        'Kalibrierung abgeschlossen',
        `Skalierung: ${pixelsPerMm.toFixed(2)} Pixel/mm\n\nMessungen können nun durchgeführt werden.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setCalibration(pixelsPerMm);
              onComplete();
            },
          },
        ]
      );
    }
  };

  const handleReset = () => {
    setPoints([]);
  };

  return (
    <View style={styles.container}>
      <ExpoCameraView style={styles.camera} facing="back" onTouchEnd={handleTap}>
        <View style={styles.instructionContainer}>
          <View style={styles.instructionBox}>
            <Ionicons name="information-circle" size={32} color="#2196F3" />
            <Text style={styles.instructionTitle}>Kalibrierung</Text>
            <Text style={styles.instructionText}>
              1. Legen Sie ein A4-Blatt (210mm breit) auf eine ebene Fläche{' \n'}
              2. Tippen Sie auf die linke Kante{' \n'}
              3. Tippen Sie auf die rechte Kante
            </Text>
            {points.length === 0 && (
              <Text style={styles.stepText}>➤ Schritt 1: Linke Kante antippen</Text>
            )}
            {points.length === 1 && (
              <Text style={styles.stepText}>➤ Schritt 2: Rechte Kante antippen</Text>
            )}
          </View>
        </View>

        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {points.length === 1 && (
            <Circle cx={points[0].x} cy={points[0].y} r="10" fill="#00ff00" />
          )}
          {points.length === 2 && (
            <>
              <Line
                x1={points[0].x}
                y1={points[0].y}
                x2={points[1].x}
                y2={points[1].y}
                stroke="#00ff00"
                strokeWidth="3"
              />
              <Circle cx={points[0].x} cy={points[0].y} r="10" fill="#00ff00" />
              <Circle cx={points[1].x} cy={points[1].y} r="10" fill="#00ff00" />
            </>
          )}
        </Svg>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.buttonText}>Neu starten</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
            <Text style={styles.skipButtonText}>Überspringen</Text>
          </TouchableOpacity>
        </View>
      </ExpoCameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  instructionContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH - 40,
  },
  instructionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 12,
  },
  instructionText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepText: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(100, 100, 100, 0.7)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  skipButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});