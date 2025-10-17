import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import Svg, { Line, Circle, Polygon } from 'react-native-svg';
import { useCameraStore } from '../store/cameraStore';
import { useMeasurementStore } from '../store/measurementStore';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MainCamera() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  
  const cameraRef = useRef<any>(null);
  const recordingRef = useRef<any>(null);
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
    setRecordingDuration,
    toggleSettings,
    toggleModeSelector,
  } = useCameraStore();
  
  const {
    currentPoints,
    isCalibrated,
    addPoint,
    removeLastPoint,
    clearPoints,
    calculateResult,
  } = useMeasurementStore();

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showModeSelector ? SCREEN_HEIGHT - 280 : SCREEN_HEIGHT,
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

  if (!cameraPermission || !mediaPermission || !audioPermission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Lädt...</Text>
      </View>
    );
  }

  // Skip permissions for web browser (testing mode)
  const isWeb = Platform.OS === 'web';
  const [skipPermissions, setSkipPermissions] = useState(false);
  
  if (!isWeb && !skipPermissions && (!cameraPermission.granted || !mediaPermission.granted || !audioPermission.granted)) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors.primary} />
        <Text style={styles.permissionTitle}>Berechtigungen erforderlich</Text>
        <Text style={styles.permissionText}>
          Diese App benötigt Zugriff auf Kamera, Mikrofon und Medienbibliothek
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={async () => {
            await requestCameraPermission();
            await requestMediaPermission();
            await requestAudioPermission();
          }}
        >
          <Text style={styles.permissionButtonText}>Berechtigungen erteilen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={() => setSkipPermissions(true)}
        >
          <Text style={styles.skipButtonText}>Überspringen (Test-Modus)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: getPhotoQuality(),
      });
      
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      Alert.alert('Erfolg', 'Foto gespeichert!');
    } catch (error) {
      console.error('Photo error:', error);
      Alert.alert('Fehler', 'Foto konnte nicht gespeichert werden');
    }
  };

  const handleStartRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    
    try {
      recordingRef.current = cameraRef.current.recordAsync();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Fehler', 'Aufnahme konnte nicht gestartet werden');
    }
  };

  const handleStopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;
    
    try {
      cameraRef.current.stopRecording();
      const video = await recordingRef.current;
      
      if (video && video.uri) {
        await MediaLibrary.saveToLibraryAsync(video.uri);
        Alert.alert('Erfolg', 'Video gespeichert!');
      }
      
      setIsRecording(false);
      setRecordingDuration(0);
      recordingRef.current = null;
    } catch (error) {
      console.error('Stop recording error:', error);
      setIsRecording(false);
    }
  };

  const handleTap = (event: any) => {
    if (cameraMode !== 'measure') return;
    if (!isCalibrated) {
      Alert.alert('Hinweis', 'Bitte kalibrieren Sie zuerst für präzise Messungen');
    }
    
    const { locationX, locationY } = event.nativeEvent;
    addPoint({ x: locationX, y: locationY });
  };

  const getPhotoQuality = () => {
    switch (videoQuality) {
      case '480p': return 0.3;
      case '720p': return 0.5;
      case '1080p': return 0.7;
      case '2k': return 0.85;
      case '4k': return 1.0;
      default: return 0.7;
    }
  };

  const result = cameraMode === 'measure' ? calculateResult() : {};

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        {/* Filter Overlay for IR/Thermal */}
        {filter !== 'none' && (
          <View style={[
            styles.filterOverlay,
            filter === 'infrared' && styles.infraredOverlay,
            filter === 'thermal' && styles.thermalOverlay,
          ]} />
        )}

        {/* Touch Area for Measurement */}
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
              {measureMode === 'distance' && currentPoints.length >= 2 && (
                <>
                  {currentPoints.map((point, index) => (
                    <React.Fragment key={point.id}>
                      {index > 0 && (
                        <Line
                          x1={currentPoints[index - 1].x}
                          y1={currentPoints[index - 1].y}
                          x2={point.x}
                          y2={point.y}
                          stroke={Colors.distance}
                          strokeWidth="2"
                        />
                      )}
                      <Circle cx={point.x} cy={point.y} r="4" fill={Colors.distance} />
                    </React.Fragment>
                  ))}
                </>
              )}

              {(measureMode === 'area' || measureMode === 'volume') && currentPoints.length >= 3 && (
                <>
                  <Polygon
                    points={currentPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="rgba(129, 199, 132, 0.15)"
                    stroke={Colors.area}
                    strokeWidth="2"
                  />
                  {currentPoints.map((point) => (
                    <Circle key={point.id} cx={point.x} cy={point.y} r="4" fill={Colors.area} />
                  ))}
                </>
              )}

              {currentPoints.length === 1 && (
                <Circle cx={currentPoints[0].x} cy={currentPoints[0].y} r="4" fill={Colors.primary} />
              )}
            </Svg>

            {(result.distance || result.area) && (
              <View style={styles.resultBadge}>
                <Text style={styles.resultText}>
                  {formatMeasurement(result, measureMode, measureUnit)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleSettings}>
            <Ionicons name="settings-outline" size={22} color={Colors.light} />
          </TouchableOpacity>
          
          <View style={styles.filterBadge}>
            <Text style={styles.filterText}>
              {filter === 'infrared' ? 'IR' : filter === 'thermal' ? 'Thermal' : 'Normal'}
            </Text>
          </View>
          
          <View style={{ width: 40 }} />
        </View>

        {/* Bottom Menu */}
        <View style={styles.bottomMenu}>
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

        {/* Measure Mode Selector */}
        <Animated.View style={[styles.measureSelector, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.selectorHandle} />
          <Text style={styles.selectorTitle}>Messmodus wählen</Text>
          
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
              <Text style={styles.selectorItemSubtitle}>Längen messen</Text>
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
              <Text style={styles.selectorItemSubtitle}>Flächen berechnen</Text>
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
              <Text style={styles.selectorItemSubtitle}>Volumina berechnen</Text>
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

          <View style={styles.settingsContent}>
            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Maßeinheit</Text>
              <View style={styles.settingOptions}>
                {['mm', 'cm', 'm'].map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.settingOption, measureUnit === unit && styles.settingOptionActive]}
                    onPress={() => setMeasureUnit(unit as any)}
                  >
                    <Text style={[styles.settingOptionText, measureUnit === unit && styles.settingOptionTextActive]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingGroup}>
              <Text style={styles.settingLabel}>Qualität</Text>
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
              <Text style={styles.settingLabel}>Filter</Text>
              <View style={styles.settingOptions}>
                {[
                  { value: 'none', label: 'Normal' },
                  { value: 'infrared', label: 'Infrarot' },
                  { value: 'thermal', label: 'Wärme' },
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
          </View>
        </Animated.View>
      </CameraView>
    </View>
  );
}

function formatMeasurement(result: any, mode: string, unit: string): string {
  if (mode === 'distance' && result.distance) {
    const mm = result.distance;
    if (unit === 'mm') return `${mm.toFixed(1)} mm`;
    if (unit === 'cm') return `${(mm / 10).toFixed(1)} cm`;
    if (unit === 'm') return `${(mm / 1000).toFixed(2)} m`;
  }

  if (mode === 'area' && result.area) {
    const mm2 = result.area;
    if (unit === 'mm') return `${mm2.toFixed(0)} mm²`;
    if (unit === 'cm') return `${(mm2 / 100).toFixed(1)} cm²`;
    if (unit === 'm') return `${(mm2 / 1000000).toFixed(2)} m²`;
  }

  return '';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark,
  },
  loadingText: {
    color: Colors.textPrimary,
    ...Typography.body,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark,
    padding: Spacing.xl,
  },
  permissionTitle: {
    color: Colors.textPrimary,
    ...Typography.h2,
    marginTop: Spacing.lg,
  },
  permissionText: {
    color: Colors.textSecondary,
    ...Typography.body,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  permissionButtonText: {
    color: Colors.dark,
    ...Typography.body,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
    pointerEvents: 'none',
  },
  infraredOverlay: {
    backgroundColor: '#FF6B35',
  },
  thermalOverlay: {
    backgroundColor: '#FFD23F',
  },
  crosshair: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 2 - 12,
    left: SCREEN_WIDTH / 2 - 12,
    width: 24,
    height: 24,
    pointerEvents: 'none',
  },
  crosshairH: {
    position: 'absolute',
    width: 24,
    height: 1,
    backgroundColor: Colors.light,
    top: 11,
  },
  crosshairV: {
    position: 'absolute',
    width: 1,
    height: 24,
    backgroundColor: Colors.light,
    left: 11,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    pointerEvents: 'box-none',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    backgroundColor: Colors.overlay,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterText: {
    color: Colors.light,
    ...Typography.caption,
    fontWeight: '500',
  },
  resultBadge: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    backgroundColor: Colors.overlay,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    pointerEvents: 'none',
  },
  resultText: {
    color: Colors.primary,
    ...Typography.h3,
    fontWeight: '300',
  },
  bottomMenu: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    pointerEvents: 'box-none',
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButtonActive: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.primary,
  },
  modeButtonText: {
    color: Colors.light,
    ...Typography.caption,
    fontWeight: '300',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: Colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.overlay,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light,
  },
  recordingButton: {
    borderColor: Colors.danger,
  },
  recordingInner: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.danger,
  },
  measureControls: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  measureSelector: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: Colors.dark,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  selectorHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  selectorTitle: {
    color: Colors.textPrimary,
    ...Typography.h3,
    fontWeight: '300',
    marginBottom: Spacing.md,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selectorItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  selectorItemText: {
    marginLeft: Spacing.md,
  },
  selectorItemTitle: {
    color: Colors.textPrimary,
    ...Typography.body,
    fontWeight: '400',
  },
  selectorItemSubtitle: {
    color: Colors.textSecondary,
    ...Typography.caption,
  },
  settingsPanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: Colors.dark,
    padding: Spacing.lg,
  },
  settingsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: Spacing.xl,
  },
  settingsPanelTitle: {
    color: Colors.textPrimary,
    ...Typography.h2,
    fontWeight: '300',
  },
  settingsContent: {
    gap: Spacing.xl,
  },
  settingGroup: {
    gap: Spacing.md,
  },
  settingLabel: {
    color: Colors.textSecondary,
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  settingOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  settingOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  settingOptionText: {
    color: Colors.textSecondary,
    ...Typography.caption,
  },
  settingOptionTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
});