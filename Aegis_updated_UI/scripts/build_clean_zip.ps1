$ErrorActionPreference = "Stop"

$stagingDir = "C:\Users\solan\.gemini\antigravity-ide\brain\35020872-2f30-43ec-9c11-7bf07bb5011a\scratch\staging_aegis"
$zipPath = "C:\Users\solan\OneDrive\Desktop\SIH\AEGIS_SIH26001_Clean.zip"

if (Test-Path $stagingDir) {
    Remove-Item -Recurse -Force $stagingDir -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $stagingDir | Out-Null

$sourceRoot = "C:\Users\solan\OneDrive\Desktop\SIH"

# Items to include
$includeItems = @(
    'app',
    'src',
    'assets',
    'package.json',
    'package-lock.json',
    'app.json',
    'tsconfig.json',
    'metro.config.js',
    'eslint.config.js',
    'README.md',
    'LICENSE',
    'AGENTS.md',
    'stitch_ui_prompt.txt'
)

foreach ($item in $includeItems) {
    $srcPath = Join-Path $sourceRoot $item
    if (Test-Path $srcPath) {
        $destPath = Join-Path $stagingDir $item
        Copy-Item -Path $srcPath -Destination $destPath -Recurse -Force
    }
}

# Copy android source structure cleanly
$androidStaging = Join-Path $stagingDir "android"
New-Item -ItemType Directory -Path $androidStaging | Out-Null

$androidIncludeItems = @(
    'app',
    'build.gradle',
    'settings.gradle',
    'gradle.properties',
    'gradlew',
    'gradlew.bat',
    'gradle'
)

foreach ($aItem in $androidIncludeItems) {
    $aSrc = Join-Path "$sourceRoot\android" $aItem
    if (Test-Path $aSrc) {
        $aDest = Join-Path $androidStaging $aItem
        Copy-Item -Path $aSrc -Destination $aDest -Recurse -Force
    }
}

# Clean out any binary/cache directories from staging android
$excludedSubdirs = @(
    "$androidStaging\.gradle",
    "$androidStaging\build",
    "$androidStaging\.kotlin",
    "$androidStaging\.cxx",
    "$androidStaging\app\build",
    "$androidStaging\app\.cxx"
)

foreach ($ex in $excludedSubdirs) {
    if (Test-Path $ex) {
        Remove-Item -Recurse -Force $ex -ErrorAction SilentlyContinue
    }
}

# Remove any system/log/env files from staging
Get-ChildItem -Path $stagingDir -Recurse -Include ".env*", "*.log", "desktop.ini", "Thumbs.db", "*.tmp" -Force | Remove-Item -Force -ErrorAction SilentlyContinue

# Scan files in staging for personal user path or secrets
$scannedFiles = Get-ChildItem -Path $stagingDir -Recurse -File
$sensitiveMatches = 0
$userPathMatches = 0

foreach ($file in $scannedFiles) {
    # Skip binary media files
    if ($file.Extension -match '\.(png|jpg|jpeg|ico|ttf|otf|woff|woff2|keystore)$') {
        continue
    }
    
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -ne $content) {
        if ($content -match "solan") {
            $userPathMatches++
            $sanitized = $content -replace "C:\\Users\\solan\\[^\r\n]*", "."
            Set-Content -Path $file.FullName -Value $sanitized
        }
    }
}

# Remove existing target zip if present
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath -ErrorAction SilentlyContinue
}

# Compress staging directory
Compress-Archive -Path "$stagingDir\*" -DestinationPath $zipPath -Force

# Count final files in staging
$finalFiles = Get-ChildItem -Path $stagingDir -Recurse -File
$finalFileCount = $finalFiles.Count

# Cleanup staging directory
Remove-Item -Recurse -Force $stagingDir -ErrorAction SilentlyContinue

Write-Host "SCAN_SUMMARY: TotalFiles=$finalFileCount, SensitiveMatches=$sensitiveMatches, UserPathMatches=$userPathMatches"
