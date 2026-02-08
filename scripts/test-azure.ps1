# Test Azure Deployment
# Usage: .\scripts\test-azure.ps1 -WebAppName "your-app-name"

param(
    [Parameter(Mandatory=$true)]
    [string]$WebAppName
)

$baseUrl = "https://$WebAppName.azurewebsites.net"

Write-Host "🧪 Testing Azure Deployment: $baseUrl" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1️⃣ Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Health check passed: $($response.Content)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Create Match
Write-Host "`n2️⃣ Testing create match..." -ForegroundColor Yellow
try {
    $body = @{
        parkId = "central-park"
        teamSize = 4
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$baseUrl/api/matches" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body `
        -UseBasicParsing

    $match = $response.Content | ConvertFrom-Json
    $matchId = $match.id
    $matchCode = $match.code

    Write-Host "   ✅ Match created!" -ForegroundColor Green
    Write-Host "      Match ID: $matchId" -ForegroundColor Gray
    Write-Host "      Match Code: $matchCode" -ForegroundColor Cyan
    Write-Host "      Status: $($match.status)" -ForegroundColor Gray
    Write-Host "      Zones: $($match.zones.Count)" -ForegroundColor Gray

    # Test 3: Join Match
    Write-Host "`n3️⃣ Testing join by code..." -ForegroundColor Yellow
    $joinBody = @{
        code = $matchCode
        displayName = "TestPlayer"
        teamId = "blue"
    } | ConvertTo-Json

    $joinResponse = Invoke-WebRequest `
        -Uri "$baseUrl/api/matches/join-by-code" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $joinBody `
        -UseBasicParsing

    $joinResult = $joinResponse.Content | ConvertFrom-Json
    Write-Host "   ✅ Player joined!" -ForegroundColor Green
    Write-Host "      Player: $($joinResult.player.displayName)" -ForegroundColor Gray
    Write-Host "      Team: $($joinResult.player.teamId)" -ForegroundColor Gray
    Write-Host "      Players in match: $($joinResult.match.players.Count)" -ForegroundColor Gray

    # Test 4: Get Match
    Write-Host "`n4️⃣ Testing get match..." -ForegroundColor Yellow
    $getResponse = Invoke-WebRequest `
        -Uri "$baseUrl/api/matches/$matchId" `
        -UseBasicParsing

    if ($getResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Get match passed!" -ForegroundColor Green
    }

    # Test 5: Start Match
    Write-Host "`n5️⃣ Testing start match..." -ForegroundColor Yellow
    $startResponse = Invoke-WebRequest `
        -Uri "$baseUrl/api/matches/$matchId/start" `
        -Method POST `
        -Headers @{"x-user-id"="test-user"} `
        -UseBasicParsing

    $startedMatch = $startResponse.Content | ConvertFrom-Json
    Write-Host "   ✅ Match started!" -ForegroundColor Green
    Write-Host "      Status: $($startedMatch.status)" -ForegroundColor Gray

    # Test 6: Capture Zone
    Write-Host "`n6️⃣ Testing capture zone..." -ForegroundColor Yellow
    $captureBody = @{
        zoneId = "zone-a"
    } | ConvertTo-Json

    $captureResponse = Invoke-WebRequest `
        -Uri "$baseUrl/api/matches/$matchId/capture-zone" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"; "x-user-id"="test-user"} `
        -Body $captureBody `
        -UseBasicParsing

    $capturedMatch = $captureResponse.Content | ConvertFrom-Json
    Write-Host "   ✅ Zone captured!" -ForegroundColor Green
    Write-Host "      Zone owner: $($capturedMatch.zones[0].ownerTeamId)" -ForegroundColor Gray
    Write-Host "      Score - Blue: $($capturedMatch.scores.blue), Red: $($capturedMatch.scores.red)" -ForegroundColor Gray

    Write-Host "`n🎉 All tests passed!" -ForegroundColor Green
    Write-Host "`n📋 Summary:" -ForegroundColor Cyan
    Write-Host "   ✅ Health check working" -ForegroundColor White
    Write-Host "   ✅ Match creation working" -ForegroundColor White
    Write-Host "   ✅ Join by code working" -ForegroundColor White
    Write-Host "   ✅ Get match working" -ForegroundColor White
    Write-Host "   ✅ Start match working" -ForegroundColor White
    Write-Host "   ✅ Zone capture working" -ForegroundColor White
    Write-Host "`n🚀 Your Azure deployment is fully functional!" -ForegroundColor Green

} catch {
    Write-Host "   ❌ Test failed: $_" -ForegroundColor Red
    Write-Host "`nDebug Info:" -ForegroundColor Yellow
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    exit 1
}
