# Update Meditime Package With Logo
# This script helps convert and integrate the Meditime logo for desktop shortcuts

$appDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logoPath = Join-Path $appDir "meditime_logo.ico"
$tempIconDir = Join-Path $env:TEMP "MeditimeIconTemp"

# Create temp directory if it doesn't exist
if (-not (Test-Path $tempIconDir)) {
    New-Item -ItemType Directory -Path $tempIconDir -Force | Out-Null
}

# Function to convert PNG to ICO using PowerShell
function Convert-ImageToIcon {
    param (
        [string]$InputImagePath,
        [string]$OutputIconPath,
        [switch]$UseExisting
    )

    if ($UseExisting -and (Test-Path $OutputIconPath)) {
        Write-Host "Using existing icon file at: $OutputIconPath"
        return $true
    }

    # Check if we can use .NET for simple conversion (works for basic needs)
    try {
        Add-Type -AssemblyName System.Drawing
        
        $image = [System.Drawing.Image]::FromFile($InputImagePath)
        $icon = [System.Drawing.Icon]::FromHandle($image.GetHicon())
        
        $fileStream = New-Object System.IO.FileStream($OutputIconPath, [System.IO.FileMode]::Create)
        $icon.Save($fileStream)
        
        $fileStream.Close()
        $icon.Dispose()
        $image.Dispose()
        
        Write-Host "Successfully converted image to icon at: $OutputIconPath"
        return $true
    }
    catch {
        Write-Host "Could not convert image automatically: $_"
        return $false
    }
}

Write-Host "Meditime Logo Integration Helper"
Write-Host "--------------------------------"

$pngPath = Join-Path $appDir "meditime_logo.png"

# Check if the image exists in PNG format
if (Test-Path $pngPath) {
    Write-Host "Found Meditime logo image: $pngPath"
    $converted = Convert-ImageToIcon -InputImagePath $pngPath -OutputIconPath $logoPath
    
    if ($converted) {
        Write-Host "Successfully created icon file for shortcuts."
    } else {
        Write-Host "Automatic conversion not possible. Please convert manually:"
        Write-Host "1. Use an online converter like https://convertico.com/"
        Write-Host "2. Save the resulting .ico file as 'meditime_logo.ico' in this folder"
    }
} else {
    # If PNG doesn't exist, create a placeholder file with instructions
    Write-Host "Meditime logo image not found."
    Write-Host "To use the Meditime logo for shortcuts:"
    Write-Host "1. Save the logo image as 'meditime_logo.png' in the app directory:"
    Write-Host "   $appDir"
    Write-Host "2. Run this script again to convert it to ICO format"
    Write-Host "   - OR -"
    Write-Host "3. Convert the image to ICO format manually and save as 'meditime_logo.ico'"
}

# Update packaging script to include the logo
$packageScriptPath = Join-Path $appDir "package_app.ps1"
if (Test-Path $packageScriptPath) {
    $packageContent = Get-Content $packageScriptPath -Raw
    
    if (-not $packageContent.Contains("meditime_logo.ico")) {
        $updatedContent = $packageContent -replace "(\`$filesToInclude = @\(\s+.+?)(\))", "`$1,`n    `"meditime_logo.ico`"`$2"
        Set-Content -Path $packageScriptPath -Value $updatedContent
        
        Write-Host "Updated packaging script to include the logo icon"
    }
}

Write-Host "`nYou can now run create_shortcut.ps1 to create a desktop shortcut with the Meditime logo"
