import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VolumeInputProps {
  visible: boolean;
  onClose: () => void;
  onCalculate: (height: number) => void;
  areaValue: number;
  unit: string;
}

export default function VolumeInput({
  visible,
  onClose,
  onCalculate,
  areaValue,
  unit,
}: VolumeInputProps) {
  const [height, setHeight] = useState('');

  const handleCalculate = () => {
    const heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum <= 0) {
      Alert.alert('Fehler', 'Bitte geben Sie eine gültige Höhe ein');
      return;
    }
    onCalculate(heightNum);
    setHeight('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Volumenberechnung</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Gemessene Fläche:</Text>
              <Text style={styles.value}>
                {areaValue.toFixed(2)} {unit === 'metric' ? 'm²' : 'sq ft'}
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Höhe eingeben:</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#666"
                />
                <Text style={styles.unitText}>{unit === 'metric' ? 'm' : 'ft'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
              <Ionicons name="calculator" size={24} color="white" />
              <Text style={styles.calculateButtonText}>Volumen berechnen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    color: '#888',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    padding: 16,
  },
  unitText: {
    fontSize: 16,
    color: '#888',
    paddingRight: 16,
    fontWeight: '600',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
