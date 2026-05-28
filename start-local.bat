@echo off
echo Starting DD Computer - Local Development
echo ========================================
echo.
echo 1. Starting MySQL (Docker)...
docker-compose up -d mysql
echo.
echo 2. Waiting for MySQL to be ready...
timeout /t 10 /nobreak
echo.
echo 3. Starting Backend (Local)...
cd backend
set DB_HOST=localhost
cmd /c npm run start
cd ..
