@echo off
echo.
echo ================================================
echo   Azure CLI Quick Installer
echo ================================================
echo.
echo This will install Azure CLI using Windows Package Manager (winget)
echo.
pause

echo Installing Azure CLI...
winget install -e --id Microsoft.AzureCLI

echo.
echo ================================================
echo   Installation Complete!
echo ================================================
echo.
echo Please CLOSE this terminal and open a NEW one to use 'az' commands.
echo.
echo To verify installation, run: az --version
echo.
pause
