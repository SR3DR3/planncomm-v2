@echo off
echo ====================================
echo PlannComm v2 - Starting Demo
echo ====================================
echo.
echo Starting backend server...
start cmd /k "cd planncomm-backend && npm run dev"
echo.
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul
echo.
echo Starting frontend application...
start cmd /k "cd planncomm-frontend && npm start"
echo.
echo ====================================
echo Demo is starting!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo The browser will open automatically.
echo ====================================
echo.
echo Press any key to exit this window...
pause >nul
