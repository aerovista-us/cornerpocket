# PowerShell script to move files to recycling instead of deleting
# Usage: .\recycle-file.ps1 "path/to/file.ext"

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

if (-not (Test-Path $FilePath)) {
    Write-Host "Error: File not found: $FilePath" -ForegroundColor Red
    exit 1
}

# Determine the type of file based on extension
$extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
$fileName = [System.IO.Path]::GetFileName($FilePath)

switch ($extension) {
    ".mp3" { $recyclePath = "recycling/audio/$fileName" }
    ".mp4" { $recyclePath = "recycling/video/$fileName" }
    ".png" { $recyclePath = "recycling/images/$fileName" }
    ".jpg" { $recyclePath = "recycling/images/$fileName" }
    ".jpeg" { $recyclePath = "recycling/images/$fileName" }
    ".gif" { $recyclePath = "recycling/images/$fileName" }
    ".svg" { $recyclePath = "recycling/images/$fileName" }
    ".html" { $recyclePath = "recycling/docs/$fileName" }
    ".md" { $recyclePath = "recycling/docs/$fileName" }
    default { $recyclePath = "recycling/other/$fileName" }
}

# Create recycling subdirectory if it doesn't exist
$recycleDir = [System.IO.Path]::GetDirectoryName($recyclePath)
if (-not (Test-Path $recycleDir)) {
    New-Item -ItemType Directory -Path $recycleDir -Force | Out-Null
    Write-Host "Created directory: $recycleDir" -ForegroundColor Green
}

# Move the file using git mv (preserves history)
Write-Host "Moving $FilePath to $recyclePath..." -ForegroundColor Yellow
git mv $FilePath $recyclePath

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ File moved to recycling successfully!" -ForegroundColor Green
    Write-Host "  Don't forget to commit: git commit -m 'Move $fileName to recycling'" -ForegroundColor Cyan
} else {
    Write-Host "Error: Failed to move file. Trying regular move..." -ForegroundColor Yellow
    Move-Item -Path $FilePath -Destination $recyclePath -Force
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ File moved (not tracked by git). Add it: git add $recyclePath" -ForegroundColor Green
    } else {
        Write-Host "Error: Failed to move file" -ForegroundColor Red
        exit 1
    }
}

