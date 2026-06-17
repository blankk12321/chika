$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $projectRoot "dist"
$packageDir = Join-Path $distDir "act-site"
$zipPath = Join-Path $distDir "act-site.zip"

if (Test-Path $packageDir) {
  Remove-Item -LiteralPath $packageDir -Recurse -Force
}

New-Item -ItemType Directory -Path $packageDir | Out-Null

$items = @(
  "index.html",
  "package.json",
  "script.js",
  "server.js",
  "styles.css"
)

foreach ($item in $items) {
  $source = Join-Path $projectRoot $item
  $destination = Join-Path $packageDir $item
  if (Test-Path $source -PathType Container) {
    Copy-Item -LiteralPath $source -Destination $destination -Recurse
  } else {
    Copy-Item -LiteralPath $source -Destination $destination
  }
}

$siteAssetsSource = Join-Path $projectRoot "assets\site"
$siteAssetsDestination = Join-Path $packageDir "assets\site"
New-Item -ItemType Directory -Path (Split-Path -Parent $siteAssetsDestination) | Out-Null
Copy-Item -LiteralPath $siteAssetsSource -Destination $siteAssetsDestination -Recurse

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $packageDir "*") -DestinationPath $zipPath -Force
Write-Host "Created $zipPath"
