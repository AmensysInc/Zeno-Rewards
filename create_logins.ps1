# Script to create organizations and business logins

Write-Host "Creating user accounts..." -ForegroundColor Cyan
Write-Host ""

# Create Organization 1
Write-Host "Creating Organization 1 (Org1@gmail.com)..." -ForegroundColor Yellow
try {
    $body = @{
        name = "Org1"
        email = "Org1@gmail.com"
        password = "Temp12345"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/organizations/create?name=Org1&email=Org1@gmail.com&password=Temp12345" -Method Post -ContentType "application/json"
    Write-Host "✓ Organization 1 created! ID: $($response.id)" -ForegroundColor Green
    $org1Id = $response.id
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "Organization 1 already exists" -ForegroundColor Yellow
    } else {
        Write-Host "Error creating Org1: Status $statusCode" -ForegroundColor Red
        Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Create Organization 2
Write-Host "Creating Organization 2 (Org2@gmail.com)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/organizations/create?name=Org2&email=Org2@gmail.com&password=Temp12345" -Method Post -ContentType "application/json"
    Write-Host "✓ Organization 2 created! ID: $($response.id)" -ForegroundColor Green
    $org2Id = $response.id
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "Organization 2 already exists" -ForegroundColor Yellow
    } else {
        Write-Host "Error creating Org2: Status $statusCode" -ForegroundColor Red
        Write-Host "Details: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Login as Organization 1 to create business
Write-Host "Logging in as Organization 1..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "Org1@gmail.com"
        password = "Temp12345"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/login-org" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    $org1Id = $loginResponse.org_id
    Write-Host "✓ Logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "Error logging in: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Create Business
Write-Host "Creating Business (bus1@gmail.com)..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8000/organizations/business/create?name=Business1&email=bus1@gmail.com&password=Temp12345" -Method Post -Headers $headers -ContentType "application/json"
    Write-Host "✓ Business created! ID: $($response.id)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "Business already exists" -ForegroundColor Yellow
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  LOGIN CREDENTIALS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "ORGANIZATION 1:" -ForegroundColor Cyan
Write-Host "  Email: Org1@gmail.com" -ForegroundColor White
Write-Host "  Password: Temp12345" -ForegroundColor White
Write-Host ""
Write-Host "ORGANIZATION 2:" -ForegroundColor Cyan
Write-Host "  Email: Org2@gmail.com" -ForegroundColor White
Write-Host "  Password: Temp12345" -ForegroundColor White
Write-Host ""
Write-Host "BUSINESS:" -ForegroundColor Cyan
Write-Host "  Email: bus1@gmail.com" -ForegroundColor White
Write-Host "  Password: Temp12345" -ForegroundColor White
Write-Host ""
Write-Host "Login at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green

