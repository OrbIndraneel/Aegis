$stage = 'temp_export'
if (Test-Path $stage) {
    Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $stage | Out-Null

$itemsToCopy = @(
    'app',
    'src',
    'assets',
    'scripts',
    'package.json',
    'package-lock.json',
    'app.json',
    'tsconfig.json',
    'metro.config.js',
    'eslint.config.js',
    'AEGIS_v1.0.0_Release.apk',
    'stitch_ui_prompt.txt',
    'README.md',
    'LICENSE',
    'AGENTS.md'
)

foreach ($item in $itemsToCopy) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $stage -Recurse -Force
    }
}

# Copy android source files cleanly without build/cache binaries
$androidFiles = Get-ChildItem -Path 'android' -Exclude '.gradle', 'build', '.kotlin', '.cxx'
New-Item -ItemType Directory -Path "$stage/android" -Force | Out-Null
foreach ($file in $androidFiles) {
    if ($file.Name -ne '.gradle' -and $file.Name -ne 'build' -and $file.Name -ne '.kotlin' -and $file.Name -ne '.cxx') {
        Copy-Item -Path $file.FullName -Destination "$stage/android" -Recurse -Force
    }
}

# Remove app/build inside staging if present
if (Test-Path "$stage/android/app/build") {
    Remove-Item -Recurse -Force "$stage/android/app/build" -ErrorAction SilentlyContinue
}

$zipPath = 'AEGIS_Project_Clean.zip'
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath -ErrorAction SilentlyContinue
}

Compress-Archive -Path "$stage/*" -DestinationPath $zipPath -Force
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue

Write-Host "Created $zipPath successfully!"
