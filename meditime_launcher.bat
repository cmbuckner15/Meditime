@echo off
echo Opening Meditime App...
start "" "%~dp0index.html"
if errorlevel 1 (
    echo Error: Unable to open Meditime. Please make sure a web browser is installed.
    pause
)
