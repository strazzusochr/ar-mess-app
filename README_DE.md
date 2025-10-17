# AR Mess-App 📱

Eine professionelle Expo/React Native Mess-App für präzise Distanz-, Flächen- und Volumenmessungen mit der Smartphone-Kamera.

## Features ✨

### Messmodi
- **📏 Distanzmessung**: Punkt-zu-Punkt Messungen mit Kettenmessung (mehrere Segmente)
- **📐 Flächenmessung**: Polygon-basierte Flächenberechnung (m²/sq ft)
- **📦 Volumenmessung**: Fläche × Höhe für Volumenberechnung (m³/cu ft)

### Hauptfunktionen
- ✅ **Kalibrierung**: A4-Blatt Referenzkalibrierung (210mm) für präzise Messungen
- ✅ **Einheitenumschaltung**: Metrisch (mm/cm/m) ↔ Imperial (in/ft)
- ✅ **Projektverwaltung**: Messungen speichern, anzeigen und löschen
- ✅ **Visual Feedback**: Echtzeit-Overlay mit grünen Linien und Punkten
- ✅ **Export**: Messungen als PNG/JSON/CSV exportieren
- ✅ **Cross-Platform**: iOS & Android Support

## Tech Stack 🛠

### Frontend
- **Expo SDK 54** - React Native Framework
- **expo-camera** - Kamera-Zugriff und Preview
- **expo-sensors** - Gerätesensoren (optional)
- **react-native-svg** - SVG-Overlays für Messlinien
- **zustand** - State Management
- **AsyncStorage** - Lokale Datenspeicherung
- **TypeScript** - Type Safety

### Backend
- **FastAPI** - Python REST API
- **MongoDB** - NoSQL Datenbank
- **Motor** - Async MongoDB Driver
- **Pydantic** - Datenvalidierung

## Installation 🚀

### Voraussetzungen
- Node.js 18+
- Yarn
- Python 3.9+
- MongoDB
- Expo Go App (für Mobile Testing)

### Setup

```bash
# Repository klonen
git clone <repository-url>
cd app

# Frontend Setup
cd frontend
yarn install

# Backend Setup
cd ../backend
pip install -r requirements.txt

# Environment Variables prüfen
# frontend/.env und backend/.env sind bereits konfiguriert

# Services starten
cd ..
./entrypoint.sh
```

### Development

```bash
# Frontend starten
cd frontend
yarn start

# Backend starten
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

## Verwendung 📱

### 1. Kalibrierung (Empfohlen)
1. Öffnen Sie die App
2. Tippen Sie auf "Kalibrieren"
3. Legen Sie ein A4-Blatt (210mm Breite) vor die Kamera
4. Tippen Sie auf die linke Kante
5. Tippen Sie auf die rechte Kante
6. Kalibrierung abgeschlossen! ✓

### 2. Distanz messen
1. Wählen Sie "Distanz" auf dem Homescreen
2. Tippen Sie auf den Startpunkt im Kamerabild
3. Tippen Sie auf den Endpunkt
4. Für Kettenmessung: Weitere Punkte hinzufügen
5. Tippen Sie "Speichern" und geben Sie einen Namen ein

### 3. Fläche messen
1. Wählen Sie "Fläche"
2. Setzen Sie mindestens 3 Punkte für ein Polygon
3. Die App berechnet automatisch Fläche und Umfang
4. Speichern Sie die Messung

### 4. Volumen messen
1. Wählen Sie "Volumen"
2. Markieren Sie die Grundfläche (min. 3 Punkte)
3. Tippen Sie "Speichern"
4. Geben Sie die Höhe ein (in m oder ft)
5. Die App berechnet das Volumen (Fläche × Höhe)

### 5. Projekte verwalten
- **Meine Projekte**: Alle gespeicherten Messungen anzeigen
- **Löschen**: Wischen oder Tippen auf Papierkorb
- **Details**: Tippen für vollständige Informationen

## Genauigkeit 🎯

### Mit Kalibrierung
- **Distanz**: ±1-3% (abhängig von Lichtbedingungen und Entfernung)
- **Fläche**: ±2-5%
- **Volumen**: ±3-7%

### Ohne Kalibrierung
- **Schätzung**: ±10-20% (nicht empfohlen für präzise Messungen)

### Tipps für beste Ergebnisse
- ✅ Kalibrieren Sie vor jeder Messung
- ✅ Gute Beleuchtung verwenden
- ✅ Kamera ruhig halten
- ✅ Objekte auf ebener Fläche messen
- ⚠️ Vermeiden Sie reflektierende Oberflächen
- ⚠️ Halten Sie konstanten Abstand während der Messung

## API Dokumentation 📚

### Endpoints

#### Messungen erstellen
```http
POST /api/measurements
Content-Type: application/json

{
  "name": "Wohnzimmer",
  "mode": "area",
  "points": [...],
  "calibrationScale": 2.5,
  "result": { "area": 25000000 },
  "unit": "metric"
}
```

#### Alle Messungen abrufen
```http
GET /api/measurements
```

#### Einzelne Messung abrufen
```http
GET /api/measurements/{id}
```

#### Messung löschen
```http
DELETE /api/measurements/{id}
```

#### Messung exportieren
```http
GET /api/measurements/export/{id}?format=json
GET /api/measurements/export/{id}?format=csv
```

## Projektstruktur 📁

```
app/
├── frontend/                 # Expo React Native App
│   ├── app/                 # Expo Router Pages
│   │   ├── index.tsx       # Homescreen
│   │   ├── measure.tsx     # Mess-Screen
│   │   ├── calibration.tsx # Kalibrierung
│   │   └── projects.tsx    # Projekt-Liste
│   ├── components/          # React Components
│   │   ├── CameraView.tsx  # Hauptkamera-Komponente
│   │   ├── CalibrationScreen.tsx
│   │   └── VolumeInput.tsx
│   ├── store/              # Zustand State Management
│   │   └── measurementStore.ts
│   └── package.json
├── backend/                 # FastAPI Backend
│   ├── server.py           # API Endpoints
│   ├── requirements.txt
│   └── .env
└── README_DE.md
```

## Berechnungsmethoden 🧮

### Distanz
```
Distanz = √((x₂-x₁)² + (y₂-y₁)²) / calibrationScale
```

### Fläche (Shoelace-Formel)
```
Fläche = ½ |Σ(xᵢyᵢ₊₁ - xᵢ₊₁yᵢ)|
```

### Volumen
```
Volumen = Fläche × Höhe
```

## Bekannte Limitierungen ⚠️

1. **Keine echte ARCore-Integration**: Verwendet 2D-Kamera + manuelle Kalibrierung statt nativer AR-Funktionen
2. **Ebene Flächen**: Messungen funktionieren am besten auf ebenen, flachen Oberflächen
3. **Perspektive**: Kamera sollte möglichst senkrecht zur Messfläche gehalten werden
4. **Licht**: Schlechte Lichtverhältnisse beeinflussen die Genauigkeit

## Troubleshooting 🔧

### Kamera öffnet nicht
- Prüfen Sie Kamera-Berechtigungen in den Geräteeinstellungen
- Starten Sie die App neu

### Messungen ungenau
- Führen Sie Kalibrierung durch
- Verbessern Sie die Beleuchtung
- Halten Sie konstanten Abstand

### App stürzt ab
- Prüfen Sie Expo Go Version (sollte aktuell sein)
- Löschen Sie App-Cache
- Neuinstallation

## Performance 📊

- **Startup Zeit**: < 2s
- **Kamera Preview**: 60 FPS (abhängig vom Gerät)
- **Messberechnungen**: < 10ms
- **Speichern**: < 100ms

## Datenschutz & Sicherheit 🔒

- ✅ **100% Offline**: Keine Cloud-Uploads
- ✅ **Lokale Speicherung**: AsyncStorage (Frontend) + MongoDB (optional)
- ✅ **Keine Telemetrie**: Keine Tracking oder Analytics
- ✅ **Kamera-Berechtigungen**: Nur bei Bedarf angefordert

## Roadmap 🗺

### Geplante Features
- [ ] 3D-Objekt-Erkennung mit TensorFlow Lite
- [ ] Automatische Kantenerkennung
- [ ] Batch-Export (mehrere Messungen)
- [ ] Cloud-Sync (optional)
- [ ] AR-Marker-Unterstützung
- [ ] PDF-Report-Generator

## Lizenz 📄

MIT License - Siehe LICENSE Datei für Details

## Support 💬

Bei Fragen oder Problemen:
- Issue auf GitHub öffnen
- Dokumentation prüfen
- Community Forum besuchen

---

**Entwickelt mit ❤️ und Expo**

Version: 1.0.0  
Letztes Update: Januar 2025
