$stage = 'aegis_clean_stage'
if (Test-Path $stage) { 
    Remove-Item -Recurse -Force $stage 
}
New-Item -ItemType Directory -Path $stage | Out-Null

# 1. Copy source code & assets
Copy-Item -Path 'app' -Destination "$stage/app" -Recurse -Force
Copy-Item -Path 'src' -Destination "$stage/src" -Recurse -Force
Copy-Item -Path 'assets' -Destination "$stage/assets" -Recurse -Force
Copy-Item -Path 'scripts' -Destination "$stage/scripts" -Recurse -Force

# 2. Copy root configuration, manifests and docs
$rootFiles = @(
    'package.json',
    'package-lock.json',
    'app.json',
    'tsconfig.json',
    'metro.config.js',
    'eslint.config.js',
    'expo-env.d.ts',
    '.env.example',
    '.gitignore',
    'AGENTS.md',
    'LICENSE',
    'README.md',
    'stitch_ui_prompt.txt'
)
foreach ($rf in $rootFiles) {
    if (Test-Path $rf) {
        Copy-Item -Path $rf -Destination $stage -Force
    }
}

# 3. Clean Android project structure (strictly excluding .gradle, build, .cxx, .kotlin caches)
New-Item -ItemType Directory -Path "$stage/android" | Out-Null
Copy-Item -Path 'android/gradle' -Destination "$stage/android/gradle" -Recurse -Force
Copy-Item -Path 'android/build.gradle' -Destination "$stage/android/" -Force
Copy-Item -Path 'android/gradle.properties' -Destination "$stage/android/" -Force
Copy-Item -Path 'android/gradlew' -Destination "$stage/android/" -Force
Copy-Item -Path 'android/gradlew.bat' -Destination "$stage/android/" -Force
Copy-Item -Path 'android/settings.gradle' -Destination "$stage/android/" -Force
if (Test-Path 'android/.gitignore') { 
    Copy-Item -Path 'android/.gitignore' -Destination "$stage/android/" -Force 
}

New-Item -ItemType Directory -Path "$stage/android/app" | Out-Null
Copy-Item -Path 'android/app/src' -Destination "$stage/android/app/src" -Recurse -Force
Copy-Item -Path 'android/app/build.gradle' -Destination "$stage/android/app/" -Force
Copy-Item -Path 'android/app/proguard-rules.pro' -Destination "$stage/android/app/" -Force
Copy-Item -Path 'android/app/debug.keystore' -Destination "$stage/android/app/" -Force

# 4. Strict check: ensure no blacklisted directories/files exist in staging
$forbidden = Get-ChildItem -Path $stage -Recurse -Force | Where-Object {
    $_.FullName -match '\\(\.git|node_modules|\.expo|dist|\.gradle|build|\.cxx|\.kotlin)($|\\)' -or
    ($_.Name -match '^\.env' -and $_.Name -ne '.env.example')
}
if ($forbidden) {
    Write-Error "Error: Staging contains forbidden items: $($forbidden.FullName -join ', ')"
    exit 1
}

# 5. Create the clean ZIP archive
$zipName = 'Aegis_Team_Source_Clean.zip'
if (Test-Path $zipName) { 
    Remove-Item -Force $zipName 
}

Compress-Archive -Path "$stage/*" -DestinationPath $zipName -CompressionLevel Optimal

# 6. Clean up temporary staging
Remove-Item -Recurse -Force $stage

$fileInfo = Get-Item $zipName
$sizeMb = [math]::Round($fileInfo.Length / 1MB, 2)
Write-Output "SUCCESS: Created $zipName ($sizeMb MB, $($fileInfo.Length) bytes)"
