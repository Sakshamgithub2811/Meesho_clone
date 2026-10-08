@echo off
title MShoppy SuperApp Launcher
echo =====================================================================
echo                MSHOPPY SUPERAPP PLATFORM LAUNCHER
echo =====================================================================
echo.
echo [1/2] Starting Backend Server (Express + Firebase Auth) on http://localhost:5000 ...
start "MShoppy Backend Server (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo [2/2] Starting Frontend Vite App on http://localhost:5173 ...
start "MShoppy Frontend App (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo =====================================================================
echo  Both servers started in separate terminal windows!
echo  - Backend API:  http://localhost:5000
echo  - Frontend Web: http://localhost:5173
echo =====================================================================
echo.
timeout /t 3 >nul
start http://localhost:5173
