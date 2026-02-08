# DEVELOPER QUICK START

## 🚀 Start Development in 30 Seconds

### First Time Setup (2 minutes)
```powershell
# From project root
.\dev-setup.ps1

# Follow the prompts - script handles:
# ✓ Configuring Android SDK
# ✓ Verifying emulator
# ✓ Adding tools to PATH
```

### Every Day (Use Shortcuts)
```
Ctrl+Alt+A  →  Start Android emulator
Ctrl+Alt+D  →  Start backend API (localhost:3000)
Ctrl+Alt+R  →  Build & deploy app
F5          →  Attach VS Code debugger
```

**Result:** App running in emulator in ~30 seconds ✅

---

## 🛠️ Common Tasks

### Edit & Auto-Reload
1. Open file in VS Code
2. Make changes
3. Save (Ctrl+S)
4. Metro reloads automatically (2-3 seconds)

### Run Tests
```
Ctrl+Shift+M  →  Run all 85+ tests
```
Expected: ✅ All passing

### Debug Code
```
F5            →  Start debugger
Click line    →  Set breakpoint
F10/F11       →  Step through code
```

### View Logs
```
Ctrl+Alt+L    →  See device logs
Debug Console →  See app output
```

### Test API Endpoints
```
Ctrl+Alt+T    →  Open Thunder Client
Click "Send"  →  Test 8 API endpoints
```

---

## 📱 Emulator Controls

**In running emulator:**
- `R` double tap - Reload JavaScript
- `D` double tap - Debug menu
- `I` - Inspect element
- `P` - Toggle Performance Monitor

**From terminal:**
```powershell
adb shell input keyevent KEYCODE_POWER    # Lock/unlock
adb shell input text "Hello"               # Type text
adb shell input keyevent KEYCODE_BACK     # Back button
```

---

## 🔧 Build Variants

### Debug Build (Development)
```powershell
Ctrl+Alt+R  (or: npm run android)
# Faster build, enables debugging
```

### Release Build (Production)
```powershell
Ctrl+Shift+P  (or: npm run android --mode=release)
# Optimized, minified, signed
```

---

## 📊 Project Structure

```
mobile-app/
├── src/
│   ├── screens/          ← UI screens
│   ├── services/         ← API, auth, SignalR
│   ├── store/           ← Redux state
│   ├── types/           ← TypeScript interfaces
│   └── utils/           ← Helpers (Haversine)
├── android/             ← Android build files
├── ios/                 ← iOS build files (optional)
├── tests/               ← 85+ feature tests
├── .vscode/            ← VS Code settings
├── metro.config.js     ← JS bundler config
└── package.json
```

---

## ✅ Checklist for Each Session

- [x] Android Studio installed
- [x] Android SDK configured
- [x] Emulator (Pixel 6 API 34) created
- [x] VS Code extensions installed
- [x] Backend API ready
- [x] Metro bundler ready
- [ ] Start emulator (Ctrl+Alt+A)
- [ ] Start backend (Ctrl+Alt+D)
- [ ] Start metro (npm start)
- [ ] Build app (Ctrl+Alt+R)
- [ ] Make changes
- [ ] Run tests (Ctrl+Shift+M)
- [ ] Debug if needed (F5)

---

## 🆘 Quick Fixes

**Forgot to start emulator?**
```powershell
Ctrl+Alt+A
```

**App not updating after editing?**
```powershell
# Press R in emulator simulator to reload
# Or: Clear cache and rebuild
adb shell pm clear com.fitnessgame
Ctrl+Alt+R
```

**Metro bundler crashed?**
```powershell
cd mobile-app
npm install
npm start
```

**Backend not responding?**
```powershell
netstat -ano | findstr :3000
# If nothing shown, start it:
Ctrl+Alt+D
```

**Debugger won't attach?**
```powershell
# Restart emulator and try again
npm run android
# Wait 5 seconds for Metro
# Then press F5
```

---

## 📚 Full Documentation

For complete setup and troubleshooting:
👉 **[VSCODE_ANDROID_INTEGRATION.md](./VSCODE_ANDROID_INTEGRATION.md)**

---

## 🎯 Today's Goal

1. ✅ Clone/open project
2. ✅ Run `.\dev-setup.ps1`
3. ✅ Start emulator+backend+metro with shortcuts
4. ✅ Edit a file and see hot reload
5. ✅ Run tests (Ctrl+Shift+M)
6. ✅ Set a breakpoint and debug (F5)

**Time required:** 15-20 minutes  
**Difficulty:** ⭐ (Very Easy - all automated)

---

**Created:** February 8, 2026  
**Updated:** Current Session  
**Status:** ✅ Ready to code!
