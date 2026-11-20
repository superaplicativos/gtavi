# Valida o front matter de todos os posts. Uso: powershell -File scripts/validar-posts.ps1
# Sai com código 1 se houver erro (use antes de cada commit).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$cats = @()
Get-Content (Join-Path $root "_data/categories.yml") -Encoding UTF8 | ForEach-Object { if ($_ -match '^([a-z0-9-]+):\s*$') { $cats += $Matches[1] } }
$now = Get-Date
$errors = 0
Get-ChildItem (Join-Path $root "_posts") -Filter *.md | ForEach-Object {
  $f = $_; $txt = Get-Content $f.FullName -Raw -Encoding UTF8
  $bad = @()
  if ($f.Name -notmatch '^(\d{4}-\d{2}-\d{2})-[a-z0-9-]+\.md$') { $bad += "nome do arquivo fora do padrão AAAA-MM-DD-slug.md" }
  $fileDate = $f.Name.Substring(0,10)
  if ($txt -notmatch '(?s)^---\r?\n(.*?)\r?\n---') { $bad += "sem front matter"; } else {
    $fm = $Matches[1]
    foreach ($k in "title","date","categoria","description","tags","fontes") { if ($fm -notmatch "(?m)^$k\s*:") { $bad += "falta '$k'" } }
    if ($fm -match '(?m)^categoria:\s*"?([a-z0-9-]+)"?') { if ($cats -notcontains $Matches[1]) { $bad += "categoria '$($Matches[1])' não existe em _data/categories.yml" } }
    if ($fm -match '(?m)^categoria:\s*"?gta-vii"?' -and $fm -notmatch '(?m)^especulacao:\s*true') { $bad += "posts gta-vii precisam de especulacao: true" }
    if ($fm -notmatch '(?m)^cover_text:' -and $fm -notmatch '(?m)^cover:' -and $fm -notmatch '(?m)^youtube:') { $bad += "falta cover_text (ou cover/youtube)" }
    if ($fm -match '(?m)^date:\s*(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(:\d{2})?)\s*([+-]\d{4})?') {
      if ($Matches[1] -ne $fileDate) { $bad += "date ($($Matches[1])) diferente da data do arquivo ($fileDate)" }
      if (-not $Matches[4]) { $bad += "date sem fuso (use -0300)" }
      try { $dt = [datetimeoffset]::ParseExact("$($Matches[1]) $($Matches[2]) $($Matches[4])".Trim(), @("yyyy-MM-dd HH:mm:ss zzz","yyyy-MM-dd HH:mm zzz"), $null, 0)
        if ($dt -gt [datetimeoffset]::Now) { $bad += "date no futuro: o Jekyll não vai publicar ainda" } } catch {}
    } else { $bad += "date em formato inválido (use 2026-11-21 09:00:00 -0300)" }
    foreach ($line in ($fm -split "`n")) { if ($line -match '^(title|description):\s*"(.*)"\s*$' -and $Matches[2] -match '(?<!\\)"') { $bad += "aspas duplas soltas em $($Matches[1])" } }
  }
  if ($bad.Count) { $errors += $bad.Count; Write-Host "ERRO  $($f.Name)" -ForegroundColor Red; $bad | ForEach-Object { Write-Host "      - $_" } }
  else { Write-Host "ok    $($f.Name)" -ForegroundColor Green }
}
if ($errors) { Write-Host "`n$errors problema(s) encontrado(s)." -ForegroundColor Red; exit 1 } else { Write-Host "`nTudo certo." -ForegroundColor Green }
