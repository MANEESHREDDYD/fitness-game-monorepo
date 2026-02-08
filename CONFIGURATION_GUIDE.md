# 🔧 Complete Configuration Setup Guide

## ✅ Already Completed
1. ✅ **ML Dependencies** - All installed and tested
2. ✅ **Backend API** - Running and tested locally
3. ✅ **Infrastructure Scripts** - Deployment automation ready
4. ✅ **Mobile App** - Compiled without errors

---

## 📋 Remaining Configuration Items

### 1. Azure CLI Installation

**Option A: Using Windows Package Manager (Recommended)**
```powershell
# Open PowerShell as Administrator and run:
winget install -e --id Microsoft.AzureCLI

# Close and reopen terminal, then verify:
az --version
```

**Option B: Direct Download**
1. Download: https://aka.ms/installazurecliwindows
2. Run the MSI installer
3. Close and reopen terminal
4. Verify: `az --version`

**Option C: Using our script**
```powershell
# Run as Administrator:
powershell -ExecutionPolicy Bypass -File scripts\install-azure-cli.ps1
```

---

### 2. Cosmos DB Connection

You have **three options** for Cosmos DB:

#### Option A: Azure Cosmos DB (Production - Requires Azure deployment)

1. **Deploy to Azure first:**
   ```powershell
   az login
   .\scripts\deploy-azure.ps1 -ResourceGroup "fitness-game-rg" -Location "eastus"
   ```

2. **Get connection string:**
   ```powershell
   az cosmosdb keys list \
       --name <cosmos-account-name> \
       --resource-group fitness-game-rg \
       --type connection-strings \
       --query "connectionStrings[0].connectionString" -o tsv
   ```

3. **Update backend-api/.env:**
   ```env
   COSMOS_CONNECTION=AccountEndpoint=https://...;AccountKey=...;
   COSMOS_DB_NAME=fitnessGame
   ```

#### Option B: Azure Cosmos DB Emulator (Local Development)

1. **Download and Install:**
   https://aka.ms/cosmosdb-emulator

2. **Start the emulator** (it runs on https://localhost:8081)

3. **Update backend-api/.env:**
   ```env
   COSMOS_CONNECTION=AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
   COSMOS_DB_NAME=fitnessGame
   ```

4. **Restart backend:**
   ```powershell
   npm --workspace backend-api run dev
   ```

#### Option C: Continue Without Cosmos (Current Setup)

Events are logged to console (no persistence). This is fine for:
- Local development
- Testing endpoints
- Learning the system

To use this mode, just keep `COSMOS_CONNECTION` empty in `.env`.

---

### 3. SignalR Service Configuration

You have **three options** for SignalR:

#### Option A: Azure SignalR Service (Production - Requires Azure)

1. **Deploy to Azure first:**
   ```powershell
   .\scripts\deploy-azure.ps1 -ResourceGroup "fitness-game-rg" -Location "eastus"
   ```

2. **Get SignalR keys:**
   ```powershell
   az signalr key list \
       --name <signalr-name> \
       --resource-group fitness-game-rg \
       --query "primaryKey" -o tsv
   ```

3. **Update backend-api/.env:**
   ```env
   SIGNALR_ENDPOINT=https://<signalr-name>.service.signalr.net
   SIGNALR_ACCESS_KEY=<key-from-above>
   SIGNALR_HUB_NAME=match
   ```

#### Option B: Socket.IO (Alternative for Local Dev)

If you want real-time updates without Azure SignalR:

1. **Install Socket.IO:**
   ```powershell
   npm install --workspace backend-api socket.io
   npm install --workspace mobile-app socket.io-client
   ```

2. **Implement basic Socket.IO server** (I can help with this if needed)

#### Option C: Continue Without SignalR (Current Setup)

The app works without real-time updates:
- Manual refresh to see match updates
- Polling for state changes
- Fine for single-player testing

To use this mode, keep `SIGNALR_ENDPOINT` empty in `.env`.

---

### 4. Azure Deployment (Full Production Setup)

**Prerequisites:**
- ✅ Azure CLI installed
- ✅ Azure subscription
- ✅ Resource group name decided

**Quick Deployment (20 minutes):**

```powershell
# 1. Login to Azure
az login

# 2. Set your subscription (if you have multiple)
az account set --subscription "your-subscription-id"

# 3. Run automated deployment
.\scripts\deploy-azure.ps1 `
    -ResourceGroup "fitness-game-rg" `
    -Location "eastus" `
    -SubscriptionId "your-subscription-id"
```

**What gets deployed:**
- ✅ Cosmos DB (with Events, Users, Matches containers)
- ✅ SignalR Service (real-time updates)
- ✅ App Service (backend API)
- ✅ Storage Account (file uploads)
- ✅ Notification Hub (push notifications)

**After deployment:**
The script automatically:
- Configures all environment variables
- Deploys the backend code
- Provides connection strings for mobile app

**Cost:** ~$15-20/month (or free with free tier)

---

### 5. Mobile App Runtime Testing

#### Prerequisites Check:

**For Android:**
```powershell
# Check if Android SDK is installed
adb --version

# Check if Android emulator is available
emulator -list-avds
```

**For iOS (Mac only):**
```bash
# Check Xcode
xcode-select --version
```

#### Option A: Test on Physical Device

**Android:**
1. Enable Developer Options on your Android phone
2. Enable USB Debugging
3. Connect phone via USB
4. Run:
   ```powershell
   cd mobile-app
   npm run android
   ```

**iOS:**
1. Connect iPhone via USB
2. Run:
   ```bash
   cd mobile-app
   npm run ios
   ```

#### Option B: Test on Emulator/Simulator

**Android:**
1. **Install Android Studio** (if not installed):
   https://developer.android.com/studio

2. **Create Virtual Device:**
   - Open Android Studio → Device Manager
   - Create New Device → Pixel 5
   - Download System Image (API 33 recommended)

3. **Start Emulator & Run:**
   ```powershell
   cd mobile-app
   npm run android
   ```

**iOS (Mac only):**
```bash
cd mobile-app
npm run ios
```

#### Option C: Test Compilation Only (No Runtime)

```powershell
# Test if the app compiles successfully
cd mobile-app

# Check TypeScript compilation
npx tsc --noEmit

# Check for errors
npm run android --dry-run
```

#### Quick Mobile App Test Checklist:

Once running, test these flows:

1. **Authentication:**
   - [ ] Can see login screen
   - [ ] Can navigate to signup

2. **Create Match:**
   - [ ] Can input park ID and team size
   - [ ] Match code is displayed
   - [ ] Navigates to lobby

3. **Join Match:**
   - [ ] Can enter match code
   - [ ] Can join existing match
   - [ ] Can see other players

4. **In-Match:**
   - [ ] Map shows user location
   - [ ] Zones are visible
   - [ ] Can tap to capture zone

---

## 🎯 Recommended Setup Path

### For Local Development (No Azure Costs):

```powershell
# 1. Install Cosmos DB Emulator (Optional)
# Download: https://aka.ms/cosmosdb-emulator

# 2. Update backend-api/.env with emulator connection
# (or leave empty for console logging)

# 3. Start backend
npm --workspace backend-api run dev

# 4. Test mobile app compilation
cd mobile-app
npx tsc --noEmit

# 5. If Android SDK installed, run on emulator
npm run android
```

**✅ Result:** Fully functional local development environment

---

### For Production Deployment:

```powershell
# 1. Install Azure CLI
winget install Microsoft.AzureCLI

# 2. Deploy to Azure (automated)
az login
.\scripts\deploy-azure.ps1 -ResourceGroup "fitness-game-rg" -Location "eastus"

# 3. Update mobile-app/.env with Azure endpoints
# (Provided by deployment script)

# 4. Test Azure deployment
.\scripts\test-azure.ps1 -WebAppName "your-app-name"

# 5. Build mobile app for production
cd mobile-app
npm run android --variant=release
```

**✅ Result:** Production-ready deployment in Azure

---

## 📊 Configuration Matrix

| Feature | Local Dev | Azure Dev | Production |
|---------|-----------|-----------|------------|
| **Backend API** | ✅ localhost:3000 | ✅ Azure App Service | ✅ Azure App Service |
| **Cosmos DB** | 🔹 Emulator or Console | ✅ Azure Cosmos | ✅ Azure Cosmos |
| **SignalR** | ❌ Manual refresh | ✅ Azure SignalR | ✅ Azure SignalR |
| **Mobile App** | ✅ Emulator | ✅ Points to Azure | ✅ Production build |
| **ML Model** | ✅ Local joblib | 🔹 Local or Azure | ✅ Azure ML |
| **Cost** | $0 | ~$10/month | ~$20/month |

---

## 🆘 Troubleshooting

### Azure CLI won't install
**Solution:**
- Run PowerShell as Administrator
- Or download directly: https://aka.ms/installazurecliwindows
- Or use Azure Cloud Shell (no installation needed)

### Cosmos DB connection fails
**Solution:**
- Check connection string format
- For emulator, ensure it's running (https://localhost:8081)
- For Azure, check firewall settings

### SignalR not working
**Solution:**
- Verify endpoint and access key
- Check App Service logs
- Start without SignalR (works without real-time updates)

### Mobile app won't compile
**Solution:**
```powershell
# Clean and reinstall
cd mobile-app
Remove-Item node_modules -Recurse -Force
npm install

# Check for TypeScript errors
npx tsc --noEmit

# Get detailed error
npm run android --verbose
```

### Android emulator not starting
**Solution:**
- Install Android Studio
- Create virtual device in Device Manager
- Ensure virtualization is enabled in BIOS (VT-x/AMD-V)

---

## ✅ Configuration Checklist

Use this checklist to track your progress:

### Phase 1: Local Development
- [ ] Backend API running (npm --workspace backend-api run dev)
- [ ] ML dependencies installed (python ml/scripts/test_ml_local.py)
- [ ] Mobile app compiles (cd mobile-app && npx tsc --noEmit)
- [ ] Can test backend endpoints (curl http://localhost:3000/health)

### Phase 2: Enhanced Local (Optional)
- [ ] Cosmos DB Emulator installed and running
- [ ] Backend connected to Cosmos Emulator
- [ ] Events persisting to Cosmos
- [ ] Mobile app running in emulator

### Phase 3: Azure Deployment
- [ ] Azure CLI installed (az --version)
- [ ] Logged into Azure (az login)
- [ ] Infrastructure deployed (./scripts/deploy-azure.ps1)
- [ ] Backend deployed to Azure App Service
- [ ] Cosmos DB configured and accessible
- [ ] SignalR Service configured

### Phase 4: Production Mobile App
- [ ] Mobile app .env updated with Azure endpoints
- [ ] Mobile app tested with Azure backend
- [ ] Real-time updates working
- [ ] Production build created

### Phase 5: ML Production (Optional)
- [ ] Azure ML workspace created
- [ ] ml/.env configured
- [ ] Model trained with real data
- [ ] Model deployed to Azure ML endpoint
- [ ] Backend integrated with ML predictions

---

## 🎯 Quick Commands Reference

```powershell
# Start everything locally
npm --workspace backend-api run dev          # Backend
cd mobile-app && npm start                   # Metro bundler
npm --workspace mobile-app run android       # Android app

# Test ML
python ml\scripts\test_ml_local.py          # Local test
python ml\scripts\build_dataset.py          # Real data (needs Cosmos)
python ml\scripts\train_model.py            # Train model

# Azure deployment
az login                                     # Login
.\scripts\deploy-azure.ps1 -ResourceGroup "rg" -Location "eastus"
.\scripts\test-azure.ps1 -WebAppName "app"  # Test deployment

# Check status
curl http://localhost:3000/health           # Local backend
curl https://yourapp.azurewebsites.net/health  # Azure backend
```

---

## 🎉 You're Ready!

Choose your path:
- **Just Learning?** → Keep everything local (already working!)
- **Want Persistence?** → Install Cosmos Emulator
- **Going to Production?** → Deploy to Azure

All the tools and scripts are ready. Just pick your path and follow the steps above!
