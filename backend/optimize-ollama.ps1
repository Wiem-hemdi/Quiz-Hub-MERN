# optimize-ollama.ps1
Write-Host "⚡ Optimisation d'Ollama pour l'assistant intelligent..." -ForegroundColor Cyan

# Arrêter Ollama s'il est en cours
Write-Host "1. Arrêt d'Ollama..." -ForegroundColor Yellow
ollama stop
Start-Sleep -Seconds 2

# Démarrer avec plus de mémoire
Write-Host "2. Démarrage optimisé..." -ForegroundColor Yellow
Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
Start-Sleep -Seconds 5

# Tester avec une question complexe
Write-Host "3. Test d'une question complexe..." -ForegroundColor Yellow

$testQuestion = @{
    model = "gemma2:2b"
    prompt = "You are an expert driving instructor. A student asks: 'When approaching a roundabout, what should I do if there are cars already in it?' Explain in detail with steps."
    stream = $false
    options = @{
        temperature = 0.7
        num_predict = 300
        top_p = 0.9
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
        -Method Post -Body $testQuestion -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "✅ Test réussi!" -ForegroundColor Green
    Write-Host "📝 Réponse (${$response.response.Length} caractères):" -ForegroundColor White
    Write-Host $response.response.substring(0, 200) -ForegroundColor Gray
    Write-Host "..." -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Configuration recommandée:" -ForegroundColor Cyan
Write-Host "   • Modèle: gemma2:2b" -ForegroundColor White
Write-Host "   • Température: 0.7 (créatif)" -ForegroundColor White
Write-Host "   • Longueur max: 400 tokens" -ForegroundColor White
Write-Host "   • Timeout: 30 secondes" -ForegroundColor White

Write-Host "`n🚀 Prêt pour l'assistant IA intelligent!" -ForegroundColor Green