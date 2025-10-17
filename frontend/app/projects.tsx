import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMeasurementStore, Measurement } from '../store/measurementStore';
import { useRouter } from 'expo-router';

export default function ProjectsScreen() {
  const { measurements, deleteMeasurement, loadMeasurements } = useMeasurementStore();
  const router = useRouter();

  useEffect(() => {
    loadMeasurements();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Projekt löschen',
      'Möchten Sie dieses Projekt wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => deleteMeasurement(id),
        },
      ]
    );
  };

  const formatResult = (measurement: Measurement) => {
    const { result, mode, unit } = measurement;

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

    if (mode === 'volume' && result.volume) {
      const mm3 = result.volume;
      if (unit === 'metric') {
        return `${(mm3 / 1000000000).toFixed(2)} m³`;
      } else {
        const cuft = mm3 / 28316846.592;
        return `${cuft.toFixed(2)} cu ft`;
      }
    }

    return 'N/A';
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'distance':
        return 'resize';
      case 'area':
        return 'square-outline';
      case 'volume':
        return 'cube-outline';
      default:
        return 'document-outline';
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
        return '#888';
    }
  };

  const renderItem = ({ item }: { item: Measurement }) => (
    <View style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getModeColor(item.mode) }]}>
          <Ionicons name={getModeIcon(item.mode)} size={24} color="white" />
        </View>
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>{item.name}</Text>
          <Text style={styles.projectDate}>
            {new Date(item.timestamp).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>
          {item.mode === 'distance'
            ? 'Länge:'
            : item.mode === 'area'
            ? 'Fläche:'
            : 'Volumen:'}
        </Text>
        <Text style={styles.resultValue}>{formatResult(item)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meine Projekte</Text>
        <View style={{ width: 44 }} />
      </View>

      {measurements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color="#555" />
          <Text style={styles.emptyText}>Keine Projekte vorhanden</Text>
          <Text style={styles.emptySubtext}>
            Erstellen Sie Ihre erste Messung, um sie hier zu sehen
          </Text>
        </View>
      ) : (
        <FlatList
          data={measurements}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  projectDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  resultLabel: {
    fontSize: 14,
    color: '#888',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});