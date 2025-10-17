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
import Svg, { Line, Circle, Polygon } from 'react-native-svg';
import { useMeasurementStore } from '../store/measurementStore';
import { captureRef } from 'react-native-view-shot';
import VolumeInput from './VolumeInput';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CameraView() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [showVolumeInput, setShowVolumeInput] = useState(false);
  const viewRef = useRef(null);

  const {
    currentMode,
    currentPoints,
    isCalibrated,
    addPoint,
    removeLastPoint,
    clearPoints,
    calculateResult,
    saveMeasurement,
    unit,
  } = useMeasurementStore();

  if (!permission) {
    return <View style={styles.container}><Text>Lade Kamera...</Text></View>;
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
    const { locationX, locationY } = event.nativeEvent;
    addPoint({ x: locationX, y: locationY });
  };

  const handleSave = async () => {
    if (currentPoints.length < 2) {
      Alert.alert('Fehler', 'Mindestens 2 Punkte erforderlich');
      return;
    }

    Alert.prompt(
      'Messung speichern',
      'Geben Sie einen Namen ein:',
      async (name) => {
        if (name) {
          try {
            // Capture screenshot
            const uri = await captureRef(viewRef, {
              format: 'png',
              quality: 0.8,
            });
            // Note: In production, convert uri to base64
            await saveMeasurement(name, uri);
            Alert.alert('Erfolg', 'Messung gespeichert!');
          } catch (error) {
            console.error('Error saving:', error);
            Alert.alert('Fehler', 'Fehler beim Speichern');
          }
        }
      }
    );
  };

  const result = calculateResult();
  const displayValue = formatMeasurement(result, currentMode, unit);

  return (
    <View style={styles.container} ref={viewRef}>
      <ExpoCameraView style={styles.camera} facing={facing} onTouchEnd={handleTap}>
        {/* Crosshair */}
        <View style={styles.crosshair}>
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />
        </View>

        {/* Overlay for points and lines */}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {currentMode === 'distance' && currentPoints.length >= 2 && (
            <>
              {currentPoints.map((point, index) => (
                <React.Fragment key={point.id}>
                  {index > 0 && (
                    <Line
                      x1={currentPoints[index - 1].x}
                      y1={currentPoints[index - 1].y}
                      x2={point.x}
                      y2={point.y}
                      stroke="#00ff00"
                      strokeWidth="3"
                    />
                  )}
                  <Circle cx={point.x} cy={point.y} r="6" fill="#00ff00" />
                </React.Fragment>
              ))}
            </>
          )}

          {currentMode === 'area' && currentPoints.length >= 3 && (
            <>
              <Polygon
                points={currentPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="rgba(0, 255, 0, 0.2)"
                stroke="#00ff00"
                strokeWidth="3"
              />
              {currentPoints.map((point) => (
                <Circle key={point.id} cx={point.x} cy={point.y} r="6" fill="#00ff00" />
              ))}
            </>
          )}

          {currentPoints.length === 1 && (
            <Circle cx={currentPoints[0].x} cy={currentPoints[0].y} r="6" fill="#00ff00" />
          )}
        </Svg>

        {/* Top bar */}
        <View style={styles.topBar}>
          {!isCalibrated && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={20} color="#ff9800" />
              <Text style={styles.warningText}>Kalibrierung erforderlich!</Text>
            </View>
          )}
        </View>

        {/* Result display */}
        {displayValue && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{displayValue}</Text>
          </View>
        )}

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.button} onPress={clearPoints}>
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={removeLastPoint}>
            <Ionicons name="arrow-undo" size={24} color="white" />
            <Text style={styles.buttonText}>Zurück</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={currentPoints.length < 2}
          >
            <Ionicons name="save" size={24} color="white" />
            <Text style={styles.buttonText}>Speichern</Text>
          </TouchableOpacity>
        </View>
      </ExpoCameraView>
    </View>
  );
}

function formatMeasurement(result: any, mode: string, unit: string): string {
  if (mode === 'distance' && result.distance) {
    const mm = result.distance;
    if (unit === 'metric') {
      if (mm < 10) return `${mm.toFixed(2)} mm`;
      if (mm < 1000) return `${(mm / 10).toFixed(2)} cm`;
      return `${(mm / 1000).toFixed(2)} m`;
    } else {
      const inches = mm / 25.4;
      if (inches < 12) return `${inches.toFixed(2)} in`;
      return `${(inches / 12).toFixed(2)} ft`;
    }
  }

  if (mode === 'area' && result.area) {
    const mm2 = result.area;
    if (unit === 'metric') {
      return `${(mm2 / 1000000).toFixed(2)} m²`;
    } else {
      const sqft = mm2 / 92903;
      return `${sqft.toFixed(2)} sq ft`;
    }
  }

  return '';
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
  crosshair: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 15,
    left: SCREEN_WIDTH / 2 - 15,
    width: 30,
    height: 30,
  },
  crosshairH: {
    position: 'absolute',
    width: 30,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    top: 14,
  },
  crosshairV: {
    position: 'absolute',
    width: 2,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    left: 14,
  },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  warningText: {
    color: '#ff9800',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  resultText: {
    color: '#00ff00',
    fontSize: 24,
    fontWeight: 'bold',
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  saveButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});