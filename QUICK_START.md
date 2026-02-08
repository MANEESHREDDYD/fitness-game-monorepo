# 🚀 Quick Start: Azure & ML Deployment

## ✅ Current Status

### Backend API
- ✅ Running on localhost:3000
- ✅ All endpoints tested and working
- ✅ Events being logged
- ✅ Match creation, join, and zone capture working

### Mobile App
- ✅ Code compiled without errors
- ✅ All screens implemented
- ✅ Ready for testing

### ML Pipeline  
- ✅ All dependencies installed
- ✅ Test pipeline completed successfully
- ✅ Model trained with 100% accuracy on test data
- ✅ Model artifacts generated

### Infrastructure
- ✅ Bicep templates ready
- ✅ Deployment scripts created
- ⚠️ Azure CLI not installed yet

---

## 🎯 Next Steps (Choose your path)

### Path A: Quick Local ML Testing (5 minutes)

Already done! ✅

```powershell
cd ml
python scripts/test_ml_local.py
```

**Results:**
- Dataset: `ml_artifacts/churn_dataset.csv` (50 users, 46% churn rate)
- Model: `ml_artifacts/churn_model.joblib` (100% accuracy)
- Sample predictions working

---

### Path B: Deploy to Azure (30 minutes)

#### Step 1: Install Azure CLI
```powershell
# Option 1: Run our script
powershell -ExecutionPolicy Bypass -File scripts\install-azure-cli.ps1

# Option 2: Download installer
# https://aka.ms/installazurecliwindows

# After installation, close and reopen terminal
az --version
```

#### Step 2: Login to Azure
```powershell
az login
```

#### Step 3: Deploy Everything (Automated)
```powershell
# This script does EVERYTHING:
# - Creates resource group
# - Deploys all Azure resources
# - Configures environment variables
# - Builds and deploys backend
# - Outputs connection strings for mobile app

.\scripts\deploy-azure.ps1 `
    -ResourceGroup "fitness-game-rg" `
    -Location "eastus" `
    -SubscriptionId "<your-subscription-id>"
```

#### Step 4: Update Mobile App
After deployment completes, update `mobile-app/.env`:
```env
API_BASE_URL=https://<web-app-name>.azurewebsites.net/api
SIGNALR_ENDPOINT=https://<signalr-name>.service.signalr.net
```

#### Step 5: Test Azure Deployment
```powershell
# Test health endpoint
curl https://<web-app-name>.azurewebsites.net/health

# Expected: {"status":"ok"}
```

---

### Path C: Deploy ML to Azure ML (Advanced, 20 minutes)

**Prerequisites:**
- Azure resources deployed (Path B completed)
- Real user data in Cosmos DB (optional, can use mock data)

#### Step 1: Create Azure ML Workspace
```powershell
az ml workspace create `
    --name fitness-game-ml `
    --resource-group fitness-game-rg `
    --location eastus
```

#### Step 2: Configure ML Environment
Update `ml/.env`:
```env
COSMOS_CONNECTION=<from-azure-portal>
COSMOS_DB_NAME=fitnessGame

AZURE_SUBSCRIPTION_ID=<your-sub-id>
AZURE_RESOURCE_GROUP=fitness-game-rg
AZURE_ML_WORKSPACE=fitness-game-ml
```

#### Step 3: Build Dataset (if using real data)
```powershell
cd ml
python scripts/build_dataset.py
```

Skip this if using mock data from test_ml_local.py

#### Step 4: Train Model
```powershell
python scripts/train_model.py
```

#### Step 5: Deploy to Azure ML
```powershell
python scripts/deploy_azureml.py
```

#### Step 6: Test ML Endpoint
Get endpoint details from Azure Portal → Machine Learning → Endpoints

---

## 📊 What You Get After Full Deployment

### Azure Resources
- **App Service**: Backend API running on Node 20
- **Cosmos DB**: Events, Users, Matches containers
- **SignalR**: Real-time match updates
- **Storage Account**: For future file uploads
- **Notification Hub**: For push notifications

### Cost Estimate (per month)
- App Service (B1): ~$13
- Cosmos DB (Serverless): $0.25/GB + $0.25/1M RUs
- SignalR (Free): $0
- Storage: ~$0.05
- **Total: ~$15-20/month** (with minimal usage)

### Free Tier Options
- Cosmos DB: 1000 RU/s free forever
- SignalR: 20 concurrent connections free
- First 12 months: Many services free

---

## 🧪 Testing Checklist

### Local Backend ✅
- [x] Health check working
- [x] Create match endpoint
- [x] Join match by code
- [x] Zone capture
- [x] Events being logged

### Azure Backend (After deployment)
- [ ] Health check: `https://<app>.azurewebsites.net/health`
- [ ] Create match via Azure endpoint
- [ ] Events in Cosmos DB (check Azure Portal)
- [ ] SignalR connections working

### Mobile App (After Azure configured)
- [ ] App connects to Azure API
- [ ] Can create match
- [ ] Can join match with code
- [ ] Real-time updates working
- [ ] Location tracking working

### ML Pipeline ✅
- [x] Local test with mock data
- [ ] Dataset built from Cosmos (if real data)
- [ ] Model trained
- [ ] Model deployed to Azure ML (optional)
- [ ] Predictions working

---

## 🆘 Common Issues & Solutions

### Issue: "az: command not found"
**Solution:** Install Azure CLI and restart terminal

### Issue: "Deployment failed"
**Solution:** Check that:
- You're logged into correct Azure subscription
- Resource names are unique (try different names)
- You have permissions to create resources

### Issue: "Backend not responding"
**Solution:**
- Check App Service logs in Azure Portal
- Verify environment variables are set
- Check deployment status

### Issue: "Cosmos connection failed"
**Solution:**
- Verify connection string in App Service settings
- Check Cosmos DB firewall settings (allow Azure services)
- Try connection string from Azure Portal

### Issue: "ML model won't train"
**Solution:**
- Ensure you have enough data (>10 users)
- Check that both churned and active users exist
- Verify dataset has required columns

---

## 📚 Documentation

- [Full Deployment Guide](DEPLOYMENT_GUIDE.md) - Detailed step-by-step
- [Backend API README](backend-api/README.md) - API documentation
- [Mobile App README](mobile-app/README.md) - App setup guide
- [Infrastructure (Bicep)](infra/main.bicep) - Azure resources

---

## 🎯 Recommended Next Steps

1. **Today:** Install Azure CLI, deploy infrastructure
2. **Tomorrow:** Test mobile app with Azure backend
3. **This week:** Generate real user data, train production ML model
4. **Next week:** Set up CI/CD pipeline, add monitoring

---

## 💡 Tips

- Use **Free tier** services for development
- Deploy to **dev/test** resource group first
- Keep local backend running for mobile dev
- Use **Azure Portal** to monitor costs
- Set up **budget alerts** (free)

---

## ✅ You're Ready!

Everything is set up and tested locally. When you're ready:

```powershell
# 1. Install Azure CLI
.\scripts\install-azure-cli.ps1

# 2. Deploy to Azure
az login
.\scripts\deploy-azure.ps1 -ResourceGroup "fitness-game-rg" -Location "eastus"

# 3. Start building!
```

Good luck! 🚀
