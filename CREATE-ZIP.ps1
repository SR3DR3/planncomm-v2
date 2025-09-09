# PowerShell script to create a clean zip file for demo

Write-Host "Creating PlannComm-Demo.zip..." -ForegroundColor Green

# Create a temporary folder
$tempFolder = "PlannComm-Demo-Temp"
if (Test-Path $tempFolder) {
    Remove-Item $tempFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $tempFolder | Out-Null

# Copy files excluding node_modules and build folders
Write-Host "Copying files (excluding node_modules)..." -ForegroundColor Yellow

# Copy backend
Copy-Item -Path "planncomm-backend" -Destination "$tempFolder\planncomm-backend" -Recurse -Exclude "node_modules", "dist", ".env"

# Copy frontend  
Copy-Item -Path "planncomm-frontend" -Destination "$tempFolder\planncomm-frontend" -Recurse -Exclude "node_modules", "build", ".env"

# Copy documentation and scripts
Copy-Item "README-DEMO.md" "$tempFolder\"
Copy-Item "START-DEMO.bat" "$tempFolder\"
Copy-Item "requirements.md" "$tempFolder\" -ErrorAction SilentlyContinue
Copy-Item "accounting-planning-software-spec.md" "$tempFolder\" -ErrorAction SilentlyContinue

# Create the zip file
Write-Host "Creating zip file..." -ForegroundColor Yellow
Compress-Archive -Path "$tempFolder\*" -DestinationPath "PlannComm-Demo.zip" -Force

# Clean up temp folder
Remove-Item $tempFolder -Recurse -Force

# Get file size
$zipSize = (Get-Item "PlannComm-Demo.zip").Length / 1MB
Write-Host "`nSuccess! PlannComm-Demo.zip created" -ForegroundColor Green
Write-Host "Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
Write-Host "`nThe zip file includes:" -ForegroundColor White
Write-Host "- All source code"
Write-Host "- Database with 382 tasks" 
Write-Host "- Setup instructions (README-DEMO.md)"
Write-Host "- One-click starter (START-DEMO.bat)"
Write-Host "`nTransfer this file to your laptop and extract it!" -ForegroundColor Green
