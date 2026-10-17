@echo off
chcp 65001 > nul
title Servidor Nexus Core - Parcial 2 ISW 2
echo ========================================================
echo   INICIANDO SISTEMA NEXUS CORE - PARCIAL 2
echo   Ingeniería de Software 2
echo ========================================================
echo.

:: Abrir el navegador en la URL del proyecto
start http://localhost:5000/

:: Ejecutar el servidor nativo en PowerShell
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"

pause
