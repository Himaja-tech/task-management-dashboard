$root = Split-Path -Parent $PSScriptRoot
$server = Join-Path $root "server"
$client = Join-Path $root "client"
$logs = Join-Path $root "logs"
$viteBin = Join-Path $client "node_modules\vite\bin\vite.js"

New-Item -ItemType Directory -Force -Path $logs | Out-Null

function Test-Api {
  try {
    Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Test-Frontend {
  try {
    Invoke-RestMethod -Uri "http://127.0.0.1:5173" -Method Get -TimeoutSec 2 -ErrorAction Stop | Out-Null
    return $true
  } catch {
    return $false
  }
}

if (-not (Test-Api)) {
  Start-Process -FilePath "node.exe" -ArgumentList @("server.js") -WorkingDirectory $server -RedirectStandardOutput (Join-Path $logs "server.log") -RedirectStandardError (Join-Path $logs "server.err.log") -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

if (Test-Api) {
  Write-Host "Backend ready:  http://127.0.0.1:5000/api"
} else {
  Write-Host "Backend did not start. Check logs/server.err.log"
}

if (Test-Frontend) {
  Write-Host "Frontend already running: http://127.0.0.1:5173"
  Write-Host "Refresh the browser and try again."
  Write-Host "Keep this terminal open so the backend stays running. Press Ctrl+C to stop."
  while ($true) {
    Start-Sleep -Seconds 3600
  }
}

Write-Host "Frontend:       http://127.0.0.1:5173"
& node.exe $viteBin --host 127.0.0.1 --port 5173 --strictPort
