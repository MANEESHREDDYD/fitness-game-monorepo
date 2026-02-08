param location string = resourceGroup().location
param appServicePlanName string = 'fitness-game-plan'
param webAppName string = 'fitness-game-api'
param storageAccountName string = 'fitnessgamestorage'
param cosmosAccountName string = 'fitnessgamecosmos'
param signalrName string = 'fitness-game-signalr'
param notificationHubNamespace string = 'fitness-game-nh'
param notificationHubName string = 'fitness-game-hub'

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: []
    }
    httpsOnly: true
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
  }
}

resource signalr 'Microsoft.SignalRService/SignalR@2023-08-01' = {
  name: signalrName
  location: location
  sku: {
    name: 'Free_F1'
    tier: 'Free'
    capacity: 1
  }
}

resource notificationNamespace 'Microsoft.NotificationHubs/namespaces@2023-09-01' = {
  name: notificationHubNamespace
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
}

resource notificationHub 'Microsoft.NotificationHubs/namespaces/notificationHubs@2023-09-01' = {
  name: '${notificationNamespace.name}/${notificationHubName}'
  location: location
  properties: {}
}

output webAppName string = webAppName
output signalrEndpoint string = 'https://${signalr.properties.hostName}'
output cosmosAccountName string = cosmos.name
output storageAccountName string = storage.name
