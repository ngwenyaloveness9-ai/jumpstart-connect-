@echo off
setlocal EnableExtensions EnableDelayedExpansion

title JumpStart Your Career - Deployment Setup

echo.
echo ============================================================
echo          JUMPSTART YOUR CAREER PLATFORM
echo                 DEPLOYMENT SETUP
echo ============================================================
echo.
echo IMPORTANT:
echo This installer will NOT:
echo   - Delete users
echo   - Delete the database
echo   - Flush the database
echo   - Create a new Superadmin
echo   - Reset existing accounts
echo.
echo Existing organisational data will be preserved.
echo.
pause

REM ============================================================
REM PROJECT DIRECTORY
REM ============================================================

set "PROJECT_DIR=%~dp0"
set "BACKEND_DIR=%PROJECT_DIR%backend"
set "FRONTEND_DIR=%PROJECT_DIR%frontend"

echo.
echo Project directory:
echo %PROJECT_DIR%
echo.

REM ============================================================
REM 1. CHECK PYTHON
REM ============================================================

echo ============================================================
echo [1/10] Checking Python...
echo ============================================================

python --version >nul 2>&1

if errorlevel 1 (
    echo.
    echo ERROR: Python was not found.
    echo.
    echo Please install Python 3.14 or a compatible Python version.
    echo Make sure Python is added to PATH.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%A in ('python --version 2^>^&1') do set "PYTHON_VERSION=%%A"

echo !PYTHON_VERSION!
echo Python detected successfully.

REM ============================================================
REM 2. CHECK NODE.JS
REM ============================================================

echo.
echo ============================================================
echo [2/10] Checking Node.js...
echo ============================================================

node --version >nul 2>&1

if errorlevel 1 (
    echo.
    echo ERROR: Node.js was not found.
    echo.
    echo Please install Node.js LTS and make sure it is in PATH.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%A in ('node --version') do set "NODE_VERSION=%%A"

echo Node.js: !NODE_VERSION!

npm --version >nul 2>&1

if errorlevel 1 (
    echo.
    echo ERROR: npm was not found.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%A in ('npm --version') do set "NPM_VERSION=%%A"

echo npm: !NPM_VERSION!
echo Node.js and npm detected successfully.

REM ============================================================
REM 3. CHECK POSTGRESQL
REM ============================================================

echo.
echo ============================================================
echo [3/10] Checking PostgreSQL...
echo ============================================================

where psql >nul 2>&1

if errorlevel 1 (
    echo.
    echo WARNING: PostgreSQL command-line tool "psql" was not found.
    echo.
    echo PostgreSQL may still be installed, but psql is not in PATH.
    echo.
    echo The Django database connection will be tested later.
    echo.
) else (
    echo PostgreSQL client detected.
    psql --version
)

REM ============================================================
REM 4. CHECK BACKEND
REM ============================================================

echo.
echo ============================================================
echo [4/10] Checking Django backend...
echo ============================================================

if not exist "%BACKEND_DIR%" (
    echo.
    echo ERROR: Backend directory was not found.
    echo Expected:
    echo %BACKEND_DIR%
    echo.
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%\manage.py" (
    echo.
    echo ERROR: manage.py was not found.
    echo Expected:
    echo %BACKEND_DIR%\manage.py
    echo.
    pause
    exit /b 1
)

if not exist "%BACKEND_DIR%\requirements.txt" (
    echo.
    echo ERROR: requirements.txt was not found.
    echo Expected:
    echo %BACKEND_DIR%\requirements.txt
    echo.
    pause
    exit /b 1
)

echo Django backend found.

REM ============================================================
REM 5. CHECK ENVIRONMENT FILE
REM ============================================================

echo.
echo ============================================================
echo [5/10] Checking environment configuration...
echo ============================================================

if not exist "%BACKEND_DIR%\.env" (
    echo.
    echo ERROR: backend\.env was not found.
    echo.
    echo Create:
    echo %BACKEND_DIR%\.env
    echo.
    echo Add the production database and application settings.
    echo.
    echo The installer will NOT create a database password
    echo or overwrite your production configuration.
    echo.
    pause
    exit /b 1
)

echo .env found.
echo Existing environment configuration will be preserved.

REM ============================================================
REM 6. CREATE / ACTIVATE VIRTUAL ENVIRONMENT
REM ============================================================

echo.
echo ============================================================
echo [6/10] Preparing Python virtual environment...
echo ============================================================

cd /d "%BACKEND_DIR%"

if not exist "venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv venv

    if errorlevel 1 (
        echo.
        echo ERROR: Failed to create Python virtual environment.
        echo.
        pause
        exit /b 1
    )

    echo Virtual environment created.
) else (
    echo Existing virtual environment detected.
    echo It will be reused.
)

call "venv\Scripts\activate.bat"

if errorlevel 1 (
    echo.
    echo ERROR: Could not activate virtual environment.
    echo.
    pause
    exit /b 1
)

echo Virtual environment activated.

REM ============================================================
REM 7. INSTALL BACKEND DEPENDENCIES
REM ============================================================

echo.
echo ============================================================
echo [7/10] Checking backend dependencies...
echo ============================================================

python -m pip install --upgrade pip

if errorlevel 1 (
    echo.
    echo ERROR: Failed to upgrade pip.
    echo.
    pause
    exit /b 1
)

pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo ERROR: Backend dependency installation failed.
    echo.
    pause
    exit /b 1
)

echo Backend dependencies are ready.

REM ============================================================
REM 8. TEST DJANGO + DATABASE + MIGRATIONS
REM ============================================================

echo.
echo ============================================================
echo [8/10] Testing Django and database connection...
echo ============================================================

python manage.py check

if errorlevel 1 (
    echo.
    echo ERROR: Django system check failed.
    echo.
    pause
    exit /b 1
)

echo Django system check passed.

echo.
echo Testing database connection and applying migrations...
echo.

python manage.py migrate

if errorlevel 1 (
    echo.
    echo ========================================================
    echo ERROR: Database migration failed.
    echo ========================================================
    echo.
    echo Check:
    echo   - PostgreSQL is running
    echo   - Database exists
    echo   - Database username is correct
    echo   - Database password is correct
    echo   - DB_HOST is correct
    echo   - DB_PORT is correct
    echo.
    echo NO DATA WAS INTENTIONALLY DELETED BY THIS SCRIPT.
    echo.
    pause
    exit /b 1
)

echo.
echo Database connection successful.
echo Migrations completed successfully.

REM ============================================================
REM 9. INSTALL FRONTEND DEPENDENCIES + BUILD
REM ============================================================

echo.
echo ============================================================
echo [9/10] Preparing React frontend...
echo ============================================================

if not exist "%FRONTEND_DIR%" (
    echo.
    echo ERROR: Frontend directory was not found.
    echo Expected:
    echo %FRONTEND_DIR%
    echo.
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
    echo.
    echo ERROR: frontend\package.json was not found.
    echo.
    pause
    exit /b 1
)

cd /d "%FRONTEND_DIR%"

if exist "package-lock.json" (
    echo package-lock.json found.
    echo Installing frontend dependencies with npm ci...
    call npm ci
) else (
    echo package-lock.json not found.
    echo Installing frontend dependencies with npm install...
    call npm install
)

if errorlevel 1 (
    echo.
    echo ERROR: Frontend dependency installation failed.
    echo.
    pause
    exit /b 1
)

echo Frontend dependencies installed.

echo.
echo Building React frontend...

call npm run build

if errorlevel 1 (
    echo.
    echo ERROR: Frontend build failed.
    echo.
    pause
    exit /b 1
)

echo Frontend build completed successfully.

REM ============================================================
REM 10. START PLATFORM
REM ============================================================

echo.
echo ============================================================
echo [10/10] Starting JumpStart Platform...
echo ============================================================

echo.
echo Starting Django backend...

cd /d "%BACKEND_DIR%"

start "JumpStart Backend" cmd /k ^
"cd /d "%BACKEND_DIR%" && call venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"

timeout /t 5 /nobreak >nul

echo Backend started.

echo.
echo Starting React frontend...

cd /d "%FRONTEND_DIR%"

start "JumpStart Frontend" cmd /k ^
"cd /d "%FRONTEND_DIR%" && npm run dev -- --host 0.0.0.0"

timeout /t 5 /nobreak >nul

echo Frontend started.

REM ============================================================
REM OPEN BROWSER
REM ============================================================

echo.
echo Opening JumpStart Platform...

start "" "http://localhost:5173/"

REM ============================================================
REM COMPLETE
REM ============================================================

echo.
echo ============================================================
echo          JUMPSTART PLATFORM IS RUNNING
echo ============================================================
echo.
echo Backend:
echo http://127.0.0.1:8000/
echo.
echo Frontend:
echo http://localhost:5173/
echo.
echo ============================================================
echo.
echo Existing users and database data were preserved.
echo No Superadmin was created.
echo No database cleaning was performed.
echo.
echo Superadmin -> HR -> Employee onboarding hierarchy
echo remains managed by your existing application.
echo.
echo ============================================================
echo.

pause
endlocal