# Meditime Packaging Script
# This script creates a distributable ZIP file for the Meditime application

$appName = "Meditime"
$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outputZip = Join-Path $currentDir "$appName.zip"

# Create temporary directory with timestamp to avoid conflicts
$tempDir = Join-Path $env:TEMP "$appName-packaging-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "Packaging $appName for distribution..."

# Files and directories to include
$filesToInclude = @(
    "index.html",
    "meditime_launcher.bat",
    "create_shortcut.ps1",
    "favicon.ico",
    "meditime_logo.ico",
    "meditime_logo2.ico",
    "INSTALL.md",
    "src"
)

# Files and directories to exclude (inside the included directories)
$excludePatterns = @(
    "*.git*",
    "*node_modules*"
)

# Copy files to temp directory
foreach ($item in $filesToInclude) {
    $sourcePath = Join-Path $currentDir $item
    $destPath = Join-Path $tempDir $item
    
    if (Test-Path $sourcePath) {
        if (Test-Path $sourcePath -PathType Container) {
            # It's a directory, copy recursively
            $robocopyArgs = @($sourcePath, $destPath, "*.*", "/E", "/XD")
            $robocopyArgs += $excludePatterns
            & robocopy $robocopyArgs | Out-Null
        } else {
            # It's a file, copy directly
            Copy-Item -Path $sourcePath -Destination $destPath -Force
        }
    } else {
        Write-Warning "Could not find item to package: $item"
    }
}

# Create the ZIP file
if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $outputZip)

# Clean up
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Packaging complete!"
Write-Host "Your packaged app is available at: $outputZip"
Write-Host "You can now attach this ZIP file to an email for distribution."
