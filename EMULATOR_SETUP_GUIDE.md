# VS Code + Android Studio + Emulator Integration Guide

## Overview

This guide sets up one-click Android emulator launching and React Native app deployment in VS Code.

**Result:** Press `Ctrl+Alt+E` to:
1. Start Android Emulator (Pixel 6 API 34)
2. Verify device connection
3. Auto-deploy React Native app to emulator

---

## SETUP - 3 STEPS

### Step 1: Install "Android iOS Emulator" Extension

**Manual Install:**
1. Open VS Code
2. Press `Ctrl+Shift+X` (Extensions View)
3. Search: `Android iOS Emulator`
4. Click "Install" next to **nativescript-nx.vscode-android-emulator**
5. Press "Reload Window" when prompted

**Auto Install:**
- When you open this workspace, VS Code will prompt:
  > "This workspace recommends the following extensions"
- Click "Install All" (we added it to `.vscode/extensions.json`)

✅ Installed extensions verified in `.vscode/extensions.json`

---

### Step 2: Add Keybinding (Ctrl+Alt+E)

The keybinding is already configured in `.vscode/keybindings.json`:

```json
{
  "key": "ctrl+alt+e",
  "command": "workbench.action.tasks.runTask",
  "args": "Android: Start Emulator + Deploy App"
}
```

**Verify it's active:**
1. Open VS Code
2. Press `Ctrl+Shift+P` → "Preferences: Open Keyboard Shortcuts"
3. Search: "Android"
4. Confirm `Ctrl+Alt+E` shows "Android: Start Emulator + Deploy App"

---

### Step 3: Create Android Emulator (if needed)

**Check if Pixel 6 API 34 exists:**
```powershell
emulator -list-avds
```

**If not found, create it:**
```powershell
# Option A: Using Android Studio
1. Open Android Studio
2. Tools → Device Manager
3. Create Virtual Device → Pixel 6
4. API Level: 34
5. Name: Pixel_6_API_34

# Option B: Using CLI
sdkmanager "system-images;android-34;google_apis;x86_64"
avdmanager create avd -n Pixel_6_API_34 -k "system-images;android-34;google_apis;x86_64" -d "Pixel 6"
```

---

## QUICK START - 3 WAYS TO LAUNCH

### Way 1: One Keybinding (Easiest)

**Press:** `Ctrl+Alt+E`

**What happens:**
1. VS Code runs task: "Android: Start Emulator + Deploy App"
2. Emulator starts (Pixel 6 API 34)
3. Verifies device is connected
4. Deploys React Native app to emulator
5. App launches automatically

**Terminal Output:**
```
Running task: Android: Start Emulator + Deploy App
Running task: Android: Start Emulator (Pixel 6 API 34)
Running task: Android: Verify Devices Connected
List of attached devices
emulator-5554          device          ← Emulator ready!

Building React Native app...
[INFO] Installing APK...
[SUCCESS] App deployed to emulator!
```

**Time:** 1-2 minutes (first run slower due to emulator boot)

---

### Way 2: Command Palette

1. Press `Ctrl+Shift+P` (Command Palette)
2. Type: `Tasks: Run Task`
3. Select: **"Android: Start Emulator + Deploy App"**
4. Press Enter
5. Watch the terminal

**Alternative tasks available:**
- "Android: Start Emulator (Pixel 6 API 34)" - Just emulator
- "Android: Deploy React Native App" - Just deploy (emulator must be running)
- "Full Stack: Start All (Backend + Metro + Emulator + Deploy)" - Everything

---

### Way 3: Manual Commands

In terminal:
```bash
# Terminal 1 - Start Emulator
emulator -avd Pixel_6_API_34

# Terminal 2 - Start Backend (from root)
npm run dev

# Terminal 3 - Start Metro Bundler (from mobile-app)
npm start

# Terminal 4 - Deploy App (from mobile-app)
npm run android
```

---

## ALL KEYBINDINGS

| Keybinding | Action | Purpose |
|-----------|--------|---------|
| `Ctrl+Alt+E` | **Start Emulator + Deploy** | 🚀 Main launch (new) |
| `Ctrl+Alt+A` | Launch emulator in terminal | Manual emulator start |
| `Ctrl+Alt+R` | `npm run android` | Rebuild & deploy |
| `Ctrl+Alt+D` | `npm run dev` | Backend dev server |
| `Ctrl+Alt+T` | Thunder Client | API testing |
| `Ctrl+Shift+M` | `npm test` | Run test suite |
| `Ctrl+Alt+L` | `adb logcat` | View device logs |
| `Ctrl+Alt+B` | `adb devices` | List connected devices |
| `Ctrl+Shift+P` | Release build | Production APK |

---

## VERIFY SETUP

### Run Verification Script

Open terminal and run:
```powershell
# From workspace root
./scripts/verify-emulator-setup.ps1
```

**Output Example:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FITNESS GAME - EMULATOR + REACT NATIVE VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ ADB found: Android Debug Bridge version 1.0.41

✓ Found 1 device(s)
  → Device: emulator-5554 (Status: device)
    • Model: AOSP on Pixel 6 API 34, Android: 14

✓ Backend API is running ✓

⚠ Metro Bundler not responding on port 8081
  • This is optional if using npm run android

✓ Port 3000 (Backend API) is open
✓ Port 8081 (Metro Bundler) is closed
✓ Port 5555 (ADB) is open

Checks passed: 3/3
  ✓ ADB installed
  ✓ Emulator connected
  ✓ Backend running

STATUS: Ready for development! 🚀
```

---

## TROUBLESHOOTING

### Issue: "adb: command not found"

**Fix:**
1. Open Android Studio
2. Tools → SDK Manager
3. SDK Tools → Android SDK Platform-Tools (install)
4. Add to PATH:
   ```
   C:\Users\{YourUser}\AppData\Local\Android\Sdk\platform-tools
   ```
5. Restart VS Code

**Verify:**
```powershell
adb --version
```

---

### Issue: "Android Emulator not found"

**Fix:**
1. Install emulator:
   ```powershell
   sdkmanager "emulator"
   ```
2. Add to PATH:
   ```
   C:\Users\{YourUser}\AppData\Local\Android\Sdk\emulator
   ```

---

### Issue: "No devices detected"

**Checklist:**
- [ ] Is emulator running? Check taskbar or run: `adb devices`
- [ ] Is ADB server running? Check: `adb start-server`
- [ ] Try reset: `adb kill-server && adb start-server`
- [ ] Restart emulator: `emulator -avd Pixel_6_API_34 -no-snapshot`

**Quick fix:**
```powershell
# Reset ADB
adb kill-server
adb start-server

# Check devices
adb devices

# Should show:
# emulator-5554          device
```

---

### Issue: "npm run android fails"

**Common causes & fixes:**

1. **Metro bundler not running:**
   ```powershell
   # Terminal 2 - Start Metro
   cd mobile-app
   npm start
   ```

2. **Backend not running:**
   ```powershell
   # Terminal 1 - Start Backend
   npm run dev
   ```

3. **App cache issue:**
   ```powershell
   cd mobile-app
   npm run android -- --reset-cache
   ```

4. **Full clean rebuild:**
   ```powershell
   cd mobile-app/android
   ./gradlew clean
   cd ..
   npm run android
   ```

---

## COMPOUND TASKS

We configured **compound tasks** that run multiple tasks together:

### Task 1: "Android: Start Emulator + Deploy App"
**Shortcut:** `Ctrl+Alt+E`

**Steps:**
1. Start Emulator (Pixel 6 API 34)
2. Verify Devices Connected
3. *(Deploy task runs after emulator is ready)*

---

### Task 2: "Full Stack: Start All"
**Shortcut:** `Ctrl+Shift+B` (Build) or search Command Palette

**Steps (runs in parallel):**
1. Backend: Start Dev Server (localhost:3000)
2. React: Start Metro Bundler (localhost:8081)
3. Android: Start Emulator (Pixel 6 API 34)
4. Android: Verify Devices Connected
5. Android: Deploy React Native App

⏱️ **Time:** ~90 seconds first run, ~30-40 seconds after

---

## DEBUGGING

### Debug Mobile App

**Setup:**
1. Open `.vscode/launch.json` (should be auto-created)
2. Found configuration: "Attach to Hermes React Native"

**Launch:**
1. Press `F5` or go to Run → Start Debugging
2. Select: "Attach to Hermes React Native"
3. Emulator will start and app will deploy
4. VS Code opens debugger

**Breakpoints:**
- Set breakpoints in `.tsx` files
- Open React Native Debugger or Chrome DevTools (port 9223)

---

### Debug Backend

1. Press `F5` → Select "Debug Backend API"
2. Backend starts on localhost:3000 with debugger attached
3. Set breakpoints in `backend-api/src/**` files

---

### Debug Both (Full Stack)

1. Press `F5` → Select "Full Stack Debug (Backend + Mobile)"
2. Both debuggers attach
3. Visit `chrome://inspect` in Chrome to see both debuggers

---

## TASKS REFERENCE

All available tasks (accessible via `Ctrl+Shift+P` → "Tasks: Run Task"):

| Task Name | Purpose | Shortcut |
|-----------|---------|----------|
| Android: Start Emulator + Deploy App | Launch emulator + deploy app | `Ctrl+Alt+E` |
| Android: Start Emulator (Pixel 6 API 34) | Just start emulator | `Ctrl+Alt+A` |
| Android: Verify Devices Connected | Check ADB devices | - |
| Android: Deploy React Native App | Deploy APK to emulator | `Ctrl+Alt+R` |
| Backend: Start Dev Server | Start Node.js backend | `Ctrl+Alt+D` |
| React: Start Metro Bundler | Start React Native bundler | - |
| Full Stack: Start All | Everything (backend + Metro + emulator + app) | `Ctrl+Shift+B` |
| Test: Run All Tests | Run Jest test suite | `Ctrl+Shift+M` |
| Tools: View Device Logs | Stream device logs | `Ctrl+Alt+L` |

---

## NEXT STEPS

1. ✅ Verify setup: `./scripts/verify-emulator-setup.ps1`
2. ✅ Press `Ctrl+Alt+E` to launch emulator + deploy app
3. ✅ App should appear on emulator screen in 1-2 minutes
4. ✅ Set breakpoints and press `F5` to debug
5. ✅ Open Chrome DevTools at `chrome://inspect` to debug React

---

## POWER USER TIPS

### Tip 1: Keep Terminal Panels Organized
```
Terminal 1: Full Stack tasks (backend + Metro + emulator)
Terminal 2: Debugger output (if running F5 debug)
Terminal 3: Manual commands (adb, npm, etc)
```
Use terminal tabs: `Ctrl+Shift+\` (split) or create new: `Ctrl+Shift+` ` `

### Tip 2: Deploy Iteration Loop
1. Edit file in mobile-app/src/**
2. Save (Ctrl+S)
3. Metro auto-reloads (~3 seconds)
4. See changes on emulator screen

No need to restart! Just save & watch.

### Tip 3: View Logs in Real-Time
Press `Ctrl+Alt+L` to stream device logs:
```
I/Fitness Game: Zone captured!
I/Fitness Game: Score updated: 150 points
```

### Tip 4: Multiple Emulators
```powershell
# Start Pixel 4a (different instance)
emulator -avd Pixel_4a_API_34 &

# See all devices
adb devices

# Deploy to specific device
adb -s emulator-5556 install app-release.apk
```

---

## SUMMARY

| Before Setup | After Setup |
|--------------|-------------|
| Manual emulator launch | `Ctrl+Alt+E` one-click launch |
| Manual app deploy | Auto-deploys when emulator ready |
| No debugger integration | Full VS Code debugging (`F5`) |
| Terminal command memorization | Keybindings + task palette |
| Fragmented workflow | Unified dev environment |

**Status:** ✅ Ready for efficient React Native + Android development!
