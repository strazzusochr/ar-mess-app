import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MeasurementMode = 'distance' | 'area' | 'volume';
export type Unit = 'metric' | 'imperial';

export interface Point {
  x: number;
  y: number;
  id: string;
}

export interface Measurement {
  id: string;
  name: string;
  mode: MeasurementMode;
  points: Point[];
  calibrationScale: number; // pixels per mm
  result: {
    distance?: number; // in mm
    area?: number; // in mm²
    volume?: number; // in mm³
    perimeter?: number; // in mm
  };
  unit: Unit;
  timestamp: number;
  imageData?: string; // base64
}

interface MeasurementState {
  measurements: Measurement[];
  currentMode: MeasurementMode;
  currentPoints: Point[];
  calibrationScale: number | null;
  isCalibrated: boolean;
  unit: Unit;
  currentMeasurement: Measurement | null;
  
  // Actions
  setMode: (mode: MeasurementMode) => void;
  addPoint: (point: Omit<Point, 'id'>) => void;
  removeLastPoint: () => void;
  clearPoints: () => void;
  setCalibration: (scale: number) => void;
  toggleUnit: () => void;
  saveMeasurement: (name: string, imageData?: string) => Promise<void>;
  loadMeasurements: () => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  calculateResult: () => { distance?: number; area?: number; volume?: number; perimeter?: number };
}

const STORAGE_KEY = '@measurements';

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  measurements: [],
  currentMode: 'distance',
  currentPoints: [],
  calibrationScale: null,
  isCalibrated: false,
  unit: 'metric',
  currentMeasurement: null,

  setMode: (mode) => set({ currentMode: mode, currentPoints: [] }),

  addPoint: (point) => {
    const newPoint = { ...point, id: Date.now().toString() };
    set((state) => ({ currentPoints: [...state.currentPoints, newPoint] }));
  },

  removeLastPoint: () => {
    set((state) => ({
      currentPoints: state.currentPoints.slice(0, -1),
    }));
  },

  clearPoints: () => set({ currentPoints: [] }),

  setCalibration: (scale) => set({ calibrationScale: scale, isCalibrated: true }),

  toggleUnit: () => set((state) => ({ unit: state.unit === 'metric' ? 'imperial' : 'metric' })),

  calculateResult: () => {
    const { currentPoints, calibrationScale, currentMode } = get();
    if (!calibrationScale || currentPoints.length < 2) return {};

    const pixelsToMm = (pixels: number) => pixels / calibrationScale;

    if (currentMode === 'distance') {
      let totalDistance = 0;
      for (let i = 0; i < currentPoints.length - 1; i++) {
        const dx = currentPoints[i + 1].x - currentPoints[i].x;
        const dy = currentPoints[i + 1].y - currentPoints[i].y;
        const distancePixels = Math.sqrt(dx * dx + dy * dy);
        totalDistance += pixelsToMm(distancePixels);
      }
      return { distance: totalDistance };
    }

    if ((currentMode === 'area' || currentMode === 'volume') && currentPoints.length >= 3) {
      // Shoelace formula for polygon area
      let area = 0;
      let perimeter = 0;
      const n = currentPoints.length;

      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const xi = pixelsToMm(currentPoints[i].x);
        const yi = pixelsToMm(currentPoints[i].y);
        const xj = pixelsToMm(currentPoints[j].x);
        const yj = pixelsToMm(currentPoints[j].y);

        area += xi * yj - xj * yi;

        const dx = xj - xi;
        const dy = yj - yi;
        perimeter += Math.sqrt(dx * dx + dy * dy);
      }

      area = Math.abs(area) / 2;
      return { area, perimeter };
    }

    return {};
  },

  saveMeasurement: async (name, imageData) => {
    const { currentMode, currentPoints, calibrationScale, unit } = get();
    if (!calibrationScale || currentPoints.length < 2) return;

    const result = get().calculateResult();
    const measurement: Measurement = {
      id: Date.now().toString(),
      name,
      mode: currentMode,
      points: currentPoints,
      calibrationScale,
      result,
      unit,
      timestamp: Date.now(),
      imageData,
    };

    const measurements = [...get().measurements, measurement];
    set({ measurements, currentPoints: [] });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
    } catch (error) {
      console.error('Error saving measurement:', error);
    }
  },

  loadMeasurements: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const measurements = JSON.parse(data);
        set({ measurements });
      }
    } catch (error) {
      console.error('Error loading measurements:', error);
    }
  },

  deleteMeasurement: async (id) => {
    const measurements = get().measurements.filter((m) => m.id !== id);
    set({ measurements });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
    } catch (error) {
      console.error('Error deleting measurement:', error);
    }
  },
}));