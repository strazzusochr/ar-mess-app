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
              <Circle cx={calibrationPoints[0].x} cy={calibrationPoints[0].y} r={8} fill={Colors.primary} />
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
                <Circle cx={calibrationPoints[0].x} cy={calibrationPoints[0].y} r={8} fill={Colors.primary} />
                <Circle cx={calibrationPoints[1].x} cy={calibrationPoints[1].y} r={8} fill={Colors.primary} />
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

  // ✅ FIX: Video-Aufnahme repariert
  const handleStartRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
        mute: false,
      });
      
      if (video && video.uri) {
        await MediaLibrary.saveToLibraryAsync(video.uri);
        Alert.alert('✓', 'Video gespeichert');
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Video Error:', error);
      Alert.alert('Fehler', 'Aufnahme fehlgeschlagen');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!cameraRef.current) return;
    try {
      cameraRef.current.stopRecording();
    } catch (error) {
      console.error('Stop Recording Error:', error);
      setIsRecording(false);
    }
  };

  // ✅ FIX: Volumenberechnung korrigiert (A × B × H)
  const handleVolumeCalculate = () => {
    const result = calculateResult();
    if (!result.area) {
      Alert.alert('Fehler', 'Erst Fläche (min. 3 Punkte) messen');
      return;
    }
    
    const heightValue = parseFloat(volumeHeight);
    if (isNaN(heightValue) || heightValue <= 0) {
      Alert.alert('Fehler', 'Gültige Höhe eingeben');
      return;
    }

    // Konvertiere alles zu mm
    const areaMm2 = result.area; // area ist bereits in mm²
    const heightMm = measureUnit === 'mm' ? heightValue : measureUnit === 'cm' ? heightValue * 10 : heightValue * 1000;
    
    // Volumen = Fläche × Höhe
    const volumeMm3 = areaMm2 * heightMm;
    const volumeCm3 = volumeMm3 / 1000;
    const volumeM3 = volumeMm3 / 1000000000;
    
    Alert.alert(
      'Volumen (A × B × H)',
      `Grundfläche: ${formatMeasurement(areaMm2, measureUnit, 'area')}\n` +
      `Höhe: ${heightValue} ${measureUnit}\n\n` +
      `Volumen:\n` +
      `• ${volumeMm3.toFixed(0)} mm³\n` +
      `• ${volumeCm3.toFixed(2)} cm³\n` +
      `• ${volumeM3.toFixed(6)} m³`,
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
                    <Circle cx={point.x} cy={point.y} r={8} fill={Colors.distance} />
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
                    <Circle cx={point.x} cy={point.y} r={8} fill={Colors.area} />
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
                <Circle cx={currentPoints[0].x} cy={currentPoints[0].y} r={8} fill={Colors.primary} />
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

            {/* 2 Punkte für Area/Volume → zeige Rechteck */}
            {(measureMode === 'area' || measureMode === 'volume') && currentPoints.length === 2 && (
              <>
                <Line
                  x1={currentPoints[0].x}
                  y1={currentPoints[0].y}
                  x2={currentPoints[1].x}
                  y2={currentPoints[0].y}
                  stroke={Colors.area}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <Line
                  x1={currentPoints[1].x}
                  y1={currentPoints[0].y}
                  x2={currentPoints[1].x}
                  y2={currentPoints[1].y}
                  stroke={Colors.area}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <Line
                  x1={currentPoints[1].x}
                  y1={currentPoints[1].y}
                  x2={currentPoints[0].x}
                  y2={currentPoints[1].y}
                  stroke={Colors.area}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <Line
                  x1={currentPoints[0].x}
                  y1={currentPoints[1].y}
                  x2={currentPoints[0].x}
                  y2={currentPoints[0].y}
                  stroke={Colors.area}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                {currentPoints.map((point, index) => (
                  <React.Fragment key={point.id}>
                    <Circle cx={point.x} cy={point.y} r={8} fill={Colors.area} />
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
          </Svg>

          {/* ✅ FIX: Results Display - zeigt alle Einheiten */}
          {(result.distance || result.area) && (
            <View style={styles.resultContainer}>
              {result.distance && (
                <View style={styles.resultBox}>
                  <Text style={styles.resultLabel}>Gesamtlänge:</Text>
                  <Text style={styles.resultValue}>{formatMeasurement(result.distance, measureUnit, 'distance')}</Text>
                  <View style={styles.allUnitsBox}>
                    <Text style={styles.unitText}>{formatMeasurement(result.distance, 'mm', 'distance')}</Text>
                    <Text style={styles.unitText}>{formatMeasurement(result.distance, 'cm', 'distance')}</Text>
                    <Text style={styles.unitText}>{formatMeasurement(result.distance, 'm', 'distance')}</Text>
                  </View>
                </View>
              )}
              {result.area && (
                <>
                  <View style={styles.resultBox}>
                    <Text style={styles.resultLabel}>Fläche:</Text>
                    <Text style={styles.resultValue}>{formatMeasurement(result.area, measureUnit, 'area')}</Text>
                    <View style={styles.allUnitsBox}>
                      <Text style={styles.unitText}>{formatMeasurement(result.area, 'mm', 'area')}</Text>
                      <Text style={styles.unitText}>{formatMeasurement(result.area, 'cm', 'area')}</Text>
                      <Text style={styles.unitText}>{formatMeasurement(result.area, 'm', 'area')}</Text>
                    </View>
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
                      <Ionicons name="cube-outline" size={20} color={Colors.dark} />
                      <Text style={styles.volumeButtonText}>Volumen berechnen (A×B×H)</Text>
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

      {/* ✅ FIX: Besseres Bottom Menu */}
      <View style={styles.bottomMenu} pointerEvents="box-none">
        <View style={styles.modeRow}>
          <TouchableOpacity 
            style={[styles.modeButton, cameraMode === 'photo' && styles.modeButtonActive]}
            onPress={() => {
              setCameraMode('photo');
              clearPoints();
            }}
          >
            <Ionicons name="camera" size={22} color={Colors.light} />
            <Text style={styles.modeButtonText}>Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modeButton, cameraMode === 'video' && styles.modeButtonActive]}
            onPress={() => {
              setCameraMode('video');
              clearPoints();
            }}
          >
            <Ionicons name="videocam" size={22} color={Colors.light} />
            <Text style={styles.modeButtonText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modeButton, cameraMode === 'measure' && styles.modeButtonActive]}
            onPress={() => {
              setCameraMode('measure');
              toggleModeSelector();
            }}
          >
            <Ionicons name="resize" size={22} color={Colors.light} />
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
              {isRecording && (
                <Text style={styles.recordingText}>REC</Text>
              )}
            </TouchableOpacity>
          )}

          {cameraMode === 'measure' && currentPoints.length > 0 && (
            <View style={styles.measureControls}>
              <TouchableOpacity style={styles.controlButton} onPress={removeLastPoint}>
                <Ionicons name="arrow-undo" size={24} color={Colors.light} />
              </TouchableOpacity>
              {currentPoints.length >= 2 && (
                <TouchableOpacity style={styles.controlButton} onPress={clearPoints}>
                  <Ionicons name="refresh" size={24} color={Colors.light} />
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
            <Text style={styles.volumeModalLabel}>Grundfläche: {formatMeasurement(result.area || 0, measureUnit, 'area')}</Text>
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
              <TouchableOpacity style={styles.volumeModalButton} onPress={() => {
                setShowVolumeInput(false);
                setVolumeHeight('');
              }}>
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
        <Text style={styles.selectorTitle}>Messmodus wählen</Text>
        
        <TouchableOpacity 
          style={[styles.selectorItem, measureMode === 'volume' && styles.selectorItemActive]}
          onPress={() => {
            setMeasureMode('volume');
            clearPoints();
            toggleModeSelector();
          }}
        >
          <Ionicons name="cube-outline" size={28} color={Colors.volume} />
          <View style={styles.selectorItemText}>
            <Text style={styles.selectorItemTitle}>📦 Volumen (A × B × H)</Text>
            <Text style={styles.selectorItemSubtitle}>Fläche messen + Höhe eingeben</Text>
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
                { value: 'mm', label: 'Millimeter (mm)' },
                { value: 'cm', label: 'Zentimeter (cm)' },
                { value: 'm', label: 'Meter (m)' }
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
            <Text style={styles.settingLabel}>KAMERA-FILTER (SPA)</Text>
            <View style={styles.settingOptions}>
              {[
                { value: 'none', label: 'Normal' },
                { value: 'infrared', label: 'Infrarot (Spaß)' },
                { value: 'thermal', label: 'Wärmebild (Spaß)' },
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
                onPress={() => {
                  toggleSettings();
                  setShowCalibration(true);
                }}
              >
                <Text style={styles.recalibrateButtonText}>Neu kalibrieren</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>INFO</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>AR Mess-App v1.0.0</Text>
              <Text style={styles.infoText}>Präzise AR-Messungen</Text>
              <Text style={styles.infoTextSmall}>Kalibrierung empfohlen für beste Ergebnisse</Text>
            </View>
          </View>
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
    if (unit === 'cm') return `${(value / 10).toFixed(2)} cm`;
    return `${(value / 1000).toFixed(4)} m`;
  } else {
    if (unit === 'mm') return `${value.toFixed(0)} mm²`;
    if (unit === 'cm') return `${(value / 100).toFixed(2)} cm²`;
    return `${(value / 1000000).toFixed(6)} m²`;
  }
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
  calibrateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,152,0,0.9)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 20, gap: 6 },
  calibrateText: { color: Colors.light, ...Typography.caption, fontWeight: '700' },
  filterBadge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 16 },
  filterText: { color: Colors.light, ...Typography.caption, fontWeight: '500' },
  
  // ✅ Verbesserte Result Anzeige
  resultContainer: { 
    position: 'absolute', 
    top: 120, 
    left: 16, 
    right: 16, 
    backgroundColor: 'rgba(0,0,0,0.85)', 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.lg, 
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    pointerEvents: 'none' 
  },
  resultBox: { marginBottom: Spacing.md },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  resultLabel: { color: Colors.textSecondary, ...Typography.caption, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  resultValue: { color: Colors.primary, ...Typography.h3, fontWeight: 'bold', marginTop: 4 },
  allUnitsBox: { 
    flexDirection: 'row', 
    gap: Spacing.sm, 
    marginTop: Spacing.xs,
    flexWrap: 'wrap'
  },
  unitText: { 
    color: Colors.textMuted, 
    fontSize: 11, 
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  volumeButton: { 
    marginTop: Spacing.md, 
    backgroundColor: Colors.volume, 
    padding: Spacing.md, 
    borderRadius: BorderRadius.md, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    pointerEvents: 'auto'
  },
  volumeButtonText: { color: Colors.dark, ...Typography.body, fontWeight: '700' },
  
  // ✅ Verbessertes Bottom Menu
  bottomMenu: { position: 'absolute', bottom: 30, left: 0, right: 0, paddingHorizontal: Spacing.md },
  modeRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  modeButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.md, 
    borderRadius: 24, 
    gap: 8, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.2)',
    minWidth: 100,
    justifyContent: 'center'
  },
  modeButtonActive: { 
    backgroundColor: 'rgba(255,255,255,0.25)', 
    borderColor: Colors.primary,
    borderWidth: 2
  },
  modeButtonText: { color: Colors.light, fontSize: 13, fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
  captureButton: { 
    width: 74, 
    height: 74, 
    borderRadius: 37, 
    borderWidth: 4, 
    borderColor: Colors.light, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.4)',
    position: 'relative'
  },
  captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.light },
  recordingButton: { borderColor: Colors.danger },
  recordingInner: { width: 28, height: 28, borderRadius: 6, backgroundColor: Colors.danger },
  recordingText: {
    position: 'absolute',
    bottom: -24,
    color: Colors.danger,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2
  },
  measureControls: { flexDirection: 'row', gap: Spacing.md },
  controlButton: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.2)' 
  },
  
  // Measure Selector
  measureSelector: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    height: 380, 
    backgroundColor: Colors.dark, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  selectorHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg },
  selectorTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '600', marginBottom: Spacing.lg },
  selectorItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Spacing.lg, 
    borderRadius: 16, 
    marginBottom: Spacing.md, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.1)', 
    backgroundColor: 'rgba(255,255,255,0.05)' 
  },
  selectorItemActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,255,255,0.15)' },
  selectorItemText: { marginLeft: Spacing.lg, flex: 1 },
  selectorItemTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  selectorItemSubtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  
  // Settings Panel
  settingsPanel: { 
    position: 'absolute', 
    right: 0, 
    top: 0, 
    bottom: 0, 
    width: SCREEN_WIDTH * 0.85, 
    backgroundColor: Colors.dark, 
    padding: Spacing.xl,
    borderLeftWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  settingsPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 50, marginBottom: Spacing.xl },
  settingsPanelTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '600' },
  settingsContent: { flex: 1 },
  settingGroup: { marginBottom: Spacing.xl },
  settingLabel: { color: Colors.textSecondary, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: Spacing.md, fontWeight: '600' },
  settingOptions: { gap: Spacing.sm },
  settingOption: { 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: Spacing.md, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.1)', 
    backgroundColor: 'rgba(255,255,255,0.05)' 
  },
  settingOptionActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,255,255,0.15)' },
  settingOptionText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
  settingOptionTextActive: { color: Colors.primary, fontWeight: '700' },
  calibrationInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, backgroundColor: 'rgba(129,199,132,0.1)', padding: Spacing.md, borderRadius: 12 },
  calibrationInfoText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  recalibrateButton: { 
    padding: Spacing.md, 
    backgroundColor: 'rgba(255,152,0,0.2)', 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: 'rgba(255,152,0,0.5)' 
  },
  recalibrateButtonText: { color: '#FF9800', fontSize: 14, textAlign: 'center', fontWeight: '600' },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  infoText: {
    color: Colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500'
  },
  infoTextSmall: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic'
  },
  
  // Calibration Screen
  calibrationOverlay: { position: 'absolute', top: 80, left: 20, right: 20, alignItems: 'center' },
  calibrationBox: { backgroundColor: 'rgba(0,0,0,0.9)', padding: 24, borderRadius: 20, alignItems: 'center', maxWidth: SCREEN_WIDTH - 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  calibrationTitle: { color: Colors.light, fontSize: 22, fontWeight: 'bold', marginTop: 12, marginBottom: 12 },
  calibrationText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  calibrationStep: { color: Colors.primary, fontSize: 16, fontWeight: 'bold', marginTop: 16 },
  calibrationButtons: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20 },
  calibrationButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  calibrationButtonText: { color: Colors.light, fontSize: 14, fontWeight: '600' },
  
  // Volume Modal
  volumeModal: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  volumeModalContent: { backgroundColor: Colors.dark, padding: 28, borderRadius: 20, width: SCREEN_WIDTH - 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  volumeModalTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '600', marginBottom: 16 },
  volumeModalLabel: { color: Colors.textSecondary, fontSize: 14, marginBottom: 20 },
  volumeInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  volumeInput: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    color: Colors.light, 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 20, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.2)',
    fontWeight: '600'
  },
  volumeUnit: { color: Colors.textPrimary, fontSize: 18, marginLeft: 16, fontWeight: '700' },
  volumeModalButtons: { flexDirection: 'row', gap: 12 },
  volumeModalButton: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.2)' 
  },
  volumeModalButtonPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  volumeModalButtonText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
  volumeModalButtonTextPrimary: { color: Colors.dark },
});, measureMode === 'distance' && styles.selectorItemActive]}
          onPress={() => {
            setMeasureMode('distance');
            clearPoints();
            toggleModeSelector();
          }}
        >
          <Ionicons name="resize-outline" size={28} color={Colors.distance} />
          <View style={styles.selectorItemText}>
            <Text style={styles.selectorItemTitle}>📏 Distanz</Text>
            <Text style={styles.selectorItemSubtitle}>Längen mit Segmentanzeige messen</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.selectorItem, measureMode === 'area' && styles.selectorItemActive]}
          onPress={() => {
            setMeasureMode('area');
            clearPoints();
            toggleModeSelector();
          }}
        >
          <Ionicons name="square-outline" size={28} color={Colors.area} />
          <View style={styles.selectorItemText}>
            <Text style={styles.selectorItemTitle}>📐 Fläche (A × B)</Text>
            <Text style={styles.selectorItemSubtitle}>2+ Punkte für Flächenberechnung</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.selectorItem
