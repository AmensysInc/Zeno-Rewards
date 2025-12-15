# Bootstrap script to create initial admin login only.
# 
# Admin:
#   Email: rama.k@amensys.com
#   Password: Temp12345
#
# After this, log in as Admin and create organizations and businesses from the UI.

Write-Host "Creating initial admin account..." -ForegroundColor Cyan
Write-Host ""

try {
    $body = @{
        email = "rama.k@amensys.com"
        password = "Temp12345"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8000/admin/create" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Admin created! ID: $($response.id)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "Admin already exists with this email" -ForegroundColor Yellow
    } else {
        Write-Host "Error creating admin: Status $statusCode" -ForegroundColor Red
        Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ADMIN LOGIN CREDENTIALS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "ADMIN:" -ForegroundColor Cyan
Write-Host "  Email: rama.k@amensys.com" -ForegroundColor White
Write-Host "  Password: Temp12345" -ForegroundColor White
Write-Host ""
Write-Host "Login at: http://localhost:3000 (Role: Admin)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""


