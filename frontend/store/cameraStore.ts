import { create } from 'zustand';

export type CameraMode = 'photo' | 'video' | 'measure';
export type MeasureMode = 'distance' | 'area' | 'volume';
export type CameraFilter = 'none' | 'infrared' | 'thermal';
export type VideoQuality = '480p' | '720p' | '1080p' | '2k' | '4k';
export type MeasureUnit = 'mm' | 'cm' | 'm';

interface CameraState {
  // Camera Settings
  cameraMode: CameraMode;
  measureMode: MeasureMode;
  filter: CameraFilter;
  videoQuality: VideoQuality;
  measureUnit: MeasureUnit;
  
  // Recording State
  isRecording: boolean;
  recordingDuration: number;
  
  // UI State
  showSettings: boolean;
  showModeSelector: boolean;
  
  // Actions
  setCameraMode: (mode: CameraMode) => void;
  setMeasureMode: (mode: MeasureMode) => void;
  setFilter: (filter: CameraFilter) => void;
  setVideoQuality: (quality: VideoQuality) => void;
  setMeasureUnit: (unit: MeasureUnit) => void;
  setIsRecording: (recording: boolean) => void;
  setRecordingDuration: (duration: number) => void;
  toggleSettings: () => void;
  toggleModeSelector: () => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  cameraMode: 'measure',
  measureMode: 'distance',
  filter: 'none',
  videoQuality: '1080p',
  measureUnit: 'm',
  isRecording: false,
  recordingDuration: 0,
  showSettings: false,
  showModeSelector: false,
  
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setMeasureMode: (mode) => set({ measureMode: mode }),
  setFilter: (filter) => set({ filter }),
  setVideoQuality: (quality) => set({ videoQuality: quality }),
  setMeasureUnit: (unit) => set({ measureUnit: unit }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setRecordingDuration: (duration) => set({ recordingDuration: duration }),
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  toggleModeSelector: () => set((state) => ({ showModeSelector: !state.showModeSelector })),
}));