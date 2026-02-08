#!/usr/bin/env pwsh
<#
.SYNOPSIS
Setup script for Fitness Game React Native development
Configures Android emulator, backend API, and Metro bundler

.DESCRIPTION
Runs all necessary setup steps to get the development environment ready:
- Adds Android SDK tools to PATH
- Verifies ADB and emulator installation
- Starts emulator if not running
- Starts backend API server
- Starts Metro bundler

.PARAMETER SkipEmulator
Skip starting the emulator (use if already running)

.PARAMETER SkipBackend
Skip starting the backend API

.PARAMETER SkipMetro
Skip starting the Metro bundler

.EXAMPLE
.\dev-setup.ps1

.EXAMPLE
.\dev-setup.ps1 -SkipEmulator

#>
param(
    [switch]$SkipEmulator,
    [switch]$SkipBackend,
    [switch]$SkipMetro
)

# Colors for output
$ErrorColor = 'Red'
$SuccessColor = 'Green'
$WarningColor = 'Yellow'
$InfoColor = 'Cyan'

function Write-Status {
    param([string]$Message, [ValidateSet('Success', 'Error', 'Warning', 'Info')]$Type = 'Info')
    $Color = switch($Type) {
        'Success' { $SuccessColor }
        'Error' { $ErrorColor }
        'Warning' { $WarningColor }
        'Info' { $InfoColor }
    }
    Write-Host "[$Type] $Message" -ForegroundColor $Color
}

function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Header
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Fitness Game - React Native Development Setup               ║" -ForegroundColor Cyan
Write-Host "║  February 8, 2026                                              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify Android SDK
Write-Status "Step 1/4: Verifying Android SDK Installation..." -Type Info
$AndroidSdk = "$env:USERPROFILE\AppData\Local\Android\Sdk"
if (-not (Test-Path $AndroidSdk)) {
    Write-Status "Android SDK not found at $AndroidSdk" -Type Error
    Write-Host "Please install Android Studio from: https://developer.android.com/studio" -ForegroundColor Yellow
    exit 1
}
Write-Status "Android SDK found at $AndroidSdk" -Type Success

# Step 2: Add SDK tools to PATH
Write-Status "Step 2/4: Configuring PATH..." -Type Info
$PlatformTools = "$AndroidSdk\platform-tools"
$Emulator = "$AndroidSdk\emulator"
$AdbPath = "$PlatformTools\adb.exe"

if (-not (Test-Path $AdbPath)) {
    Write-Status "ADB not found at $AdbPath" -Type Error
    exit 1
}

# Add to PATH for this session
$env:PATH = "$PlatformTools;$Emulator;$env:PATH"
Write-Status "Android tools added to PATH" -Type Success

# Step 3: Verify Emulator
if (-not $SkipEmulator) {
    Write-Status "Step 3/4: Checking Emulator..." -Type Info
    
    # Check if Pixel_6_API_34 exists
    $AvdOutput = & "$AndroidSdk\emulator\emulator.exe" -list-avds 2>&1
    if ($AvdOutput -like "*Pixel_6_API_34*") {
        Write-Status "Pixel_6_API_34 emulator found" -Type Success
        
        # Check if already running
        $RunningDevices = & $AdbPath devices 2>&1 | Select-Object -Skip 1
        $EmulatorRunning = $RunningDevices | Where-Object { $_ -like "*emulator*" -and $_ -like "*device" }
        
        if ($EmulatorRunning) {
            Write-Status "Emulator already running" -Type Warning
        } else {
            Write-Status "Starting emulator (this takes 60-90 seconds)..." -Type Info
            Start-Process "$AndroidSdk\emulator\emulator.exe" -ArgumentList "-avd", "Pixel_6_API_34", "-netdelay", "none", "-netspeed", "full"
            
            # Wait for emulator to boot
            Write-Host "Waiting for emulator to boot..." -ForegroundColor Yellow
            $BootTimeout = 0
            while ($BootTimeout -lt 120) {
                Start-Sleep -Seconds 2
                $Devices = & $AdbPath devices 2>&1 | Select-Object -Skip 1
                $Connected = $Devices | Where-Object { $_ -like "*device" -and -not ($_ -like "*offline*") }
                if ($Connected) {
                    Write-Status "Emulator booted and ready!" -Type Success
                    break
                }
                $BootTimeout += 2
                Write-Host "." -NoNewline -ForegroundColor Yellow
            }
            
            if ($BootTimeout -ge 120) {
                Write-Status "Emulator boot timeout (still starting, you can continue)" -Type Warning
            }
        }
    } else {
        Write-Status "Pixel_6_API_34 emulator not found" -Type Warning
        Write-Host "To create it, run: Open Android Studio → AVD Manager → Create Virtual Device" -ForegroundColor Yellow
    }
} else {
    Write-Status "Step 3/4: Skipping emulator (already running)" -Type Info
}

# Step 4: Verify backend and Metro
Write-Status "Step 4/4: Development Services..." -Type Info

if (-not $SkipBackend) {
    # Check if backend is already running
    $ProcessCheck = netstat -ano 2>$null | Select-String ":3000"
    if ($ProcessCheck) {
        Write-Status "Backend API already running on localhost:3000" -Type Warning
    } else {
        Write-Status "To start backend API, run in a new terminal:" -Type Info
        Write-Host "  cd backend-api && npm run dev" -ForegroundColor Green
    }
}

if (-not $SkipMetro) {
    # Check if Metro is already running
    $ProcessCheck = netstat -ano 2>$null | Select-String ":8081"
    if ($ProcessCheck) {
        Write-Status "Metro bundler already running on localhost:8081" -Type Warning
    } else {
        Write-Status "To start Metro bundler, run in a new terminal:" -Type Info
        Write-Host "  cd mobile-app && npm start" -ForegroundColor Green
    }
}

# Summary
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✓ Setup Complete!                                             ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Emulator is booting (or already running)" -ForegroundColor White
Write-Host "2. Open 3 new terminals:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 - Backend API:" -ForegroundColor Yellow
Write-Host "   cd backend-api" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "   Terminal 2 - Metro Bundler:" -ForegroundColor Yellow
Write-Host "   cd mobile-app" -ForegroundColor Green
Write-Host "   npm start" -ForegroundColor Green
Write-Host ""
Write-Host "   Terminal 3 - Build & Deploy:" -ForegroundColor Yellow
Write-Host "   cd mobile-app" -ForegroundColor Green
Write-Host "   npm run android" -ForegroundColor Green
Write-Host ""
Write-Host "3. App launches in emulator (press R to reload, D for debug menu)" -ForegroundColor White
Write-Host ""
Write-Host "VS Code Shortcuts:" -ForegroundColor Cyan
Write-Host "  Ctrl+Alt+A - Start emulator" -ForegroundColor White
Write-Host "  Ctrl+Alt+R - Build & deploy" -ForegroundColor White
Write-Host "  Ctrl+Alt+D - Backend dev server" -ForegroundColor White
Write-Host "  Ctrl+Shift+M - Run tests" -ForegroundColor White
Write-Host "  F5 - Attach debugger" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  Read: VSCODE_ANDROID_INTEGRATION.md for detailed setup guide" -ForegroundColor White
Write-Host ""
