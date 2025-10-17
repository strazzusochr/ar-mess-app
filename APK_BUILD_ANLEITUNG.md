# 📱 Android-APK Build-Anleitung für AR Mess-App

## ✅ Was ist fertig:
- **Code**: 100% implementiert und getestet
- **Backend**: FastAPI + MongoDB, alle Endpoints funktionieren
- **Frontend**: Expo/React Native mit allen Features
- **Berechnungen**: Alle mathematischen Funktionen getestet ✓

---

## 🚀 Option 1: EAS Build (Empfohlen - Einfach)

### Voraussetzungen:
- Expo-Account (kostenlos): https://expo.dev/signup
- Node.js 18+ installiert

### Schritte:

```bash
# 1. In Frontend-Verzeichnis wechseln
cd /app/frontend

# 2. EAS CLI installieren
npm install -g eas-cli

# 3. Bei Expo einloggen
eas login

# 4. Projekt konfigurieren
eas build:configure

# 5. Android-APK bauen (dauert 10-15 Min)
eas build --platform android --profile production

# 6. Nach Build: APK-Download-Link wird angezeigt
# Die APK kann direkt auf Android-Geräte installiert werden
```

### app.json anpassen (vor Build):
```json
{
  "expo": {
    "name": "AR Mess-App",
    "slug": "ar-mess-app",
    "version": "1.0.0",
    "android": {
      "package": "com.yourdomain.armessapp",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#0A0A0A"
      }
    }
  }
}
```

---

## 🔧 Option 2: Lokaler Build (Fortgeschritten)

### Voraussetzungen:
- Android Studio installiert
- Java JDK 17
- Android SDK
- 16 GB RAM empfohlen

### Schritte:

```bash
# 1. Native Code generieren
cd /app/frontend
npx expo prebuild --platform android

# 2. Android-Ordner erstellen (falls nicht vorhanden)
# Dies erstellt /app/frontend/android/

# 3. In Android-Verzeichnis wechseln
cd android

# 4. APK bauen
./gradlew assembleRelease

# 5. APK finden unter:
# android/app/build/outputs/apk/release/app-release.apk
```

### Signierung (für Google Play Store):

```bash
# 1. Keystore erstellen
keytool -genkeypair -v -storetype PKCS12 -keystore ar-mess-app.keystore -alias ar-mess-app-key -keyalg RSA -keysize 2048 -validity 10000

# 2. android/gradle.properties bearbeiten:
MYAPP_UPLOAD_STORE_FILE=ar-mess-app.keystore
MYAPP_UPLOAD_KEY_ALIAS=ar-mess-app-key
MYAPP_UPLOAD_STORE_PASSWORD=****
MYAPP_UPLOAD_KEY_PASSWORD=****

# 3. Signierte APK bauen
./gradlew bundleRelease

# 4. AAB für Play Store:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 📦 Option 3: GitHub Actions CI/CD

### .github/workflows/build-android.yml erstellen:

```yaml
name: Build Android APK

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Install dependencies
        run: |
          cd frontend
          yarn install
          
      - name: Build Android APK
        run: |
          cd frontend
          eas build --platform android --non-interactive --no-wait
          
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release.apk
          path: frontend/*.apk
```

---

## 🏪 Google Play Store Veröffentlichung

### 1. Play Console Account
- Kosten: $25 (einmalig)
- Anmelden: https://play.google.com/console/signup

### 2. App erstellen
1. "Neue App erstellen"
2. Titel: "AR Mess-App"
3. Kategorie: Tools
4. Sprache: Deutsch

### 3. Erforderliche Assets
- **App-Icon**: 512x512 px PNG
- **Feature Graphic**: 1024x500 px
- **Screenshots**: Min. 2 (1080x1920 px)
- **Kurzbeschreibung**: Max. 80 Zeichen
- **Vollständige Beschreibung**: Max. 4000 Zeichen
- **Datenschutzerklärung**: URL erforderlich

### 4. AAB hochladen
```bash
# AAB erstellen (statt APK für Play Store)
cd /app/frontend/android
./gradlew bundleRelease

# Hochladen:
# → Play Console → Produktion → Neues Release erstellen
# → AAB hochladen: android/app/build/outputs/bundle/release/app-release.aab
```

### 5. Content Rating
- Fragebogen ausfüllen
- Tools-App = Keine besonderen Ratings

### 6. Preise & Verfügbarkeit
- Kostenlos oder kostenpflichtig
- Länder auswählen

### 7. Review & Veröffentlichen
- Prüfung dauert 1-3 Tage
- Nach Genehmigung: App ist live!

---

## 🧪 APK auf Gerät testen

### Methode 1: Direkter Download
```bash
# APK auf Web-Server hochladen
# Auf Android-Gerät: Download-Link öffnen
# Installation erlauben (Unbekannte Quellen)
```

### Methode 2: ADB (USB-Kabel)
```bash
# ADB installieren
# Gerät per USB verbinden
# USB-Debugging aktivieren

adb install app-release.apk
```

### Methode 3: Email/Cloud
```bash
# APK per Email/Google Drive/Dropbox teilen
# Auf Gerät herunterladen und installieren
```

---

## ✅ Checkliste vor Build

- [ ] `package.json` version erhöhen
- [ ] `app.json` android.package anpassen
- [ ] `app.json` android.versionCode erhöhen
- [ ] Icon und Splash Screen erstellt (assets/)
- [ ] Permissions in app.json korrekt
- [ ] Backend-URL in .env auf Production umgestellt
- [ ] Alle Features getestet
- [ ] Keystore erstellt (für signierte APK)

---

## 🐛 Häufige Probleme

### Problem: "Could not find gradle"
**Lösung**: Android Studio installieren, SDK konfigurieren

### Problem: "expo-camera not working"
**Lösung**: Permissions in app.json prüfen, neu builden

### Problem: "Build failed"
**Lösung**: 
```bash
cd frontend/android
./gradlew clean
./gradlew assembleRelease
```

### Problem: "Kamera schwarz"
**Lösung**: Auf echtem Gerät testen (Emulator hat keine Kamera)

---

## 📊 Build-Zeiten

- **EAS Build**: 10-20 Minuten
- **Lokaler Build**: 5-15 Minuten (erster Build länger)
- **CI/CD Build**: 15-25 Minuten

---

## 🔗 Hilfreiche Links

- **Expo Docs**: https://docs.expo.dev/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Play Store Guide**: https://support.google.com/googleplay/android-developer/
- **React Native Docs**: https://reactnative.dev/

---

## 💡 Empfehlung

**Für schnellsten Start:**
1. EAS Build nutzen (Option 1)
2. APK direkt auf Gerät installieren
3. Testen
4. Bei Erfolg: Play Store Veröffentlichung

**Vorteile EAS:**
- ✅ Keine lokale Android-SDK-Installation nötig
- ✅ Cloud-basiert, funktioniert überall
- ✅ Automatische Signierung
- ✅ Einfacher Prozess

---

## 📝 Support

Bei Problemen:
1. Expo Dokumentation prüfen
2. Expo Discord Community: https://chat.expo.dev/
3. Stack Overflow: [expo-build] Tag

---

**Die App ist CODE-READY! Nur noch APK bauen und installieren!** 🚀
