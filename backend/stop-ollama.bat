@echo off
echo ========================================
echo    🛑 ARRÊT OLLAMA - CLEANUP
echo ========================================
echo.

echo 1. Arrêt des processus Ollama...
taskkill /IM ollama.exe /F 2>nul
if %errorlevel% equ 0 (
    echo ✅ Ollama arrêté
) else (
    echo ℹ️ Aucun processus Ollama trouvé
)

echo.
echo 2. Vérification du port 11434...
netstat -ano | findstr :11434 >nul
if %errorlevel% equ 0 (
    echo ❌ Le port 11434 est encore utilisé
    echo   Exécutez en tant qu'Administrateur!
) else (
    echo ✅ Port 11434 libre
)

echo.
echo 3. Redémarrage possible d'Ollama...
echo   Pour démarrer: ollama serve
echo   Pour tester: curl http://localhost:11434/api/tags
echo.
pause