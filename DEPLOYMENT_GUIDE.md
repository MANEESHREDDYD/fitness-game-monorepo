# 🚀 Fitness Game Deployment Guide

## Prerequisites

### 1. Install Azure CLI
```powershell
# Run the installation script
powershell -ExecutionPolicy Bypass -File scripts\install-azure-cli.ps1

# Or download manually from: https://aka.ms/installazurecliwindows
# After installation, close and reopen your terminal
```

### 2. Verify Installations
```powershell
# Check Azure CLI
az --version

# Check Node.js
node --version  # Should be 20+

# Check Python
python --version  # Should be 3.10+

# Check ML packages
python -c "import pandas, sklearn, joblib; print('ML packages OK')"
```

## 🏗️ Phase 1: Azure Infrastructure Deployment

### Option A: Automated Script (Recommended)
```powershell
# Login to Azure
az login

# Run deployment script
.\scripts\deploy-azure.ps1 `
    -ResourceGroup "fitness-game-rg" `
    -Location "eastus" `
    -SubscriptionId "your-subscription-id"
```

### Option B: Manual Deployment
```powershell
# Login to Azure
az login

# Set subscription
az account set --subscription "your-subscription-id"

# Create resource group
az group create --name fitness-game-rg --location eastus

# Deploy infrastructure
az deployment group create `
    --resource-group fitness-game-rg `
    --template-file infra\main.bicep `
    --parameters location=eastus

# Get outputs
az deployment group show `
    --resource-group fitness-game-rg `
    --name main `
    --query properties.outputs
```

### Resources Created
- ✅ App Service Plan (B1 Basic)
- ✅ Web App (Node 20 LTS)
- ✅ Cosmos DB (Serverless)
- ✅ SignalR Service (Free tier)
- ✅ Storage Account
- ✅ Notification Hub

## 🔧 Phase 2: Configure Backend API

### 1. Get Connection Strings

**Cosmos DB:**
```powershell
az cosmosdb keys list `
    --name <cosmos-account-name> `
    --resource-group fitness-game-rg `
    --type connection-strings `
    --query "connectionStrings[0].connectionString" -o tsv
```

**SignalR:**
```powershell
az signalr key list `
    --name <signalr-name> `
    --resource-group fitness-game-rg `
    --query "primaryKey" -o tsv
```

### 2. Configure App Service
```powershell
az webapp config appsettings set `
    --name <web-app-name> `
    --resource-group fitness-game-rg `
    --settings `
        PORT=3000 `
        COSMOS_CONNECTION="<cosmos-connection-string>" `
        COSMOS_DB_NAME=fitnessGame `
        SIGNALR_ENDPOINT="<signalr-endpoint>" `
        SIGNALR_ACCESS_KEY="<signalr-key>" `
        SIGNALR_HUB_NAME=match
```

### 3. Deploy Backend Code
```powershell
# Build backend
cd backend-api
npm install
npm run build
cd ..

# Deploy to App Service
az webapp deployment source config-zip `
    --resource-group fitness-game-rg `
    --name <web-app-name> `
    --src backend-api.zip
```

### 4. Test Deployment
```powershell
# Test health endpoint
curl https://<web-app-name>.azurewebsites.net/health

# Expected response: {"status":"ok"}
```

## 📱 Phase 3: Configure Mobile App

Update `mobile-app/.env`:
```env
API_BASE_URL=https://<web-app-name>.azurewebsites.net/api
SIGNALR_ENDPOINT=https://<signalr-name>.service.signalr.net
B2C_CONFIG={"tenant":"","clientId":"","redirectUri":""}
```

Test locally:
```powershell
cd mobile-app
npm start
# In another terminal:
npm run android  # or npm run ios
```

## 🤖 Phase 4: ML Pipeline Setup

### 1. Configure ML Environment

Create `ml/.env`:
```env
COSMOS_CONNECTION=<your-cosmos-connection-string>
COSMOS_DB_NAME=fitnessGame

AZURE_SUBSCRIPTION_ID=<your-subscription-id>
AZURE_RESOURCE_GROUP=fitness-game-rg
AZURE_ML_WORKSPACE=<your-ml-workspace-name>
```

### 2. Test ML Pipeline Locally (No Cosmos Required)
```powershell
cd ml
python scripts/test_ml_local.py
```

This will:
- Generate mock user and event data
- Build feature dataset
- Train churn prediction model
- Save model to `ml_artifacts/churn_model.joblib`

### 3. Build Dataset from Cosmos (Production)
```powershell
# After you have real data in Cosmos
cd ml
python scripts/build_dataset.py
```

### 4. Train Model
```powershell
python scripts/train_model.py
```

### 5. Deploy to Azure ML

**Create Azure ML Workspace:**
```powershell
az ml workspace create `
    --name fitness-game-ml `
    --resource-group fitness-game-rg `
    --location eastus
```

**Deploy Model:**
```powershell
# Set environment variables in ml/.env file
python scripts/deploy_azureml.py
```

### 6. Test ML Endpoint
```powershell
# Get endpoint URL and key from Azure Portal
# Test with curl or Postman
```

## 🔄 Phase 5: CI/CD with GitHub Actions

### 1. Configure GitHub Secrets

Go to GitHub repo → Settings → Secrets → Actions

Add these secrets:
```
AZURE_CREDENTIALS         # Service principal JSON
AZURE_SUBSCRIPTION_ID     # Your subscription ID
AZURE_RESOURCE_GROUP      # fitness-game-rg
AZURE_WEBAPP_NAME         # Your web app name
```

### 2. Create Service Principal
```powershell
az ad sp create-for-rbac `
    --name "fitness-game-deploy" `
    --role contributor `
    --scopes /subscriptions/<subscription-id>/resourceGroups/fitness-game-rg `
    --sdk-auth
```

Copy the JSON output to `AZURE_CREDENTIALS` secret.

### 3. Trigger Deployment
```powershell
# Push to main branch
git add .
git commit -m "Deploy to Azure"
git push origin main
```

GitHub Actions will automatically:
1. Deploy infrastructure
2. Build and deploy backend API

## 📊 Phase 6: Monitoring & Testing

### Test Complete E2E Flow

1. **Backend Health:**
   ```powershell
   curl https://<web-app-name>.azurewebsites.net/health
   ```

2. **Create Match:**
   ```powershell
   curl -X POST https://<web-app-name>.azurewebsites.net/api/matches `
        -H "Content-Type: application/json" `
        -d '{"parkId":"central-park","teamSize":4}'
   ```

3. **Join Match:**
   ```powershell
   curl -X POST https://<web-app-name>.azurewebsites.net/api/matches/join-by-code `
        -H "Content-Type: application/json" `
        -d '{"code":"ABC123","displayName":"TestUser","teamId":"blue"}'
   ```

4. **Check Cosmos DB:**
   - Go to Azure Portal → Cosmos DB → Data Explorer
   - Check Events container for logged events

5. **Mobile App:**
   - Update .env with Azure endpoints
   - Run app on device/emulator
   - Test full match flow

### Monitor Logs
```powershell
# Stream App Service logs
az webapp log tail `
    --name <web-app-name> `
    --resource-group fitness-game-rg

# View in Azure Portal
# App Service → Monitoring → Log stream
```

## 🎯 Quick Validation Checklist

- [ ] Azure CLI installed
- [ ] ML dependencies installed (`pip install -r ml/requirements.txt`)
- [ ] Azure resources deployed
- [ ] Backend API health check returns 200
- [ ] Cosmos DB connection working
- [ ] SignalR service configured
- [ ] Mobile app connects to Azure API
- [ ] Events being logged to Cosmos
- [ ] ML model trained locally
- [ ] ML endpoint deployed (optional)

## 🆘 Troubleshooting

### Backend API Issues
```powershell
# Check App Service status
az webapp show --name <web-app-name> --resource-group fitness-game-rg

# View logs
az webapp log download --name <web-app-name> --resource-group fitness-game-rg
```

### Cosmos DB Issues
```powershell
# Test connection
az cosmosdb show --name <cosmos-name> --resource-group fitness-game-rg

# Check containers
az cosmosdb sql container list `
    --account-name <cosmos-name> `
    --database-name fitnessGame `
    --resource-group fitness-game-rg
```

### SignalR Issues
```powershell
# Check service status
az signalr show --name <signalr-name> --resource-group fitness-game-rg
```

## 📚 Additional Resources

- [Azure CLI Documentation](https://docs.microsoft.com/cli/azure/)
- [Azure Bicep Documentation](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [Azure ML Documentation](https://docs.microsoft.com/azure/machine-learning/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)

## 🎉 Success!

Your Fitness Game is now deployed to Azure! 🚀

Next: Share match codes and start playing!
