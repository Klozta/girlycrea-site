# Port Forwarding WSL2 -> Windows
# À exécuter sur Windows PowerShell en tant qu'Administrateur

Write-Host "🔧 Configuration du port forwarding WSL2..." -ForegroundColor Cyan

# Récupérer l'IP WSL2
$wslIP = (wsl hostname -I).Trim()
Write-Host "IP WSL2 détectée: $wslIP" -ForegroundColor Green

# Supprimer les anciens port forwards (si existants)
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0 2>$null
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0 2>$null

# Ajouter les nouveaux port forwards
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIP
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIP

# Récupérer l'IP Windows sur le réseau local
$windowsIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "✅ Ports forwardés avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 URLs à partager:" -ForegroundColor Yellow
if ($windowsIP) {
    Write-Host "   Frontend: http://$windowsIP:3000" -ForegroundColor White
    Write-Host "   Backend:  http://$windowsIP:3001" -ForegroundColor White
} else {
    Write-Host "   Frontend: http://localhost:3000 (depuis Windows)" -ForegroundColor White
    Write-Host "   Backend:  http://localhost:3001 (depuis Windows)" -ForegroundColor White
    Write-Host ""
    Write-Host "   Pour trouver votre IP Windows:" -ForegroundColor Gray
    Write-Host "   ipconfig | findstr IPv4" -ForegroundColor Gray
}
Write-Host ""
Write-Host "⚠️  Pour annuler le port forwarding:" -ForegroundColor Yellow
Write-Host "   netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0" -ForegroundColor Gray
Write-Host "   netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0" -ForegroundColor Gray



