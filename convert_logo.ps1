# Meditime Logo Conversion Helper
# ----------------------------
# This script provides guidance on converting your Meditime logo to ICO format for the desktop shortcut

$appDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logoPath = Join-Path $appDir "meditime_logo.ico"

# Check if the logo already exists
if (Test-Path $logoPath) {
    Write-Host "Meditime logo ICO file already exists at: $logoPath"
    Write-Host "You can now run create_shortcut.ps1 to create a desktop shortcut with this icon."
    exit 0
}

Write-Host "Converting the Meditime logo image to ICO format:"
Write-Host "-------------------------------------------------"
Write-Host "To use your Meditime logo with the desktop shortcut:"
Write-Host ""
Write-Host "1. Convert your image to ICO format using one of these methods:"
Write-Host "   a. Online converters: https://convertico.com/ or https://icoconvert.com/"
Write-Host "   b. Paint.NET with the ICO plugin"
Write-Host "   c. GIMP or Photoshop with ICO export capabilities"
Write-Host ""
Write-Host "2. Save the converted file as 'meditime_logo.ico' in this folder:"
Write-Host "   $appDir"
Write-Host ""
Write-Host "3. After saving the ICO file, run create_shortcut.ps1 to create your desktop shortcut"
Write-Host ""
Write-Host "Note: For best results, create an ICO with multiple sizes (16x16, 32x32, 48x48, 256x256)"
Write-Host "      This ensures your icon looks good at different zoom levels in Windows"
