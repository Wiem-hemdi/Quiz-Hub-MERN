@echo off
echo ========================================
echo 🧹 NETTOYAGE COMPLET - QUIZ HUB
echo ========================================
echo.

echo 1. Arrêt d'Ollama...
taskkill /IM ollama.exe /F 2>nul
timeout /t 2

echo 2. Arrêt de Node.js...
taskkill /IM node.exe /F 2>nul
timeout /t 2

echo 3. Vérification ports...
echo Port 11434 (Ollama):
netstat -ano | findstr :11434
echo.
echo Port 5000 (Backend):
netstat -ano | findstr :5000

echo.
echo ✅ Nettoyage terminé!
echo Appuyez sur une touche pour démarrer...
pause