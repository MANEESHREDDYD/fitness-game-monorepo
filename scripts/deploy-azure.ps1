# Azure Deployment Script
# Prerequisites: Azure CLI installed and logged in

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup,
    
    [Parameter(Mandatory=$true)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId
)

Write-Host "🚀 Deploying Fitness Game to Azure..." -ForegroundColor Cyan

# Set subscription if provided
if ($SubscriptionId) {
    Write-Host "Setting subscription: $SubscriptionId" -ForegroundColor Yellow
    az account set --subscription $SubscriptionId
}

# Create resource group
Write-Host "Creating resource group: $ResourceGroup in $Location" -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

# Deploy infrastructure
Write-Host "Deploying infrastructure with Bicep..." -ForegroundColor Yellow
$deployment = az deployment group create `
    --resource-group $ResourceGroup `
    --template-file infra/main.bicep `
    --parameters location=$Location `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Infrastructure deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor Green

# Get outputs
$webAppName = $deployment.properties.outputs.webAppName.value
$cosmosAccountName = $deployment.properties.outputs.cosmosAccountName.value
$signalrEndpoint = $deployment.properties.outputs.signalrEndpoint.value

Write-Host "`n📝 Deployment Details:" -ForegroundColor Cyan
Write-Host "Web App: $webAppName" -ForegroundColor White
Write-Host "Cosmos DB: $cosmosAccountName" -ForegroundColor White
Write-Host "SignalR: $signalrEndpoint" -ForegroundColor White

# Get Cosmos connection string
Write-Host "`nFetching Cosmos DB connection string..." -ForegroundColor Yellow
$cosmosKeys = az cosmosdb keys list `
    --name $cosmosAccountName `
    --resource-group $ResourceGroup `
    --type connection-strings `
    --output json | ConvertFrom-Json

$cosmosConnection = $cosmosKeys.connectionStrings[0].connectionString

# Get SignalR access key
Write-Host "Fetching SignalR access key..." -ForegroundColor Yellow
$signalrKeys = az signalr key list `
    --name ($deployment.properties.outputs.signalrEndpoint.value -replace "https://", "" -replace ".service.signalr.net", "") `
    --resource-group $ResourceGroup `
    --output json | ConvertFrom-Json

$signalrKey = $signalrKeys.primaryKey

# Configure App Service environment variables
Write-Host "`nConfiguring App Service environment variables..." -ForegroundColor Yellow
az webapp config appsettings set `
    --name $webAppName `
    --resource-group $ResourceGroup `
    --settings `
        PORT=3000 `
        COSMOS_CONNECTION="$cosmosConnection" `
        COSMOS_DB_NAME=fitnessGame `
        SIGNALR_ENDPOINT="$signalrEndpoint" `
        SIGNALR_ACCESS_KEY="$signalrKey" `
        SIGNALR_HUB_NAME=match

Write-Host "`n✅ App Service configured!" -ForegroundColor Green

# Build and deploy backend
Write-Host "`nBuilding backend API..." -ForegroundColor Yellow
Set-Location backend-api
npm install
npm run build
Set-Location ..

Write-Host "Deploying backend to App Service..." -ForegroundColor Yellow
Compress-Archive -Path backend-api\* -DestinationPath deploy.zip -Force
az webapp deployment source config-zip `
    --resource-group $ResourceGroup `
    --name $webAppName `
    --src deploy.zip

Remove-Item deploy.zip

Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test API: https://$webAppName.azurewebsites.net/health" -ForegroundColor White
Write-Host "2. Update mobile app .env with:" -ForegroundColor White
Write-Host "   API_BASE_URL=https://$webAppName.azurewebsites.net/api" -ForegroundColor Gray
Write-Host "   SIGNALR_ENDPOINT=$signalrEndpoint" -ForegroundColor Gray
Write-Host "3. Update ML .env with:" -ForegroundColor White
Write-Host "   COSMOS_CONNECTION=$cosmosConnection" -ForegroundColor Gray
