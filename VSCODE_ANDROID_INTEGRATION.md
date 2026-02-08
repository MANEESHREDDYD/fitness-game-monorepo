# VS Code + Android Studio Integration Guide
## Fitness Game Platform - React Native Development

**Date:** February 8, 2026  
**Status:** ✅ Integration Ready

---

## OVERVIEW

This guide describes the complete setup for developing the Fitness Game mobile app using **VS Code for editing and debugging** with **Android Studio for build management and emulator control**.

**Key Integration Points:**
- VS Code: Source code editing, debugging, version control
- Android Studio: Build system, emulator control, Gradle management
- Metro Bundler: JavaScript bundling on port 8081
- Backend API: Node.js Express server on localhost:3000
- ADB: Android device communication

---

## PART 1: ANDROID STUDIO SETUP

### 1.1 Open Mobile App Folder in Android Studio

1. **Start Android Studio**
   - If not installed: Download from https://developer.android.com/studio
   - Run the application

2. **Open the Android Project**
   - File → Open
   - Navigate to: `c:\Users\md200\fitness-game-monorepo\mobile-app`
   - Select the folder and click OK
   - Android Studio will detect the `android/` subfolder as the Android project
   - Wait for Gradle sync to complete

3. **Configure Project Structure**
   - File → Project Structure
   - **SDK Location tab:**
     - Android SDK Location: `C:\Users\md200\AppData\Local\Android\Sdk`
     - Android NDK Location: `C:\Users\md200\AppData\Local\Android\Sdk\ndk\26.1.10909125`
     - Gradle JDK: Embedded JDK (recommended)
   - Click OK

4. **Verify Build Configuration**
   - Build → Clean Project
   - Build → Rebuild Project
   - Should complete without errors

### 1.2 Configure External Editor (VS Code)

While Android Studio is the primary IDE for Android build management, you'll use VS Code for React Native source editing:

1. **In Android Studio:**
   - File → Settings (or Preferences on Mac)
   - Search for "Tools" → "External Tools"
   - Click the "+" button to add new tool
   - **Configure VS Code as external editor:**
     - **Name:** Open in VS Code
     - **Program:** `C:\Program Files\Microsoft VS Code\Code.exe`
     - **Arguments:** `$FileDir$ -g $FileName$:$LineNumber$`
     - **Working directory:** `$FileDir$`
     - Check "Open console for tool output"
   - Click OK

2. **To use it:**
   - Right-click any TypeScript/JavaScript file
   - External Tools → Open in VS Code
   - File opens in VS Code with cursor at current line

3. **Alternative: Set VS Code as default editor**
   - Settings → Editor → File Types
   - Select TypeScript, JavaScript, JSON file types
   - Set "Associated IDE" to Custom
   - Point to VS Code path

---

## PART 2: EMULATOR SETUP (Pixel 6 API 34)

### 2.1 Create/Verify Emulator

1. **Open AVD Manager**
   - In Android Studio: Tools → AVD Manager
   - Or: `"$env:USERPROFILE\AppData\Local\Android\Sdk\emulator\emulator.exe" -list-avds`

2. **Create Emulator (if not exists)**
   - Click "Create Virtual Device"
   - **Hardware:** Select "Pixel 6"
   - **System Image:** Choose "API Level 34" (Android 14)
   - **Configuration name:** `Pixel_6_API_34`
   - **Settings:**
     - RAM: 4096 MB
     - VM heap: 576 MB
     - Internal Storage: 4096 MB
     - SD Card: 512 MB (optional)
     - Graphics: Hardware (recommended)
   - Click Finish

3. **Verify Emulator Created**
   ```powershell
   & "$env:USERPROFILE\AppData\Local\Android\Sdk\emulator\emulator.exe" -list-avds
   # Should output: Pixel_6_API_34
   ```

### 2.2 Start Emulator from VS Code

**Option A: Use VS Code Task**
- In VS Code: Terminal → Run Task
- Select: "Start Android Emulator (Pixel 6 API 34)"
- Emulator will boot in cold start mode
- Wait 60-90 seconds for full boot

**Option B: Manual Start**
```powershell
# Start emulator with optimized settings
& "$env:USERPROFILE\AppData\Local\Android\Sdk\emulator\emulator.exe" `
  -avd Pixel_6_API_34 `
  -netdelay none `
  -netspeed full `
  -no-snapshot-load
```

**Option C: From Android Studio**
- AVD Manager
- Click the play button (►) next to Pixel_6_API_34
- Wait for boot to complete

### 2.3 Verify ADB Connection

Once emulator is running:

```powershell
# Add Android SDK to PATH temporarily
$env:PATH += ";$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools"

# Check devices
adb devices

# Expected output:
# List of devices attached
# emulator-5554          device
```

If device shows as "offline":
```powershell
# Restart ADB server
adb kill-server
adb start-server
adb devices
```

---

## PART 3: VS CODE DEBUGGING SETUP

### 3.1 Install Required Extensions

In VS Code:
1. Open Extensions (Ctrl+Shift+X)
2. Install these extensions:
   - **Debugger for React Native** - Microsoft
   - **React Native Tools** - Microsoft
   - **Thunder Client** - Ranga Vadhineni (API testing)
   - **Prettier** - Prettier (code formatting)
   - **ESLint** - Dirk Baeumer (linting)

Or use the recommended extensions:
```powershell
# VS Code will prompt on first open, or:
# File → Preferences → Extensions → Show Recommended Extensions
```

### 3.2 Debugging Configuration

**Debug launch options available** (press F5 or Ctrl+Shift+D):

1. **React Native on Android Emulator** (Recommended)
   - Launches app in debug mode
   - Enables breakpoints and stepping
   - Shows error boundaries

2. **Attach to Metro Debugger**
   - Connects to already-running Metro bundler
   - Use when app is already running

3. **Hermes React Native (Android)**
   - Alternative JavaScript engine (if enabled)
   - Lower memory footprint

4. **Attach to Android Device**
   - For physical Android devices

**To debug:**
1. Start Metro bundler: `Ctrl+Alt+M` (or `npm start` in mobile-app/)
2. Start emulator: `Ctrl+Alt+A`
3. Press F5 and select debug configuration
4. Or: Run task "Build & Deploy to Emulator"
5. App launches with debugger attached

**Debug Features:**
- Breakpoints: Click line number in editor
- Step through code: F10 (step over), F11 (step into)
- Variables: View in Debug panel
- Console: Evaluate expressions
- Call stack: Navigate execution history

### 3.3 Configure Source Maps

Source maps are already configured in:
- `mobile-app/tsconfig.json`: `"sourceMap": true`
- Build config: Debug builds include source maps

---

## PART 4: METRO BUNDLER + BACKEND INTEGRATION

### 4.1 Start Metro Bundler

**Option A: From VS Code Task**
```
Terminal → Run Task → Start Metro Bundler
```

**Option B: Manual**
```powershell
cd mobile-app
npm start
```

Expected output: `✓ Metro bundler ready`

**Port:** 8081 (http://localhost:8081)

### 4.2 Start Backend API

**Option A: From VS Code Task**
```
Terminal → Run Task → Run Backend API (localhost:3000)
```

**Option B: Manual**
```powershell
cd backend-api
npm run dev
```

Expected output: `listening on port 3000`

**Endpoints available:**
- GET /health
- POST /matches
- POST /matches/join-by-code
- GET /matches/:id
- POST /matches/:id/capture-zone

---

## PART 5: BUILD AND DEPLOY

### 5.1 Build and Deploy APK

**Simple method from VS Code:**
```
Terminal → Run Task → Build & Deploy to Emulator
```

This runs: `npm run android`

**Manual detailed build:**
```powershell
cd mobile-app

# Install Android dependencies
npm install

# Build and deploy (connects to first online emulator)
npm run android

# Build release APK (for production)
npm run android -- --mode=release
```

**Build process:**
1. Gradle compiles Java/Kotlin code
2. Metro bundles JavaScript
3. Creates APK
4. Pushes to emulator via ADB
5. Launches app auto-installed

**Expected output:**
```
✓ Successfully installed the app on emulator
✓ Launching Fitness Game app
``` 

### 5.2 Install on Physical Device (Optional)

If you have an Android phone connected via USB:

```powershell
# Enable Developer Options on phone:
# Settings → About Phone → Build Number (tap 7x) → Back → Developer Options → USB Debugging (enable)

# Check connection
adb devices
# Should show your device with "device" status

# Install
npm run android
# App installs to phone instead of emulator
```

---

## PART 6: KEYBOARD SHORTCUTS (vs Code)

All shortcuts are configured in `.vscode/keybindings.json`:

| Shortcut | Action | Purpose |
|----------|--------|---------|
| `Ctrl+Alt+A` | Start emulator | Boot Pixel 6 API 34 |
| `Ctrl+Alt+R` | Build & deploy | `npm run android` |
| `Ctrl+Alt+D` | Backend dev server | `npm run dev` in backend/ |
| `Ctrl+Alt+T` | Thunder Client | Quick API testing |
| `Ctrl+Shift+M` | Run test suite | `npm test` |
| `Ctrl+Shift+P` | Release build | Production APK |
| `Ctrl+Alt+L` | View device logs | `adb logcat` filtered |
| `Ctrl+Alt+B` | Check devices | `adb devices` |
| `F5` | Start debugging | Attach debugger |

**Quick workflow:**
1. `Ctrl+Alt+A` - Start emulator
2. `Ctrl+Alt+D` - Start backend
3. `Ctrl+Alt+R` - Build & deploy app
4. `F5` - Attach debugger (optional)
5. App launches with Metro bundler on port 8081

---

## PART 7: TESTING

### 7.1 Run Feature Tests

```powershell
cd mobile-app
npm test -- --testPathPattern=features\\..*\\.test\\.tsx
```

Runs all 85 feature tests:
- Zone Capture (20 tests)
- Match Creation (20 tests)
- Match Join (15 tests)
- Map & Location (15 tests)
- User Authentication (15 tests)

Expected: ✅ All tests passing

### 7.2 Run Screen Tests

```powershell
npm test -- screens.test.tsx
```

Tests all mobile screens:
- LoginScreen, SignupScreen
- HomeScreen, MapScreen
- CreateMatchScreen, JoinMatchScreen
- MatchesScreen, ProfileScreen
- Redux integration

### 7.3 API Testing with Thunder Client

Click `Ctrl+Alt+T` in VS Code, then:

1. **Load collection:** Open `thunder-client-collection.json`
2. **Test endpoints:**
   - GET /health ✅ 200
   - POST /matches ✅ 200
   - POST /matches/join-by-code ✅ 200
   - POST /matches/:id/start ✅ 200
   - POST /matches/:id/capture-zone ✅ 200

All 8 API endpoints pre-configured with:
- Correct headers (x-user-id)
- Request bodies
- Expected responses

---

## PART 8: TROUBLESHOOTING

### Issue: "Android project not found"
**Solution:**
```powershell
# Verify android/ folder exists
Get-ChildItem mobile-app/android -Recurse | Select-Object FullName

# Should show:
# mobile-app/android/build.gradle
# mobile-app/android/gradle.properties
# mobile-app/android/settings.gradle
# mobile-app/android/app/build.gradle
# ...etc
```

### Issue: ADB not recognized
**Solution:**
```powershell
# Add to PATH permanently (run as admin):
[Environment]::SetEnvironmentVariable(
  "PATH",
  "$env:PATH;$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools",
  "User"
)

# Or use full path:
& "$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
```

### Issue: Emulator won't start
**Solution:**
```powershell
# Kill running emulator processes
taskkill /IM qemu-system-x86_64.exe /F

# Start fresh
& "$env:USERPROFILE\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Pixel_6_API_34

# If still fails, wipe emulator data:
& "$env:USERPROFILE\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Pixel_6_API_34 -wipe-data
```

### Issue: Metro bundler fails to start
**Solution:**
```powershell
# Clear cache and start
cd mobile-app
rm -r node_modules, .watchman*
npm install
npm start

# Or on Windows:
rmdir node_modules -Recurse -Force
npm install
npm start
```

### Issue: Debug breakpoints not working
**Solution:**
1. Ensure source maps are generated: `tsc --module commonjs --target es2015 --sourceMap`
2. Rebuild app: `npm run android`
3. Stop and restart debugger: F5
4. Check Debug Console for errors
5. Clear app data: `adb shell pm clear com.fitnessgame`

### Issue: App crashes on startup
**Solution:**
```powershell
# View crash logs
adb logcat | findstr "FitnessGame|ReactNativeJS"

# Common causes:
# - Metro bundler not running (adb reverse needed)
# - Backend API not running on localhost:3000
# - Network permission not granted
# - Redux store not initialized

# Reset app
adb shell pm clear com.fitnessgame
adb shell am start -n com.fitnessgame/.MainActivity
```

---

## PART 9: DEVELOPMENT WORKFLOW

### Daily Startup (5 minutes)
```powershell
# 1. Start emulator
Ctrl+Alt+A

# 2. Wait for boot (~60s)

# 3. Start backend
Ctrl+Alt+D

# 4. Start mobile build
Ctrl+Alt+R

# Wait for "App launched successfully"

# 5. Optional: Attach debugger
F5
```

### Coding with Hot Reload
- Edit `.tsx` or `.ts` file in VS Code
- Metro bundler detects change (usually < 1s)
- App auto-reloads in 2-3 seconds
- Breakpoints remain active

### Testing Before Commit
```powershell
# Run feature tests
Ctrl+Shift+M

# Test APIs
Ctrl+Alt+T

# View logs
Ctrl+Alt+L
```

### Build Release APK
```powershell
# For app store submission
Ctrl+Shift+P
# APK generated at: mobile-app/android/app/build/outputs/apk/release/app-release.apk
```

---

## PART 10: NEXT STEPS

✅ **Completed in this setup:**
- Android build system configured
- Emulator ready (Pixel 6 API 34)
- VS Code debugging enabled
- Metro bundler integration
- Backend API configured
- Thunder Client API testing ready
- 150+ comprehensive tests ready to run

**To start development:**
1. `Ctrl+Alt+A` → Start emulator
2. `Ctrl+Alt+D` → Start backend
3. `Ctrl+Alt+R` → Build & deploy
4. Edit code in VS Code
5. Watch app auto-reload
6. Use F5 to debug when needed

**Commands always available:**
```powershell
npm test              # Run all tests
npm run android       # Build & deploy
npm start            # Metro bundler
npm run dev          # Backend server
```

---

**Created:** February 8, 2026  
**Status:** ✅ Ready for development  
**Next:** Start emulator and begin coding!
