# Install Azure CLI on Windows
# Run this script with: powershell -ExecutionPolicy Bypass -File install-azure-cli.ps1

Write-Host "Installing Azure CLI..." -ForegroundColor Cyan

# Download and install Azure CLI
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi
Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'
Remove-Item .\AzureCLI.msi

Write-Host "Azure CLI installed successfully!" -ForegroundColor Green
Write-Host "Please close and reopen your terminal to use 'az' commands." -ForegroundColor Yellow
