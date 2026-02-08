@echo off
echo.
echo ================================================
echo   Android Virtual Device Tester
echo ================================================
echo.

echo Checking for Android SDK...
adb version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Android SDK not found!
    echo.
    echo Please install Android Studio:
    echo https://developer.android.com/studio
    echo.
    pause
    exit /b 1
)

echo ✅ Android SDK found
echo.

echo Checking for virtual devices...
call emulator -list-avds > temp_avds.txt 2>&1
set /p FIRST_AVD=<temp_avds.txt
del temp_avds.txt

if "%FIRST_AVD%"=="" (
    echo ❌ No virtual devices found
    echo.
    echo Creating a new Android Virtual Device...
    echo.
    
    REM Check if system images are available
    echo Checking for system images...
    sdkmanager --list 2>nul | findstr "system-images" > nul
    if %errorlevel% neq 0 (
        echo ❌ No system images available
        echo.
        echo Please install from Android Studio:
        echo 1. Open Android Studio
        echo 2. Tools → SDK Manager
        echo 3. SDK Tools → check "Android SDK Platform-Tools"
        echo 4. Install system-images for API 33
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo To create a device, open Android Studio:
    echo 1. Tools → Device Manager
    echo 2. Create Device → Pixel 5
    echo 3. Select System Image (API 33 recommended)
    echo 4. Finish
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Found virtual device: %FIRST_AVD%
    echo.
    
    echo Starting emulator...
    start /B emulator -avd %FIRST_AVD%
    
    echo Waiting for device to boot...
    timeout /t 10 /nobreak >nul
    
    echo Waiting for device to be ready...
    adb wait-for-device
    
    echo.
    echo ✅ Emulator started: %FIRST_AVD%
    echo.
    
    echo Installing and running fitness game app...
    cd mobile-app
    
    echo.
    echo Starting Metro bundler...
    start "Metro Bundler" cmd /k "npm start"
    
    timeout /t 5 /nobreak >nul
    
    echo.
    echo Building and installing app...
    call npm run android
    
    echo.
    echo ================================================
    echo   App should be running on emulator!
    echo ================================================
    echo.
    pause
)
