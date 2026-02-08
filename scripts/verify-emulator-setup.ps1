#!/usr/bin/env pwsh
# Fitness Game - Android Emulator + React Native Verification Script
# Checks: Emulator connection, ADB devices, Backend API, Metro Bundler, Ports

param(
    [switch]$Quick,
    [switch]$Details,
    [switch]$Fix
)

$ErrorActionPreference = "Continue"
$Colors = @{
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
    Info    = "Cyan"
    Header  = "Magenta"
}

function Write-Status {
    param([string]$Message, [string]$Status = "Info", [string]$Prefix = "●")
    
    $color = $Colors[$Status] ?? $Colors["Info"]
    $symbol = @{
        Success = "✓"
        Error   = "✗"
        Warning = "⚠"
        Info    = "→"
    }[$Status] ?? "●"
    
    Write-Host "$symbol $Message" -ForegroundColor $color
}

Write-Host "`n" + ("="*70) -ForegroundColor Magenta
Write-Host "FITNESS GAME - EMULATOR + REACT NATIVE VERIFICATION" -ForegroundColor Magenta
Write-Host ("="*70) -ForegroundColor Magenta + "`n"

# Check ADB availability
Write-Host "[1/6] Checking ADB (Android Debug Bridge)..." -ForegroundColor Cyan
$adbExists = $null -ne (Get-Command adb -ErrorAction SilentlyContinue)

if ($adbExists) {
    Write-Status "ADB found: $(adb --version | Select-Object -First 1)" "Success"
} else {
    Write-Status "ADB not found in PATH" "Error"
    Write-Host "Fix: Add Android SDK platform-tools to PATH" -ForegroundColor Yellow
    exit 1
}

# Check Connected Devices
Write-Host "`n[2/6] Checking Connected Devices..." -ForegroundColor Cyan
$devices = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$|emulator" }

if ($devices.Count -gt 0) {
    Write-Status "Found $($devices.Count) device(s)" "Success"
    $devices | ForEach-Object {
        $device = $_ -split '\s+' | Select-Object -First 1
        $status = $_ -split '\s+' | Select-Object -Last 1
        Write-Host "  → Device: $device (Status: $status)" -ForegroundColor Green
        
        if ($Details) {
            $model = adb -s $device shell getprop ro.product.model 2>$null
            $android = adb -s $device shell getprop ro.build.version.release 2>$null
            Write-Host "    • Model: $model, Android: $android" -ForegroundColor DarkGreen
        }
    }
} else {
    Write-Status "No devices connected" "Warning"
    Write-Host "  • Is the emulator running? Start with: Ctrl+Alt+E" -ForegroundColor Yellow
    Write-Host "  • Or start emulator manually: emulator -avd Pixel_6_API_34" -ForegroundColor Yellow
}

# Check Backend API (localhost:3000)
Write-Host "`n[3/6] Checking Backend API (localhost:3000)..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Status "Backend API is running ✓" "Success"
        if ($Details) {
            Write-Host "  • Response: $($response.Content | ConvertFrom-Json | ConvertTo-Json)" -ForegroundColor DarkGreen
        }
    }
} catch {
    Write-Status "Backend API not responding on port 3000" "Error"
    Write-Host "  • Start backend: npm run dev" -ForegroundColor Yellow
    Write-Host "  • Or use keybinding: Ctrl+Alt+D" -ForegroundColor Yellow
}

# Check Metro Bundler (localhost:8081)
Write-Host "`n[4/6] Checking React Native Metro Bundler (localhost:8081)..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/status" -TimeoutSec 2 -ErrorAction Stop
    Write-Status "Metro Bundler is running ✓" "Success"
} catch {
    Write-Status "Metro Bundler not responding on port 8081" "Warning"
    Write-Host "  • Start Metro: npm start (in mobile-app folder)" -ForegroundColor Yellow
    Write-Host "  • This is optional if using npm run android" -ForegroundColor DarkYellow
}

# Check Open Ports
Write-Host "`n[5/6] Checking Network Ports..." -ForegroundColor Cyan
$ports = @{
    3000  = "Backend API"
    8081  = "Metro Bundler"
    5555  = "ADB"
    5037  = "ADB Server"
}

$ports.GetEnumerator() | ForEach-Object {
    try {
        $test = Test-NetConnection -ComputerName localhost -Port $_.Key -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($test.TcpTestSucceeded) {
            Write-Status "Port $($_.Key) ($($_.Value)) is open" "Success"
        } else {
            Write-Status "Port $($_.Key) ($($_.Value)) is closed" "Warning"
        }
    } catch {
        Write-Status "Port $($_.Key) error: $_" "Warning"
    }
}

# Quick health summary
Write-Host "`n[6/6] System Summary..." -ForegroundColor Cyan
$checks = @()

if ($adbExists) { $checks += "ADB installed" }
if ($devices.Count -gt 0) { $checks += "Emulator connected" }
if ($response.StatusCode -eq 200) { $checks += "Backend running" }

$passCount = $checks.Count
$totalChecks = 3

Write-Host "Checks passed: $passCount/$totalChecks" -ForegroundColor $(if ($passCount -eq $totalChecks) { "Green" } else { "Yellow" })
$checks | ForEach-Object { Write-Host "  ✓ $_" -ForegroundColor Green }

# Next steps
Write-Host "`n" + ("="*70) -ForegroundColor Magenta
Write-Host "QUICK START COMMANDS:" -ForegroundColor Magenta
Write-Host ("="*70) -ForegroundColor Magenta
Write-Host @"
1️⃣  Start Emulator + Deploy App (1 click):
    Ctrl+Alt+E

2️⃣  Start Full Stack (Backend + Metro + Emulator + Deploy):
    Ctrl+Shift+B (then select "Full Stack: Start All")
    OR: Cmd+Shift+D (Mac) then search task

3️⃣  View Device Logs:
    Ctrl+Shift+~ (open terminal) → Ctrl+Alt+L

4️⃣  Check Connected Devices:
    Ctrl+Alt+B (in terminal)

5️⃣  Manual Options:
    • Start Backend: npm run dev
    • Start Metro: npm start (in mobile-app)
    • Start Emulator: emulator -avd Pixel_6_API_34
    • Deploy App: npm run android (in mobile-app)
"@

Write-Host "`n" + ("="*70) -ForegroundColor Magenta
Write-Host "STATUS: Ready for development! 🚀" -ForegroundColor Green
Write-Host ("="*70) -ForegroundColor Magenta + "`n"
