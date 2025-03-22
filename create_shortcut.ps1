$WshShell = New-Object -ComObject WScript.Shell
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Meditime.lnk')
$Shortcut.TargetPath = "$ScriptPath\meditime_launcher.bat"
$Shortcut.WorkingDirectory = "$ScriptPath"
$Shortcut.Description = 'Meditime Meditation App'

# Check for the meditime_logo2.ico file first, then fall back to meditime_logo.ico, and finally to the default favicon
$Logo2Path = "$ScriptPath\meditime_logo2.ico"
$Logo1Path = "$ScriptPath\meditime_logo.ico"
$DefaultIconPath = "$ScriptPath\favicon.ico"

if (Test-Path $Logo2Path) {
    $Shortcut.IconLocation = "$Logo2Path,0"
    Write-Host "Using Meditime logo 2 for shortcut icon"
} elseif (Test-Path $Logo1Path) {
    $Shortcut.IconLocation = "$Logo1Path,0"
    Write-Host "Using Meditime logo 1 for shortcut icon"
} else {
    $Shortcut.IconLocation = "$DefaultIconPath,0"
    Write-Host "Custom logos not found. Using default icon"
}

$Shortcut.Save()

Write-Host "Desktop shortcut created successfully!"
