# 📱 Android Testing Setup Guide

## Current Status
❌ Android SDK not installed
❌ No virtual devices available

You have **3 options** to test the mobile app on Android:

---

## Option 1: Expo Go (Easiest & Fastest) ⚡

### Advantages
- No Android Studio installation needed
- No emulator required
- Test on real device immediately
- Install takes 2 minutes

### Steps

1. **Install Expo CLI** (if not already installed):
```powershell
cd mobile-app
npm install expo
```

2. **Update mobile-app/package.json**:
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios"
  }
}
```

3. **Install Expo Go on your phone**:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

4. **Start the app**:
```powershell
cd mobile-app
npm start
```

5. **Scan QR code** with Expo Go app on your phone

✅ **This is the fastest way to test on real device!**

---

## Option 2: Android Studio Emulator (Full Featured) 🖥️

### Advantages
- Full Android environment
- Debug tools
- Multiple device configurations

### Installation (~10-15 GB)

1. **Download Android Studio**:
   - Visit: https://developer.android.com/studio
   - Download for Windows
   - Run installer

2. **Install Android SDK**:
   - Open Android Studio
   - Go to: Tools → SDK Manager
   - Check these items:
     - ✅ Android SDK Platform (API 33)
     - ✅ Intel x86 Atom_64 System Image (or ARM if M1/M2)
     - ✅ Android SDK Build-Tools
     - ✅ Android Emulator
   - Click "Apply" and wait for installation

3. **Create Virtual Device**:
   - Tools → Device Manager
   - Click "Create Device"
   - Choose: Pixel 5 or Pixel 7
   - System Image: Android 13 (API 33)
   - Finish

4. **Set Environment Variables**:
```powershell
# Add to System PATH:
$env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $env:ANDROID_HOME, "User")

# Add to PATH
$androidPath = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$androidPath", "User")
```

5. **Restart VS Code** (to load new environment variables)

6. **Start Emulator**:
```powershell
# Method 1: Android Studio UI
# Open Android Studio → Device Manager → Click Play button

# Method 2: Command line
emulator -avd Pixel_5_API_33
```

7. **Run App**:
```powershell
cd mobile-app
npm run android
```

---

## Option 3: Physical Android Device (Real Performance) 📱

### Advantages
- Real device performance
- Actual GPS/sensors
- No emulator overhead

### Steps

1. **Enable Developer Options** on your phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - "Developer options" will appear in Settings

2. **Enable USB Debugging**:
   - Settings → Developer Options
   - Toggle "USB Debugging" on
   - Toggle "Install via USB" on (if available)

3. **Install ADB** (if not done):
```powershell
winget install --id Google.PlatformTools
```

4. **Connect phone via USB**:
   - Use good USB cable
   - Choose "File Transfer" or "PTP" mode (not "Charging only")
   - Accept USB debugging prompt on phone

5. **Verify connection**:
```powershell
adb devices
# Should show: List of devices attached
#              1234567890ABCDEF    device
```

6. **Run app**:
```powershell
cd mobile-app
npm run android
```

---

## Testing Strategy

### Quick Smoke Test (5 minutes)
```powershell
# 1. Start backend
cd backend-api
npm run dev

# 2. In new terminal, start mobile app
cd mobile-app
npm start

# 3. Test these screens:
- [ ] Login screen loads
- [ ] Navigation works
- [ ] Map displays
- [ ] Can view matches
```

### Full Test Suite (15 minutes)
```powershell
# Run the automated test script
.\scripts\test-android.bat
```

This will test:
- ✅ Authentication flow
- ✅ Match creation
- ✅ Joining matches
- ✅ Real-time updates
- ✅ Location services
- ✅ Zone capture

---

## Troubleshooting

### "SDK location not found"
```powershell
# Set ANDROID_HOME manually
echo %ANDROID_HOME%
# Should be: C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
```

### "Unable to install APK"
```powershell
# Clear app data
adb uninstall com.fitnessgame.app

# Try again
npm run android
```

### "Metro bundler not starting"
```powershell
# Clear cache
cd mobile-app
npx react-native start --reset-cache

# In new terminal
npm run android
```

### "Device not detected"
```powershell
# Check devices
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Check again
adb devices
```

### "Emulator too slow"
- Allocate more RAM (AVD settings: 4GB+)
- Enable hardware acceleration (Intel HAXM or AMD Hypervisor)
- Use x86_64 image (not ARM)

---

## Recommended Configuration

### Best for Quick Testing
➡️ **Option 1: Expo Go** (2 minutes setup)

### Best for Development
➡️ **Option 3: Physical Device** (accurate GPS, better performance)

### Best for CI/CD
➡️ **Option 2: Android Studio Emulator** (reproducible environment)

---

## iOS Testing (Requires Mac)

If you have a Mac available:

```bash
# Install dependencies
cd mobile-app
npx pod-install

# Run on simulator
npm run ios

# Or specific simulator
npm run ios -- --simulator="iPhone 14 Pro"
```

Without Mac:
- Use Expo Go (works on iOS too!)
- Use cloud testing service (e.g., BrowserStack, Sauce Labs)
- Rent Mac in cloud (e.g., MacStadium, AWS EC2 Mac)

---

## Next Steps

1. **Choose your testing method above**
2. **Set up according to instructions**
3. **Run backend API**: `cd backend-api && npm run dev`
4. **Run mobile app**: `cd mobile-app && npm start`
5. **Test all functionality**

---

## Quick Commands Reference

```powershell
# Check Android setup
adb version
emulator -list-avds
$env:ANDROID_HOME

# Start backend (Terminal 1)
cd backend-api
npm run dev

# Start mobile app (Terminal 2)
cd mobile-app
npm start

# Run on Android (Terminal 3, after npm start)
npm run android

# Clear cache if issues
npx react-native start --reset-cache
```

---

✅ **Choose the option that works best for you and start testing!**

💡 **Tip**: For fastest testing right now, use **Expo Go** on your phone!
