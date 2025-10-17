import React, { useEffect, useState } from 'react';
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
import { Link } from 'expo-router';

export default function HomeScreen() {
  const { setMode, isCalibrated, loadMeasurements } = useMeasurementStore();

  useEffect(() => {
    loadMeasurements();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="ruler" size={64} color="#2196F3" />
          <Text style={styles.title}>AR Mess-App</Text>
          <Text style={styles.subtitle}>
            Professionelle Distanz-, Flächen- und Volumenmessung
          </Text>
        </View>

        {!isCalibrated && (
          <View style={styles.calibrationBanner}>
            <Ionicons name="warning" size={24} color="#ff9800" />
            <Text style={styles.calibrationText}>
              Kalibrierung empfohlen für präzise Messungen
            </Text>
          </View>
        )}

        <View style={styles.modeGrid}>
          <Link href="/measure" asChild onPress={() => setMode('distance')}>
            <TouchableOpacity style={styles.modeCard}>
              <Ionicons name="resize" size={48} color="#4CAF50" />
              <Text style={styles.modeTitle}>Distanz</Text>
              <Text style={styles.modeDescription}>
                Messen Sie Längen und Abstände mit Kettenmessung
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/measure" asChild onPress={() => setMode('area')}>
            <TouchableOpacity style={styles.modeCard}>
              <Ionicons name="square-outline" size={48} color="#2196F3" />
              <Text style={styles.modeTitle}>Fläche</Text>
              <Text style={styles.modeDescription}>
                Berechnen Sie Flächen durch Polygon-Markierung
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/measure" asChild onPress={() => setMode('volume')}>
            <TouchableOpacity style={styles.modeCard}>
              <Ionicons name="cube-outline" size={48} color="#FF9800" />
              <Text style={styles.modeTitle}>Volumen</Text>
              <Text style={styles.modeDescription}>
                Berechnen Sie Volumina von Objekten
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.bottomButtons}>
          {!isCalibrated && (
            <Link href="/calibration" asChild>
              <TouchableOpacity style={styles.calibrateButton}>
                <Ionicons name="settings-outline" size={24} color="white" />
                <Text style={styles.calibrateButtonText}>Kalibrieren</Text>
              </TouchableOpacity>
            </Link>
          )}

          <Link href="/projects" asChild>
            <TouchableOpacity style={styles.projectsButton}>
              <Ionicons name="folder-open-outline" size={24} color="white" />
              <Text style={styles.projectsButtonText}>Meine Projekte</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  calibrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  calibrationText: {
    color: '#ff9800',
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
  },
  modeGrid: {
    gap: 16,
  },
  modeCard: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  modeDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomButtons: {
    marginTop: 24,
    gap: 12,
  },
  calibrateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  calibrateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  projectsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  projectsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});