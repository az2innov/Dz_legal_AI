@echo off
REM Script pour tuer le processus backend sur le port 3001
REM Usage: Double-cliquer sur ce fichier ou executer "kill-backend.bat"

echo.
echo ========================================
echo  Killing Backend Process (Port 3001)
echo ========================================
echo.

REM Trouver le PID du processus sur le port 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    set PID=%%a
    goto :found
)

:notfound
echo [!] Aucun processus trouve sur le port 3001
echo [i] Le port est libre, vous pouvez demarrer le backend
pause
exit /b 0

:found
echo [+] Processus trouve : PID %PID%
echo [*] Arret du processus...
taskkill /PID %PID% /F

if %ERRORLEVEL% EQU 0 (
    echo [✓] Processus arrete avec succes !
    echo [i] Vous pouvez maintenant redemarrer le backend
) else (
    echo [!] Erreur lors de l'arret du processus
)

echo.
pause
