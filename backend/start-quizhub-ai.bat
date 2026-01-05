@echo off
echo ========================================
echo    🚀 QUIZ HUB - DÉMARRAGE COMPLET
echo ========================================
echo.

echo Étape 1/4 : Nettoyage des processus...
taskkill /IM ollama.exe /F 2>nul
taskkill /IM node.exe /F 2>nul
timeout /t 3

echo Étape 2/4 : Démarrage d'Ollama...
echo ATTENTION : Gardez cette fenêtre ouverte!
start "Ollama Server" cmd /k "ollama serve"
timeout /t 10

echo Étape 3/4 : Vérification Ollama...
curl http://localhost:11434/api/tags
if %errorlevel% neq 0 (
    echo ❌ Ollama non démarré, tentative de correction...
    timeout /t 5
    curl http://localhost:11434/api/tags
)

echo.
echo Étape 4/4 : Démarrage Backend...
cd /d "C:\Users\Admin\Desktop\Quiz-Hub-MERN\backend"
start "Quiz Hub Backend" cmd /k "node server.js"
timeout /t 10

echo.
echo ========================================
echo ✅ SERVICES DÉMARRÉS
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 🤖 IA:       http://localhost:11434
echo.
echo Pour tester l'IA: http://localhost:5000/health
echo.
echo ========================================
echo Appuyez sur une touche pour ouvrir l'application...
pause
start http://localhost:3000