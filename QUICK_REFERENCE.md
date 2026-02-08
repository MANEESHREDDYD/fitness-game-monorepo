# ⚡ QUICK REFERENCE - VS Code Android Emulator Setup

## 🚀 LAUNCH (Pick One)

### 1️⃣ **Fastest - One Keybinding**
```
Ctrl+Alt+E
```
→ Emulator starts + App deploys (1-2 mins)

### 2️⃣ **Full Stack (Backend + Metro + Emulator + App)**
```
Ctrl+Shift+B  (Build tasks)
Select: "Full Stack: Start All"
```
→ Everything starts in parallel (~90 secs)

### 3️⃣ **Manual / Selective**
```
Ctrl+Shift+P → "Tasks: Run Task" → Pick task
```

---

## 📋 KEY KEYBINDINGS

| Shortcut | What It Does |
|----------|--------------|
| `Ctrl+Alt+E` | **🎮 Start Emulator + Deploy App** |
| `Ctrl+Shift+B` | ▶️ Full Stack (Backend + Metro + Emulator) |
| `Ctrl+Alt+A` | Launch emulator in terminal |
| `Ctrl+Alt+R` | Rebuild & redeploy app |
| `Ctrl+Alt+D` | Start backend dev server |
| `Ctrl+Alt+L` | View live device logs |
| `Ctrl+Alt+B` | Check connected devices |
| `Ctrl+Shift+M` | Run test suite |
| `F5` | Debug (app or backend) |

---

## ✅ VERIFY SETUP

```powershell
./scripts/verify-emulator-setup.ps1
```

Checks:
- ✓ ADB installed
- ✓ Emulator connected  
- ✓ Backend running (3000)
- ✓ Metro ready (8081)

---

## 🔧 DEBUGGING

### Debug Mobile App
```
F5 → Select "Attach to Hermes React Native"
```
- Set breakpoints in `.tsx` files
- Open Chrome DevTools: `chrome://inspect`

### Debug Backend
```
F5 → Select "Debug Backend API"
```

### Debug Both
```
F5 → Select "Full Stack Debug (Backend + Mobile)"
```

---

## 🐛 QUICK FIXES

| Problem | Fix |
|---------|-----|
| "adb: command not found" | Add Android SDK to PATH |
| "No devices detected" | `adb kill-server && adb start-server` |
| "npm run android fails" | Start Metro: `npm start` |
| App won't deploy | Clear cache: `npm run android -- --reset-cache` |
| Emulator won't start | Create: `emulator -avd Pixel_6_API_34` |

---

## 📁 FILES CREATED/UPDATED

```
.vscode/
├── keybindings.json        ← Ctrl+Alt+E binding added
├── extensions.json         ← Android emulator extension added
├── tasks.json             ← Compound tasks configured
└── launch.json            ← Debugger config

scripts/
└── verify-emulator-setup.ps1  ← Verification script

EMULATOR_SETUP_GUIDE.md    ← Full setup guide (this folder)
```

---

## 📊 WHAT EACH TASK DOES

```
Ctrl+Alt+E
    ↓
Android: Start Emulator + Deploy App
    ├─ Start Emulator (Pixel 6 API 34)
    ├─ Verify Devices Connected
    └─ Deploy React Native App
    
    ✅ Result: App running on emulator screen
```

```
Ctrl+Shift+B → Full Stack: Start All
    ↓
    ├─ Backend: localhost:3000
    ├─ Metro: localhost:8081
    ├─ Emulator: Pixel 6 API 34
    └─ App: Deployed & running
    
    ✅ Result: Complete development environment
```

---

## 🎯 NEXT STEPS

1. **Verify:** Run `./scripts/verify-emulator-setup.ps1`
2. **Launch:** Press `Ctrl+Alt+E`
3. **Wait:** 1-2 minutes for emulator + app
4. **See:** App running on emulator screen
5. **Debug:** Press `F5` → set breakpoints

---

## 📞 COMMON COMMANDS

```powershell
# Check what's running
netstat -ano | findstr :3000    # Backend
netstat -ano | findstr :8081    # Metro
adb devices                      # Emulator

# Manual starts (if needed)
emulator -avd Pixel_6_API_34     # Emulator only
npm run dev                      # Backend only
npm start                        # Metro only

# Manual deploy
cd mobile-app
npm run android                  # Deploy to emulator

# View logs live  
adb logcat                       # All logs
adb logcat | grep "Fitness"      # Filtered logs
```

---

## 📚 SEE ALSO

- **Full Guide:** `EMULATOR_SETUP_GUIDE.md` (detailed explanations)
- **Troubleshooting:** `EMULATOR_SETUP_GUIDE.md` → Troubleshooting section
- **Tasks Reference:** `EMULATOR_SETUP_GUIDE.md` → Tasks Reference

---

**Last Updated:** Feb 8, 2026  
**Status:** ✅ Ready to launch! Press `Ctrl+Alt+E` 🚀
