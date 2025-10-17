import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  ScrollView,
  TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import Svg, { Line, Circle, Polygon, Text as SvgText } from 'react-native-svg';
import { useCameraStore } from '../store/cameraStore';
import { useMeasurementStore } from '../store/measurementStore';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MainCameraScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState<{x: number, y: number}[]>([]);
  const [volumeHeight, setVolumeHeight] = useState('');
  const [showVolumeInput, setShowVolumeInput] = useState(false);
  
  const cameraRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const settingsAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  
  const {
    cameraMode,
    measureMode,
    filter,
    videoQuality,
    measureUnit,
    isRecording,
    showSettings,
    showModeSelector,
    setCameraMode,
    setMeasureMode,
    setFilter,
    setVideoQuality,
    setMeasureUnit,
    setIsRecording,
    toggleSettings,
    toggleModeSelector,
  } = useCameraStore();
  
  const {
    currentPoints,
    isCalibrated,
    calibrationScale,
    addPoint,
    removeLastPoint,
    clearPoints,
    calculateResult,
    setCalibration,
  } = useMeasurementStore();

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showModeSelector ? SCREEN_HEIGHT - 350 : SCREEN_HEIGHT,
      useNativeDriver: true,
      damping: 20,
    }).start();
  }, [showModeSelector]);

  useEffect(() => {
    Animated.spring(settingsAnim, {
      toValue: showSettings ? 0 : SCREEN_WIDTH,
      useNativeDriver: true,
      damping: 20,
    }).start();
  }, [showSettings]);

  // Permission Screen
  if (!showCamera && (!cameraPermission?.granted || !mediaPermission?.granted || !audioPermission?.granted)) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors.primary} />
        <Text style={styles.permissionTitle}>Kamera-Berechtigungen</Text>
        <Text style={styles.permissionText}>
          Kamera, Mikrofon und Medienbibliothek werden benötigt.
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={async () => {
            await requestCameraPermission();
            await requestMediaPermission();
            await requestAudioPermission();
            setShowCamera(true);
          }}
        >
          <Text style={styles.permissionButtonText}>Zugriff erlauben</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.skipButtonText}>Demo-Modus</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calibration Screen
  if (showCalibration) {
    const handleCalibrationTap = (event: any) => {
      if (calibrationPoints.length >= 2) return;
      const { locationX, locationY } = event.nativeEvent;
      const newPoints = [...calibrationPoints, { x: locationX, y: locationY }];
      setCalibrationPoints(newPoints);

      if (newPoints.length === 2) {
        const dx = newPoints[1].x - newPoints[0].x;
        const dy = newPoints[1].y - newPoints[0].y;
        const distancePixels = Math.sqrt(dx * dx + dy * dy);
        const referenceDistanceMm = 210; // A4 width
        const pixelsPerMm = distancePixels / referenceDistanceMm;
        
        Alert.alert(
          'Kalibrierung abgeschlossen',
          `Skalierung: ${pixelsPerMm.toFixed(2)} px/mm`,
          [{
            text: 'OK',
            onPress: () => {
              setCalibration(pixelsPerMm);
              setShowCalibration(false);
              setCalibrationPoints([]);
            },
          }]
        );
      }
    };

    return (
      <View style={styles.container}>
        {!cameraPermission?.granted ? (
          <View style={styles.mockCamera}>
            <Ionicons name="camera-outline" size={80} color={Colors.border} />
          </View>
        ) : (
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        )}

        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1}
          onPress={handleCalibrationTap}
        >
          <View style={styles.calibrationOverlay}>
            <View style={styles.calibrationBox}>
              <Ionicons name="information-circle" size={32} color={Colors.primary} />
              <Text style={styles.calibrationTitle}>Kalibrierung</Text>
              <Text style={styles.calibrationText}>
                1. A4-Blatt (210mm) hinlegen{'\n'}
                2. Linke Kante antippen{'\n'}
                3. Rechte Kante antippen
              </Text>
              {calibrationPoints.length === 0 && (
                <Text style={styles.calibrationStep}>→ Linke Kante</Text>
              )}
              {calibrationPoints.length === 1 && (
                <Text style={styles.calibrationStep}>→ Rechte Kante</Text>
              )}
            </View>
          </View>

          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            {calibrationPoints.length === 1 && (
              <Circle cx={calibrationPoints[0].x} cy={calibrationPoints[0].y} r="10" fill={Colors.primary} />
            )}
            {calibrationPoints.length === 2 && (
              <>
                <Line
                  x1={calibrationPoints[0].x}
                  y1={calibrationPoints[0].y}
                  x2={calibrationPoints[1].x}
                  y2={calibrationPoints[1].y}
                  stroke={Colors.primary}
                  strokeWidth="3"
                />
                <Circle cx={calibrationPoints[0].x} cy={calibrationPoints[0].y} r="10" fill={Colors.primary} />
                <Circle cx={calibrationPoints[1].x} cy={calibrationPoints[1].y} r="10" fill={Colors.primary} />
              </>
            )}
          </Svg>
        </TouchableOpacity>

        <View style={styles.calibrationButtons}>
          <TouchableOpacity 
            style={styles.calibrationButton} 
            onPress={() => {
              setShowCalibration(false);
              setCalibrationPoints([]);
            }}
          >
            <Text style={styles.calibrationButtonText}>Abbrechen</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.calibrationButton} 
            onPress={() => setCalibrationPoints([])}
          >
            <Text style={styles.calibrationButtonText}>Neu starten</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleTap = (event: any) => {
    if (cameraMode !== 'measure') return;
    if (!isCalibrated) {
      Alert.alert('Hinweis', 'Bitte zuerst kalibrieren für präzise Messungen', [
        { text: 'Später', style: 'cancel' },
        { text: 'Jetzt kalibrieren', onPress: () => setShowCalibration(true) }
      ]);
      return;
    }
    const { locationX, locationY } = event.nativeEvent;
    addPoint({ x: locationX, y: locationY });
  };

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      Alert.alert('✓', 'Foto gespeichert');
    } catch (error) {
      Alert.alert('Fehler', 'Speichern fehlgeschlagen');
    }
  };

  const handleStartRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    try {
      await cameraRef.current.recordAsync();
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Fehler', 'Aufnahme fehlgeschlagen');
    }
  };

  const handleStopRecording = async () => {
    if (!cameraRef.current) return;
    try {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      Alert.alert('✓', 'Video gespeichert');
    } catch (error) {
      setIsRecording(false);
    }
  };

  const handleVolumeCalculate = () => {
    const result = calculateResult();
    if (!result.area) return;
    
    const heightValue = parseFloat(volumeHeight);
    if (isNaN(heightValue) || heightValue <= 0) {
      Alert.alert('Fehler', 'Gültige Höhe eingeben');
      return;
    }

    const heightMm = measureUnit === 'mm' ? heightValue : measureUnit === 'cm' ? heightValue * 10 : heightValue * 1000;
    const volume = result.area * heightMm;
    
    Alert.alert(
      'Volumen berechnet',
      `${formatVolume(volume, measureUnit)}`,
      [{ text: 'OK' }]
    );
    setShowVolumeInput(false);
    setVolumeHeight('');
  };

  const result = cameraMode === 'measure' ? calculateResult() : {};
  const segmentLengths = getSegmentLengths(currentPoints, calibrationScale);

  return (
    <View style={styles.container}>
      {!cameraPermission?.granted ? (
        <View style={styles.mockCamera}>
          <Ionicons name="camera-outline" size={80} color={Colors.border} />
          <Text style={styles.mockText}>Demo-Modus</Text>
        </View>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          {/* Fake Infrarot Filter */}
          {filter === 'infrared' && (
            <View style={styles.filterOverlay}>
              <View style={styles.infraredGradient}>
                <View style={styles.infraredTop} />
                <View style={styles.infraredMiddle} />
                <View style={styles.infraredBottom} />
              </View>
              <View style={styles.infraredScanlines} />
              <Text style={styles.filterLabel}>INFRAROT MODUS</Text>
              <View style={styles.infraredCrosshair}>
                <View style={styles.infraredCrosshairH} />
                <View style={styles.infraredCrosshairV} />
              </View>
            </View>
          )}
          
          {/* Fake Thermal/Wärmebild Filter */}
          {filter === 'thermal' && (
            <View style={styles.filterOverlay}>
              <View style={styles.thermalGradient}>
                <View style={styles.thermalHot} />
                <View style={styles.thermalWarm} />
                <View style={styles.thermalCool} />
                <View style={styles.thermalCold} />
              </View>
              <View style={styles.thermalNoise} />
              <Text style={styles.filterLabel}>WÄRMEBILD MODUS</Text>
              <View style={styles.thermalScale}>
                <View style={[styles.thermalScaleBar, {backgroundColor: '#FF0000'}]} />
                <View style={[styles.thermalScaleBar, {backgroundColor: '#FF8800'}]} />
                <View style={[styles.thermalScaleBar, {backgroundColor: '#FFFF00'}]} />
                <View style={[styles.thermalScaleBar, {backgroundColor: '#00FF00'}]} />
                <View style={[styles.thermalScaleBar, {backgroundColor: '#0088FF'}]} />
                <View style={[styles.thermalScaleBar, {backgroundColor: '#0000FF'}]} />
              </View>
              <Text style={styles.thermalTemp}>🔥 28.5°C</Text>
            </View>
          )}
        </CameraView>
      )}

      {/* Measurement Touch Area */}
      {cameraMode === 'measure' && (
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1}
          onPress={handleTap}
        >
          <View style={styles.crosshair}>
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />
          </View>

          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Distance Mode */}
            {measureMode === 'distance' && currentPoints.length >= 1 && (
              <>
                {currentPoints.map((point, index) => (
                  <React.Fragment key={point.id}>
                    {index > 0 && (
                      <>
                        <Line
                          x1={currentPoints[index - 1].x}
                          y1={currentPoints[index - 1].y}
                          x2={point.x}
                          y2={point.y}
                          stroke={Colors.distance}
                          strokeWidth="2"
                        />
                        {segmentLengths[index - 1] && (
                          <SvgText
                            x={(currentPoints[index - 1].x + point.x) / 2}
                            y={(currentPoints[index - 1].y + point.y) / 2 - 10}
                            fill={Colors.distance}
                            fontSize="14"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {segmentLengths[index - 1]}
                          </SvgText>
                        )}
                      </>
                    )}
                    <Circle cx={point.x} cy={point.y} r="5" fill={Colors.distance} />
                    <SvgText
                      x={point.x}
                      y={point.y - 15}
                      fill={Colors.distance}
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      P{index + 1}
                    </SvgText>
                  </React.Fragment>
                ))}
              </>
            )}

            {/* Area/Volume Mode */}
            {(measureMode === 'area' || measureMode === 'volume') && currentPoints.length >= 3 && (
              <>
                <Polygon
                  points={currentPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(129, 199, 132, 0.2)"
                  stroke={Colors.area}
                  strokeWidth="2"
                />
                {currentPoints.map((point, index) => (
                  <React.Fragment key={point.id}>
                    <Circle cx={point.x} cy={point.y} r="5" fill={Colors.area} />
                    <SvgText
                      x={point.x}
                      y={point.y - 15}
                      fill={Colors.area}
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      P{index + 1}
                    </SvgText>
                  </React.Fragment>
                ))}
              </>
            )}

            {currentPoints.length === 1 && (
              <>
                <Circle cx={currentPoints[0].x} cy={currentPoints[0].y} r="5" fill={Colors.primary} />
                <SvgText
                  x={currentPoints[0].x}
                  y={currentPoints[0].y - 15}
                  fill={Colors.primary}
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  P1
                </SvgText>
              </>
            )}
          </Svg>

          {/* Results Display */}
          {(result.distance || result.area) && (
            <View style={styles.resultContainer}>
              {result.distance && (
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Gesamtlänge:</Text>
                  <Text style={styles.resultValue}>{formatMeasurement(result.distance, measureUnit, 'distance')}</Text>
                </View>
              )}
              {result.area && (
                <>
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Fläche:</Text>
                    <Text style={styles.resultValue}>{formatMeasurement(result.area, measureUnit, 'area')}</Text>
                  </View>
                  {result.perimeter && (
                    <View style={styles.resultItem}>
                      <Text style={styles.resultLabel}>Umfang:</Text>
                      <Text style={styles.resultValue}>{formatMeasurement(result.perimeter, measureUnit, 'distance')}</Text>
                    </View>
                  )}
                  {measureMode === 'volume' && (
                    <TouchableOpacity 
                      style={styles.volumeButton}
                      onPress={() => setShowVolumeInput(true)}
                    >
                      <Text style={styles.volumeButtonText}>Volumen berechnen</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}

      {/* Top Bar */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity style={styles.iconButton} onPress={toggleSettings}>
          <Ionicons name="settings-outline" size={22} color={Colors.light} />
        </TouchableOpacity>
        
        <View style={styles.topCenter}>
          {!isCalibrated && cameraMode === 'measure' && (
            <TouchableOpacity 
              style={styles.calibrateButton}
              onPress={() => setShowCalibration(true)}
            >
              <Ionicons name="construct-outline" size={18} color={Colors.light} />
              <Text style={styles.calibrateText}>Kalibrieren</Text>
            </TouchableOpacity>
          )}
          <View style={styles.filterBadge}>
            <Text style={styles.filterText}>
              {filter === 'infrared' ? 'IR' : filter === 'thermal' ? 'Thermal' : 'Normal'}
            </Text>
          </View>
        </View>
        
        <View style={{ width: 40 }} />
      </View>

      {/* Bottom Menu */}
      <View style={styles.bottomMenu} pointerEvents="box-none">
        <View style={styles.modeRow}>
          <TouchableOpacity 
            style={[styles.modeButton, cameraMode === 'photo' && styles.modeButtonActive]}
            onPress={() => setCameraMode('photo')}
          >
            <Ionicons name="camera-outline" size={20} color={Colors.light} />
            <Text style={styles.modeButtonText}>Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modeButton, cameraMode === 'video' && styles.modeButtonActive]}
            onPress={() => setCameraMode('video')}
          >
            <Ionicons name="videocam-outline" size={20} color={Colors.light} />
            <Text style={styles.modeButtonText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modeButton, cameraMode === 'measure' && styles.modeButtonActive]}
            onPress={() => {
              setCameraMode('measure');
              toggleModeSelector();
            }}
          >
            <Ionicons name="resize-outline" size={20} color={Colors.light} />
            <Text style={styles.modeButtonText}>Messen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          {cameraMode === 'photo' && (
            <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          )}

          {cameraMode === 'video' && (
            <TouchableOpacity 
              style={[styles.captureButton, isRecording && styles.recordingButton]} 
              onPress={isRecording ? handleStopRecording : handleStartRecording}
            >
              <View style={[styles.captureButtonInner, isRecording && styles.recordingInner]} />
            </TouchableOpacity>
          )}

          {cameraMode === 'measure' && currentPoints.length > 0 && (
            <View style={styles.measureControls}>
              <TouchableOpacity style={styles.controlButton} onPress={removeLastPoint}>
                <Ionicons name="arrow-undo" size={20} color={Colors.light} />
              </TouchableOpacity>
              {currentPoints.length >= 2 && (
                <TouchableOpacity style={styles.controlButton} onPress={clearPoints}>
                  <Ionicons name="refresh" size={20} color={Colors.light} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Volume Input Modal */}
      {showVolumeInput && (
        <View style={styles.volumeModal}>
          <View style={styles.volumeModalContent}>
            <Text style={styles.volumeModalTitle}>Höhe eingeben</Text>
            <Text style={styles.volumeModalLabel}>Fläche: {formatMeasurement(result.area || 0, measureUnit, 'area')}</Text>
            <View style={styles.volumeInputRow}>
              <TextInput
                style={styles.volumeInput}
                value={volumeHeight}
                onChangeText={setVolumeHeight}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.volumeUnit}>{measureUnit}</Text>
            </View>
            <View style={styles.volumeModalButtons}>
              <TouchableOpacity style={styles.volumeModalButton} onPress={() => setShowVolumeInput(false)}>
                <Text style={styles.volumeModalButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.volumeModalButton, styles.volumeModalButtonPrimary]} onPress={handleVolumeCalculate}>
                <Text style={[styles.volumeModalButtonText, styles.volumeModalButtonTextPrimary]}>Berechnen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Measure Mode Selector */}
      <Animated.View style={[styles.measureSelector, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.selectorHandle} />
        <Text style={styles.selectorTitle}>Messmodus</Text>
        
        <TouchableOpacity 
          style={[styles.selectorItem, measureMode === 'distance' && styles.selectorItemActive]}
          onPress={() => {
            setMeasureMode('distance');
            toggleModeSelector();
          }}
        >
          <Ionicons name="resize-outline" size={24} color={Colors.distance} />
          <View style={styles.selectorItemText}>
            <Text style={styles.selectorItemTitle}>Distanz</Text>
            <Text style={styles.selectorItemSubtitle}>Längen mit Segmentanzeige</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.selectorItem, measureMode === 'area' && styles.selectorItemActive]}
          onPress={() => {
            setMeasureMode('area');
            toggleModeSelector();
          }}
        >
          <Ionicons name="square-outline" size={24} color={Colors.area} />
          <View style={styles.selectorItemText}>
            <Text style={styles.selectorItemTitle}>Fläche</Text>
            <Text style={styles.selectorItemSubtitle}>Polygon-Flächenberechnung</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.selectorItem, measureMode === 'volume' && styles.selectorItemActive]}
          onPress={() => {
            setMeasureMode('volume');
            toggleModeSelector();
          }}
        >
          <Ionicons name="cube-outline" size={24} color={Colors.volume} />
          <View style={styles.selectorItemText}>
            <Text style={styles.selectorItemTitle}>Volumen</Text>
            <Text style={styles.selectorItemSubtitle}>Fläche × Höhe = m³</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Settings Panel */}
      <Animated.View style={[styles.settingsPanel, { transform: [{ translateX: settingsAnim }] }]}>
        <View style={styles.settingsPanelHeader}>
          <Text style={styles.settingsPanelTitle}>Einstellungen</Text>
          <TouchableOpacity onPress={toggleSettings}>
            <Ionicons name="close" size={24} color={Colors.light} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.settingsContent}>
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>MASSEINHEIT</Text>
            <View style={styles.settingOptions}>
              {[
                { value: 'mm', label: 'Millimeter' },
                { value: 'cm', label: 'Zentimeter' },
                { value: 'm', label: 'Meter' }
              ].map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[styles.settingOption, measureUnit === unit.value && styles.settingOptionActive]}
                  onPress={() => setMeasureUnit(unit.value as any)}
                >
                  <Text style={[styles.settingOptionText, measureUnit === unit.value && styles.settingOptionTextActive]}>
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>FOTO/VIDEO QUALITÄT</Text>
            <View style={styles.settingOptions}>
              {['480p', '720p', '1080p', '2k', '4k'].map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[styles.settingOption, videoQuality === quality && styles.settingOptionActive]}
                  onPress={() => setVideoQuality(quality as any)}
                >
                  <Text style={[styles.settingOptionText, videoQuality === quality && styles.settingOptionTextActive]}>
                    {quality}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>KAMERA-FILTER</Text>
            <View style={styles.settingOptions}>
              {[
                { value: 'none', label: 'Normal' },
                { value: 'infrared', label: 'Infrarot' },
                { value: 'thermal', label: 'Wärmebild' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.settingOption, filter === f.value && styles.settingOptionActive]}
                  onPress={() => setFilter(f.value as any)}
                >
                  <Text style={[styles.settingOptionText, filter === f.value && styles.settingOptionTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isCalibrated && (
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>KALIBRIERUNG</Text>
              <View style={styles.calibrationInfo}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                <Text style={styles.calibrationInfoText}>
                  Kalibriert: {calibrationScale?.toFixed(2)} px/mm
                </Text>
              </View>
              <TouchableOpacity
                style={styles.recalibrateButton}
                onPress={() => setShowCalibration(true)}
              >
                <Text style={styles.recalibrateButtonText}>Neu kalibrieren</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function getSegmentLengths(points: any[], scale: number | null): string[] {
  if (!scale || points.length < 2) return [];
  const pixelsToMm = (pixels: number) => pixels / scale;
  
  const lengths: string[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const distancePixels = Math.sqrt(dx * dx + dy * dy);
    const mm = pixelsToMm(distancePixels);
    lengths.push(`${mm.toFixed(1)}mm`);
  }
  return lengths;
}

function formatMeasurement(value: number, unit: string, type: 'distance' | 'area'): string {
  if (type === 'distance') {
    if (unit === 'mm') return `${value.toFixed(1)} mm`;
    if (unit === 'cm') return `${(value / 10).toFixed(1)} cm`;
    return `${(value / 1000).toFixed(2)} m`;
  } else {
    if (unit === 'mm') return `${value.toFixed(0)} mm²`;
    if (unit === 'cm') return `${(value / 100).toFixed(1)} cm²`;
    return `${(value / 1000000).toFixed(2)} m²`;
  }
}

function formatVolume(value: number, unit: string): string {
  if (unit === 'mm') return `${value.toFixed(0)} mm³`;
  if (unit === 'cm') return `${(value / 1000).toFixed(1)} cm³`;
  return `${(value / 1000000000).toFixed(3)} m³`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark, padding: Spacing.xl },
  permissionTitle: { color: Colors.textPrimary, ...Typography.h2, marginTop: Spacing.lg },
  permissionText: { color: Colors.textSecondary, ...Typography.body, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.xl },
  permissionButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  permissionButtonText: { color: Colors.dark, ...Typography.body, fontWeight: '600' },
  skipButton: { marginTop: Spacing.md, padding: Spacing.md },
  skipButtonText: { color: Colors.textSecondary, ...Typography.caption, textDecorationLine: 'underline' },
  camera: { flex: 1 },
  mockCamera: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  mockText: { color: Colors.textSecondary, ...Typography.body, marginTop: Spacing.md },
  filterOverlay: { ...StyleSheet.absoluteFillObject, pointerEvents: 'none' },
  
  // Infrared Filter Styles
  infraredGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.6 },
  infraredTop: { flex: 1, backgroundColor: 'rgba(255, 107, 53, 0.8)' },
  infraredMiddle: { flex: 1, backgroundColor: 'rgba(255, 140, 0, 0.6)' },
  infraredBottom: { flex: 1, backgroundColor: 'rgba(255, 69, 0, 0.4)' },
  infraredScanlines: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'transparent',
    opacity: 0.3,
    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)'
  },
  filterLabel: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    color: '#00FF00', 
    fontSize: 12, 
    fontWeight: 'bold', 
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  infraredCrosshair: { 
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    width: 40, 
    height: 40, 
    marginTop: -20, 
    marginLeft: -20 
  },
  infraredCrosshairH: { 
    position: 'absolute', 
    width: 40, 
    height: 2, 
    backgroundColor: '#00FF00', 
    top: 19, 
    opacity: 0.8 
  },
  infraredCrosshairV: { 
    position: 'absolute', 
    width: 2, 
    height: 40, 
    backgroundColor: '#00FF00', 
    left: 19, 
    opacity: 0.8 
  },
  
  // Thermal Filter Styles
  thermalGradient: { ...StyleSheet.absoluteFillObject, opacity: 0.7 },
  thermalHot: { flex: 1, backgroundColor: 'rgba(255, 0, 0, 0.6)' },
  thermalWarm: { flex: 1, backgroundColor: 'rgba(255, 136, 0, 0.5)' },
  thermalCool: { flex: 1, backgroundColor: 'rgba(255, 255, 0, 0.4)' },
  thermalCold: { flex: 1, backgroundColor: 'rgba(0, 136, 255, 0.3)' },
  thermalNoise: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'transparent',
    opacity: 0.2
  },
  thermalScale: { 
    position: 'absolute', 
    right: 20, 
    top: 100, 
    width: 20, 
    height: 120, 
    borderRadius: 10,
    overflow: 'hidden'
  },
  thermalScaleBar: { 
    flex: 1, 
    width: '100%' 
  },
  thermalTemp: { 
    position: 'absolute', 
    top: 60, 
    left: 20, 
    color: '#FF4500', 
    fontSize: 16, 
    fontWeight: 'bold', 
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  crosshair: { position: 'absolute', top: SCREEN_HEIGHT / 2 - 12, left: SCREEN_WIDTH / 2 - 12, width: 24, height: 24, pointerEvents: 'none' },
  crosshairH: { position: 'absolute', width: 24, height: 1, backgroundColor: 'rgba(255,255,255,0.6)', top: 11 },
  crosshairV: { position: 'absolute', width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.6)', left: 11 },
  topBar: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.md },
  topCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calibrateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,152,0,0.8)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 16, gap: 4 },
  calibrateText: { color: Colors.light, ...Typography.caption, fontWeight: '600' },
  filterBadge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 16 },
  filterText: { color: Colors.light, ...Typography.caption, fontWeight: '500' },
  resultContainer: { position: 'absolute', top: 120, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.75)', padding: Spacing.md, borderRadius: BorderRadius.md, pointerEvents: 'none' },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  resultLabel: { color: Colors.textSecondary, ...Typography.caption },
  resultValue: { color: Colors.primary, ...Typography.body, fontWeight: 'bold' },
  volumeButton: { marginTop: Spacing.sm, backgroundColor: Colors.volume, padding: Spacing.sm, borderRadius: BorderRadius.sm, alignItems: 'center' },
  volumeButtonText: { color: Colors.dark, ...Typography.caption, fontWeight: '600' },
  bottomMenu: { position: 'absolute', bottom: 40, left: 0, right: 0, paddingHorizontal: Spacing.md },
  modeRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  modeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 20, gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  modeButtonActive: { backgroundColor: 'rgba(255,255,255,0.25)', borderColor: Colors.primary },
  modeButtonText: { color: Colors.light, fontSize: 12, fontWeight: '300' },
  actionRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
  captureButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: Colors.light, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  captureButtonInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.light },
  recordingButton: { borderColor: Colors.danger },
  recordingInner: { width: 24, height: 24, borderRadius: 4, backgroundColor: Colors.danger },
  measureControls: { flexDirection: 'row', gap: Spacing.sm },
  controlButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  measureSelector: { position: 'absolute', left: 0, right: 0, height: 350, backgroundColor: Colors.dark, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg },
  selectorHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  selectorTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '300', marginBottom: Spacing.md },
  selectorItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: 12, marginBottom: Spacing.sm, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
  selectorItemActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,255,255,0.1)' },
  selectorItemText: { marginLeft: Spacing.md },
  selectorItemTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '400' },
  selectorItemSubtitle: { color: Colors.textSecondary, fontSize: 12 },
  settingsPanel: { position: 'absolute', right: 0, top: 0, bottom: 0, width: SCREEN_WIDTH * 0.85, backgroundColor: Colors.dark, padding: Spacing.lg },
  settingsPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: Spacing.xl },
  settingsPanelTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '300' },
  settingsContent: { flex: 1 },
  settingGroup: { marginBottom: Spacing.xl },
  settingLabel: { color: Colors.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md },
  settingOptions: { gap: Spacing.sm },
  settingOption: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' },
  settingOptionActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,255,255,0.1)' },
  settingOptionText: { color: Colors.textSecondary, fontSize: 14 },
  settingOptionTextActive: { color: Colors.primary, fontWeight: '500' },
  calibrationInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  calibrationInfoText: { color: Colors.textPrimary, fontSize: 14 },
  recalibrateButton: { padding: Spacing.md, backgroundColor: 'rgba(255,152,0,0.2)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,152,0,0.5)' },
  recalibrateButtonText: { color: '#FF9800', fontSize: 14, textAlign: 'center', fontWeight: '500' },
  calibrationOverlay: { position: 'absolute', top: 80, left: 20, right: 20, alignItems: 'center' },
  calibrationBox: { backgroundColor: 'rgba(0,0,0,0.85)', padding: 20, borderRadius: 16, alignItems: 'center', maxWidth: SCREEN_WIDTH - 40 },
  calibrationTitle: { color: Colors.light, fontSize: 20, fontWeight: 'bold', marginTop: 12, marginBottom: 12 },
  calibrationText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  calibrationStep: { color: Colors.primary, fontSize: 16, fontWeight: 'bold', marginTop: 16 },
  calibrationButtons: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 },
  calibrationButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  calibrationButtonText: { color: Colors.light, fontSize: 14, fontWeight: '600' },
  volumeModal: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  volumeModalContent: { backgroundColor: Colors.dark, padding: 24, borderRadius: 16, width: SCREEN_WIDTH - 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  volumeModalTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '300', marginBottom: 16 },
  volumeModalLabel: { color: Colors.textSecondary, fontSize: 14, marginBottom: 16 },
  volumeInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  volumeInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: Colors.light, padding: 12, borderRadius: 8, fontSize: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  volumeUnit: { color: Colors.textPrimary, fontSize: 16, marginLeft: 12, fontWeight: '600' },
  volumeModalButtons: { flexDirection: 'row', gap: 12 },
  volumeModalButton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  volumeModalButtonPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  volumeModalButtonText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' },
  volumeModalButtonTextPrimary: { color: Colors.dark },
});
