# 📱 AR Mess-App - Native Android Mess-Anwendung

Eine vollständige Android-App für präzise Distanz-, Flächen- und Volumenmessungen mit der Smartphone-Kamera.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Platform](https://img.shields.io/badge/Platform-Android-blue)
![Tech](https://img.shields.io/badge/Tech-React%20Native%20%7C%20Expo-orange)

## 🎯 Features

### Messmodi
- **📏 Distanzmessung** - Punkt-zu-Punkt mit Segmentanzeige
- **📐 Flächenmessung** - Polygon-basiert (m²)
- **📦 Volumenmessung** - Fläche × Höhe (m³)

### Kamera & Medien
- **📷 Foto-Aufnahme** - Speicherung in Galerie
- **🎥 Video-Aufnahme** - Mit Mikrofon-Support
- **🎨 Filter** - Infrarot & Thermal (Spaß-Modi)

### Funktionalität
- ✅ Kalibrierung mit A4-Blatt (210mm)
- ✅ Einheiten: mm / cm / m
- ✅ Punktbeschriftungen (P1, P2, ...)
- ✅ Live-Messwert-Anzeige
- ✅ 😊 Smiley-Messpunkte
- ✅ Transparentes, elegantes UI

## 🚀 APK Build (3 Schritte)

### 1. Repository klonen
```bash
git clone https://github.com/IHR-USERNAME/ar-mess-app.git
cd ar-mess-app/frontend
```

### 2. Dependencies installieren
```bash
npm install -g eas-cli
yarn install
```

### 3. APK bauen
```bash
eas login
eas build -p android --profile apk
```

⏳ Warten Sie 10-20 Minuten → APK-Download-Link erhalten!

## 📦 Tech Stack

- **Frontend:** Expo SDK 54, React Native, TypeScript
- **State:** Zustand, AsyncStorage
- **Backend:** FastAPI, MongoDB, Motor
- **Build:** EAS Build (Expo Application Services)

## 📱 Installation

1. APK herunterladen vom Build-Link
2. Auf Android-Gerät übertragen
3. APK installieren
4. Berechtigungen erteilen (Kamera, Mikrofon, Speicher)
5. App starten!

## 📂 Projekt-Struktur

```
ar-mess-app/
├── frontend/                # Expo React Native App
│   ├── app/                # Expo Router Pages
│   │   ├── index.tsx      # Haupt-Kamera-Screen
│   │   └── _layout.tsx    # Navigation Layout
│   ├── components/         # React Components
│   │   └── MainCameraScreen.tsx
│   ├── store/             # Zustand State
│   │   ├── cameraStore.ts
│   │   └── measurementStore.ts
│   ├── constants/         # Design System
│   │   └── theme.ts
│   ├── app.json          # Expo Config
│   ├── eas.json          # Build Config
│   └── package.json
├── backend/               # FastAPI Server
│   ├── server.py         # API Endpoints
│   └── requirements.txt
└── README.md
```

## 🧮 Berechnungen

- **Distanz:** Pythagorean Theorem + Kalibrierung
- **Fläche:** Shoelace-Algorithmus für Polygone
- **Volumen:** Fläche × Höhe (Höheneingabe)
- **Kalibrierung:** Pixel/mm Berechnung mit A4-Referenz

## 🎨 Design

- **Farben:** Hellblau, Hellgrün, Gelb, Schwarz, Weiß, Rot
- **Style:** Minimalistisch, transparente Overlays
- **Typography:** Light-weight (300-400)
- **Layout:** Responsive, Touch-Friendly (44px min)

## 📚 Dokumentation

- [APK Build Anleitung](APK_BUILD_ANLEITUNG.md) - Detailliert
- [Anfänger Anleitung](ANFAENGER_ANLEITUNG.md) - Für Einsteiger
- [README Deutsch](README_DE.md) - Deutsche Version

## 🔑 Android Konfiguration

**Package:** `com.armessapp.mobile`  
**Permissions:**
- CAMERA
- RECORD_AUDIO
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE
- READ_MEDIA_IMAGES
- READ_MEDIA_VIDEO

## 🐛 Bekannte Limitierungen

- Web-Preview hat eingeschränkte Kamera-Funktionalität
- Volle Features nur auf echten Android-Geräten
- IR/Thermal-Filter sind visuelle Overlays (keine echten Sensoren)

## 📝 Lizenz

MIT License

## 👨‍💻 Entwickelt mit

- ❤️ Emergent.sh
- ☕ Kaffee
- 🚀 Expo

---

**Status:** ✅ Production Ready | APK Build Ready

**Version:** 1.0.0
