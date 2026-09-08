$ErrorActionPreference = "Stop"
if (-not $env:CLOUDBASE_ENV_ID) { throw "请先设置 CLOUDBASE_ENV_ID" }
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $root
node deployment/release-check.mjs
if (-not (Get-Command tcb -ErrorAction SilentlyContinue)) { throw "请先执行 npm i -g @cloudbase/cli" }
Set-Location (Join-Path $root "web")
tcb hosting deploy . -e $env:CLOUDBASE_ENV_ID --safe --verify
Pop-Location
