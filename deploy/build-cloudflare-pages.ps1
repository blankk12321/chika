$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$distRoot = Join-Path $projectRoot "dist"
$outputDir = Join-Path $distRoot "cloudflare-pages"

$resolvedProjectRoot = (Resolve-Path $projectRoot).Path
if (Test-Path $outputDir) {
  $resolvedOutputDir = (Resolve-Path $outputDir).Path
  if (-not $resolvedOutputDir.StartsWith($resolvedProjectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to clean output outside project root: $resolvedOutputDir"
  }
  Remove-Item -LiteralPath $outputDir -Recurse -Force
}

New-Item -ItemType Directory -Path $outputDir | Out-Null

$files = @(
  "index.html",
  "script.js",
  "styles.css"
)

foreach ($file in $files) {
  Copy-Item -LiteralPath (Join-Path $projectRoot $file) -Destination (Join-Path $outputDir $file)
}

$assetsSource = Join-Path $projectRoot "assets\site"
$assetsDestination = Join-Path $outputDir "assets\site"
New-Item -ItemType Directory -Path (Split-Path -Parent $assetsDestination) | Out-Null
Copy-Item -LiteralPath $assetsSource -Destination $assetsDestination -Recurse

@"
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  X-Frame-Options: DENY

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
"@ | Set-Content -LiteralPath (Join-Path $outputDir "_headers") -Encoding UTF8

@"
/index.html  /  301
"@ | Set-Content -LiteralPath (Join-Path $outputDir "_redirects") -Encoding UTF8

Write-Host "Cloudflare Pages static export created at $outputDir"
