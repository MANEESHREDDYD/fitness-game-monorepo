# ☁️ Azure Deployment Guide

## Prerequisites Status
✅ Azure CLI installed (v2.83.0)
✅ Deployment scripts ready
✅ Infrastructure defined (Bicep)
⏳ Azure login required

---

## Step 1: Azure Login & Setup

### 1.1 Login to Azure
```powershell
# Login with browser authentication
az login

# If you have multiple subscriptions, list them:
az account list --output table

# Set the subscription you want to use:
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Verify current subscription:
az account show
```

### 1.2 Register Required Resource Providers
```powershell
# Register providers (if not already done)
az provider register --namespace Microsoft.Web
az provider register --namespace Microsoft.DocumentDB
az provider register --namespace Microsoft.SignalRService
az provider register --namespace Microsoft.NotificationHubs
az provider register --namespace Microsoft.Storage

# Check registration status (should show "Registered")
az provider show -n Microsoft.Web --query "registrationState"
az provider show -n Microsoft.DocumentDB --query "registrationState"
az provider show -n Microsoft.SignalRService --query "registrationState"
```

---

## Step 2: Deploy Infrastructure

### Option A: Automated Deployment (Recommended)

```powershell
# Deploy everything with one command
.\scripts\deploy-azure.ps1 `
  -ResourceGroup "fitness-game-rg" `
  -Location "eastus" `
  -SubscriptionId "YOUR_SUBSCRIPTION_ID"
```

This script will:
1. ✅ Create resource group
2. ✅ Deploy all Azure resources (App Service, Cosmos DB, SignalR, etc.)
3. ✅ Build backend API
4. ✅ Deploy backend to App Service
5. ✅ Output connection strings
6. ✅ Run health check

### Option B: Manual Step-by-Step

```powershell
# 1. Create resource group
az group create `
  --name fitness-game-rg `
  --location eastus

# 2. Deploy Bicep template
az deployment group create `
  --resource-group fitness-game-rg `
  --template-file infra/main.bicep `
  --parameters infra/parameters.dev.json `
  --parameters appName=fitnessgame-$(Get-Random -Maximum 9999)

# 3. Get deployment outputs
$deployment = az deployment group show `
  --resource-group fitness-game-rg `
  --name main `
  --query properties.outputs

# 4. Extract connection strings
$cosmosConnectionString = az cosmosdb keys list `
  --name $(az cosmosdb account list -g fitness-game-rg --query "[0].name" -o tsv) `
  --resource-group fitness-game-rg `
  --type connection-strings `
  --query "connectionStrings[0].connectionString" -o tsv

$signalrConnectionString = az signalr key list `
  --name $(az signalr list -g fitness-game-rg --query "[0].name" -o tsv) `
  --resource-group fitness-game-rg `
  --query "primaryConnectionString" -o tsv

# 5. Build backend
cd backend-api
npm install
npm run build

# 6. Deploy to App Service
$webAppName = az webapp list -g fitness-game-rg --query "[0].name" -o tsv
az webapp deployment source config-zip `
  --resource-group fitness-game-rg `
  --name $webAppName `
  --src backend-api.zip
```

---

## Step 3: Configure Environment Variables

### 3.1 Set App Service Configuration
```powershell
$webAppName = az webapp list -g fitness-game-rg --query "[0].name" -o tsv

az webapp config appsettings set `
  --resource-group fitness-game-rg `
  --name $webAppName `
  --settings `
    COSMOS_CONNECTION_STRING="$cosmosConnectionString" `
    SIGNALR_CONNECTION_STRING="$signalrConnectionString" `
    NODE_ENV="production" `
    PORT="8080"
```

### 3.2 Update Mobile App Configuration
After deployment, update `mobile-app/.env`:

```env
# Get these values from Azure portal or CLI
API_URL=https://YOUR_APP_NAME.azurewebsites.net
COSMOS_CONNECTION_STRING=your_cosmos_connection_string
SIGNALR_CONNECTION_STRING=your_signalr_connection_string
```

To get values:
```powershell
# Get App Service URL
$apiUrl = "https://$(az webapp list -g fitness-game-rg --query '[0].defaultHostName' -o tsv)"
Write-Host "API_URL=$apiUrl"

# Get Cosmos connection string
$cosmosConn = az cosmosdb keys list `
  --name $(az cosmosdb account list -g fitness-game-rg --query "[0].name" -o tsv) `
  --resource-group fitness-game-rg `
  --type connection-strings `
  --query "connectionStrings[0].connectionString" -o tsv
Write-Host "COSMOS_CONNECTION_STRING=$cosmosConn"

# Get SignalR connection string
$signalrConn = az signalr key list `
  --name $(az signalr list -g fitness-game-rg --query "[0].name" -o tsv) `
  --resource-group fitness-game-rg `
  --query "primaryConnectionString" -o tsv
Write-Host "SIGNALR_CONNECTION_STRING=$signalrConn"
```

---

## Step 4: Verify Deployment

### 4.1 Test with Health Check Script
```powershell
.\scripts\test-azure.ps1 -WebAppName "YOUR_APP_NAME"
```

### 4.2 Manual Health Check
```powershell
# Get your app URL
$apiUrl = "https://$(az webapp list -g fitness-game-rg --query '[0].defaultHostName' -o tsv)"

# Test health endpoint
Invoke-RestMethod -Uri "$apiUrl/health" -Method Get

# Should return: {"status":"ok"}
```

### 4.3 Check Logs
```powershell
# Stream logs
az webapp log tail --resource-group fitness-game-rg --name YOUR_APP_NAME

# Or view in Azure Portal:
# Navigate to App Service → Monitoring → Log stream
```

---

## Step 5: Database Initialization

### 5.1 Create Cosmos DB Containers
```powershell
# Get Cosmos account name
$cosmosAccount = az cosmosdb account list -g fitness-game-rg --query "[0].name" -o tsv

# Create database
az cosmosdb sql database create `
  --account-name $cosmosAccount `
  --resource-group fitness-game-rg `
  --name FitnessGameDB

# Create containers
az cosmosdb sql container create `
  --account-name $cosmosAccount `
  --database-name FitnessGameDB `
  --name users `
  --partition-key-path "/userId" `
  --throughput 400

az cosmosdb sql container create `
  --account-name $cosmosAccount `
  --database-name FitnessGameDB `
  --name matches `
  --partition-key-path "/matchId" `
  --throughput 400

az cosmosdb sql container create `
  --account-name $cosmosAccount `
  --database-name FitnessGameDB `
  --name parks `
  --partition-key-path "/parkId" `
  --throughput 400

az cosmosdb sql container create `
  --account-name $cosmosAccount `
  --database-name FitnessGameDB `
  --name events `
  --partition-key-path "/userId" `
  --throughput 400
```

### 5.2 Import Sample Data (Optional)
```powershell
# Create sample parks data
python scripts/import-sample-data.py --cosmos-connection "$cosmosConnectionString"
```

---

## Step 6: ML Pipeline Setup

### 6.1 Create Azure Machine Learning Workspace
```powershell
# Install ML extension
az extension add -n ml

# Create ML workspace
az ml workspace create `
  --resource-group fitness-game-rg `
  --name fitness-ml-workspace `
  --location eastus

# Deploy ML endpoint
cd ml
python scripts/deploy_azureml.py
```

### 6.2 Deploy Churn Prediction Model
```powershell
# Train model with production data
python scripts/train_model.py --output models/churn_model.joblib

# Deploy to Azure ML
az ml online-deployment create `
  --name churn-predictor-v1 `
  --endpoint churn-endpoint `
  --model models/churn_model.joblib `
  --instance-type Standard_DS2_v2
```

---

## Resource Summary

After deployment, you'll have:

| Resource Type | Name Pattern | Purpose | Cost (USD/month) |
|--------------|--------------|---------|------------------|
| App Service | fitnessgame-XXXX | Backend API | ~$13 (B1) |
| Cosmos DB | fitnessgame-cosmos-XXXX | Database | ~$1-5 (Serverless) |
| SignalR | fitnessgame-signalr-XXXX | Real-time updates | Free tier |
| Storage Account | fitnessgameXXXX | File storage | ~$1 |
| Notification Hub | fitnessgame-notifications | Push notifications | Free tier |
| **Total** | | | **~$15-20/month** |

---

## Cost Optimization

### Free/Low-Cost Options
```powershell
# Use Free App Service (F1)
# Note: No auto-scaling, 60 min/day limit
az webapp update -g fitness-game-rg -n YOUR_APP --set "sku.tier=Free" "sku.name=F1"

# Use Cosmos DB Free Tier (400 RU/s free)
# Already configured in main.bicep with serverless mode

# Use Azure Functions (Consumption Plan)
# First 1M executions free/month
```

### Development vs Production

**Development** (~$5/month):
- Free App Service (F1)
- Cosmos DB Serverless
- SignalR Free tier

**Production** (~$50+/month):
- App Service (S1: $74)
- Cosmos DB Provisioned (1000 RU/s)
- SignalR Standard ($49)
- Application Insights

---

## CI/CD Setup (GitHub Actions)

### 1. Create Service Principal
```powershell
az ad sp create-for-rbac `
  --name "fitness-game-deploy" `
  --role contributor `
  --scopes /subscriptions/YOUR_SUB_ID/resourceGroups/fitness-game-rg `
  --sdk-auth
```

Copy the JSON output - you'll need it for GitHub secrets.

### 2. Add GitHub Secrets
1. Go to your GitHub repository
2. Settings → Secrets → Actions
3. Add these secrets:
   - `AZURE_CREDENTIALS`: The JSON from above
   - `AZURE_SUBSCRIPTION_ID`: Your subscription ID
   - `AZURE_WEBAPP_NAME`: Your app service name

### 3. Enable GitHub Actions
The workflow file `.github/workflows/deploy.yml` will automatically:
- Deploy on every push to main
- Build backend
- Run tests
- Deploy to Azure

---

## Monitoring & Debugging

### Application Insights
```powershell
# Enable Application Insights
az monitor app-insights component create `
  --app fitness-game-insights `
  --location eastus `
  --resource-group fitness-game-rg `
  --application-type web

# Connect to App Service
$instrumentationKey = az monitor app-insights component show `
  --app fitness-game-insights `
  --resource-group fitness-game-rg `
  --query instrumentationKey -o tsv

az webapp config appsettings set `
  --resource-group fitness-game-rg `
  --name YOUR_APP_NAME `
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$instrumentationKey
```

### View Metrics
```powershell
# CPU usage
az monitor metrics list `
  --resource /subscriptions/YOUR_SUB/resourceGroups/fitness-game-rg/providers/Microsoft.Web/sites/YOUR_APP `
  --metric "CpuPercentage" `
  --interval PT1H

# Response time
az monitor metrics list `
  --resource /subscriptions/YOUR_SUB/resourceGroups/fitness-game-rg/providers/Microsoft.Web/sites/YOUR_APP `
  --metric "ResponseTime" `
  --interval PT1H
```

---

## Troubleshooting

### Deployment Fails
```powershell
# Check deployment status
az deployment group show `
  --resource-group fitness-game-rg `
  --name main

# View deployment logs
az deployment operation group list `
  --resource-group fitness-game-rg `
  --name main
```

### App Won't Start
```powershell
# Check app logs
az webapp log tail -g fitness-game-rg -n YOUR_APP

# Restart app
az webapp restart -g fitness-game-rg -n YOUR_APP

# Check environment variables
az webapp config appsettings list -g fitness-game-rg -n YOUR_APP
```

### Connection String Issues
```powershell
# Test Cosmos DB connection
$cosmosConn = az cosmosdb keys list `
  --name YOUR_COSMOS_ACCOUNT `
  --resource-group fitness-game-rg `
  --type connection-strings `
  --query "connectionStrings[0].connectionString" -o tsv

# Verify connection
python -c "from azure.cosmos import CosmosClient; client = CosmosClient.from_connection_string('$cosmosConn'); print('✅ Connected')"
```

### SignalR Not Working
```powershell
# Check SignalR status
az signalr show -g fitness-game-rg -n YOUR_SIGNALR --query "provisioningState"

# Regenerate key if needed
az signalr key renew -g fitness-game-rg -n YOUR_SIGNALR --key-type primary
```

---

## Scaling Strategy

### Auto-Scaling Rules
```powershell
# Enable auto-scaling (requires Standard tier)
az monitor autoscale create `
  --resource-group fitness-game-rg `
  --resource YOUR_APP `
  --resource-type Microsoft.Web/sites `
  --name autoscale-rules `
  --min-count 1 `
  --max-count 5 `
  --count 1

# Scale on CPU (>70%)
az monitor autoscale rule create `
  --resource-group fitness-game-rg `
  --autoscale-name autoscale-rules `
  --condition "CpuPercentage > 70 avg 5m" `
  --scale out 1

# Scale down on low CPU (<30%)
az monitor autoscale rule create `
  --resource-group fitness-game-rg `
  --autoscale-name autoscale-rules `
  --condition "CpuPercentage < 30 avg 10m" `
  --scale in 1
```

---

## Cleanup (When Done Testing)

```powershell
# Delete entire resource group (CAUTION: Deletes everything!)
az group delete --name fitness-game-rg --yes

# Or delete specific resources
az webapp delete -g fitness-game-rg -n YOUR_APP
az cosmosdb delete -g fitness-game-rg -n YOUR_COSMOS
az signalr delete -g fitness-game-rg -n YOUR_SIGNALR
```

---

## Next Steps After Deployment

1. ✅ **Test all endpoints** using `.\scripts\test-azure.ps1`
2. ✅ **Update mobile app .env** with Azure URLs
3. ✅ **Test mobile app** with real Azure backend
4. ✅ **Set up monitoring** (Application Insights)
5. ✅ **Configure custom domain** (optional)
6. ✅ **Enable HTTPS** (automatic with App Service)
7. ✅ **Set up backups** (Cosmos DB automatic backups enabled)

---

## Quick Deployment Command

```powershell
# All-in-one deployment
az login
.\scripts\deploy-azure.ps1 -ResourceGroup "fitness-game-rg" -Location "eastus" -SubscriptionId "YOUR_SUB_ID"
```

Then update mobile-app/.env and test!

---

✅ **Your Azure infrastructure is ready to deploy!**

🚀 **Start with**: `az login` then run the deployment script!
