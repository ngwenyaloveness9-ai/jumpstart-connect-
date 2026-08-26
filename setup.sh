#!/bin/bash

set -e

echo
echo "============================================================"
echo "         JUMPSTART YOUR CAREER PLATFORM"
echo "                DEPLOYMENT SETUP"
echo "============================================================"
echo
echo "IMPORTANT:"
echo "This installer will NOT:"
echo "  - Delete users"
echo "  - Delete the database"
echo "  - Flush the database"
echo "  - Create a new Superadmin"
echo "  - Reset existing accounts"
echo
echo "Existing organisational data will be preserved."
echo
read -p "Press ENTER to continue..."
echo

# ============================================================
# PROJECT DIRECTORY
# ============================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "Project directory:"
echo "$PROJECT_DIR"
echo

# ============================================================
# 1. CHECK PYTHON
# ============================================================

echo "============================================================"
echo "[1/10] Checking Python..."
echo "============================================================"

if ! command -v python3 >/dev/null 2>&1; then
    echo
    echo "ERROR: Python 3 was not found."
    echo
    echo "Please install Python 3.14 or a compatible Python version."
    exit 1
fi

python3 --version

echo "Python detected successfully."

# ============================================================
# 2. CHECK NODE.JS
# ============================================================

echo
echo "============================================================"
echo "[2/10] Checking Node.js..."
echo "============================================================"

if ! command -v node >/dev/null 2>&1; then
    echo
    echo "ERROR: Node.js was not found."
    echo
    echo "Please install Node.js LTS."
    exit 1
fi

node --version

if ! command -v npm >/dev/null 2>&1; then
    echo
    echo "ERROR: npm was not found."
    exit 1
fi

npm --version

echo "Node.js and npm detected successfully."

# ============================================================
# 3. CHECK POSTGRESQL
# ============================================================

echo
echo "============================================================"
echo "[3/10] Checking PostgreSQL..."
echo "============================================================"

if command -v psql >/dev/null 2>&1; then
    echo "PostgreSQL client detected."
    psql --version
else
    echo
    echo "WARNING: PostgreSQL client 'psql' was not found in PATH."
    echo
    echo "The Django database connection will still be tested later."
    echo
fi

# ============================================================
# 4. CHECK BACKEND
# ============================================================

echo
echo "============================================================"
echo "[4/10] Checking Django backend..."
echo "============================================================"

if [ ! -d "$BACKEND_DIR" ]; then
    echo
    echo "ERROR: Backend directory was not found."
    echo "$BACKEND_DIR"
    exit 1
fi

if [ ! -f "$BACKEND_DIR/manage.py" ]; then
    echo
    echo "ERROR: manage.py was not found."
    echo "$BACKEND_DIR/manage.py"
    exit 1
fi

if [ ! -f "$BACKEND_DIR/requirements.txt" ]; then
    echo
    echo "ERROR: requirements.txt was not found."
    echo "$BACKEND_DIR/requirements.txt"
    exit 1
fi

echo "Django backend found."

# ============================================================
# 5. CHECK ENVIRONMENT FILE
# ============================================================

echo
echo "============================================================"
echo "[5/10] Checking environment configuration..."
echo "============================================================"

if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo
    echo "ERROR: backend/.env was not found."
    echo
    echo "Create:"
    echo "$BACKEND_DIR/.env"
    echo
    echo "Add the production database and application settings."
    echo
    echo "The installer will NOT create or overwrite production"
    echo "database credentials."
    echo
    exit 1
fi

echo ".env found."
echo "Existing environment configuration will be preserved."

# ============================================================
# 6. CREATE / ACTIVATE VIRTUAL ENVIRONMENT
# ============================================================

echo
echo "============================================================"
echo "[6/10] Preparing Python virtual environment..."
echo "============================================================"

cd "$BACKEND_DIR"

if [ ! -f "venv/bin/python" ]; then

    echo "Creating Python virtual environment..."

    python3 -m venv venv

    if [ $? -ne 0 ]; then
        echo
        echo "ERROR: Failed to create virtual environment."
        exit 1
    fi

    echo "Virtual environment created."

else

    echo "Existing virtual environment detected."
    echo "It will be reused."

fi

source venv/bin/activate

echo "Virtual environment activated."

# ============================================================
# 7. INSTALL BACKEND DEPENDENCIES
# ============================================================

echo
echo "============================================================"
echo "[7/10] Checking backend dependencies..."
echo "============================================================"

python -m pip install --upgrade pip

pip install -r requirements.txt

echo
echo "Backend dependencies are ready."

# ============================================================
# 8. TEST DJANGO + DATABASE + MIGRATIONS
# ============================================================

echo
echo "============================================================"
echo "[8/10] Testing Django and database connection..."
echo "============================================================"

python manage.py check

echo
echo "Django system check passed."

echo
echo "Testing database connection and applying migrations..."
echo

python manage.py migrate

if [ $? -ne 0 ]; then

    echo
    echo "============================================================"
    echo "ERROR: Database migration failed."
    echo "============================================================"
    echo
    echo "Check:"
    echo "  - PostgreSQL is running"
    echo "  - Database exists"
    echo "  - Database username is correct"
    echo "  - Database password is correct"
    echo "  - DB_HOST is correct"
    echo "  - DB_PORT is correct"
    echo
    echo "NO DATA WAS INTENTIONALLY DELETED BY THIS SCRIPT."
    echo

    exit 1

fi

echo
echo "Database connection successful."
echo "Migrations completed successfully."

# ============================================================
# 9. INSTALL FRONTEND DEPENDENCIES + BUILD
# ============================================================

echo
echo "============================================================"
echo "[9/10] Preparing React frontend..."
echo "============================================================"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo
    echo "ERROR: Frontend directory was not found."
    echo "$FRONTEND_DIR"
    exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo
    echo "ERROR: frontend/package.json was not found."
    exit 1
fi

cd "$FRONTEND_DIR"

if [ -f "package-lock.json" ]; then

    echo "package-lock.json found."
    echo "Installing frontend dependencies with npm ci..."

    npm ci

else

    echo "package-lock.json not found."
    echo "Installing frontend dependencies with npm install..."

    npm install

fi

echo
echo "Frontend dependencies installed."

echo
echo "Building React frontend..."

npm run build

if [ $? -ne 0 ]; then
    echo
    echo "ERROR: Frontend build failed."
    exit 1
fi

echo
echo "Frontend build completed successfully."

# ============================================================
# 10. START PLATFORM
# ============================================================

echo
echo "============================================================"
echo "[10/10] Starting JumpStart Platform..."
echo "============================================================"

# ------------------------------------------------------------
# Start backend
# ------------------------------------------------------------

echo
echo "Starting Django backend..."

cd "$BACKEND_DIR"

nohup bash -c "
source '$BACKEND_DIR/venv/bin/activate'
cd '$BACKEND_DIR'
python manage.py runserver 0.0.0.0:8000
" > "$PROJECT_DIR/backend.log" 2>&1 &

BACKEND_PID=$!

echo "Backend started."
echo "Backend PID: $BACKEND_PID"

sleep 5

# ------------------------------------------------------------
# Start frontend
# ------------------------------------------------------------

echo
echo "Starting React frontend..."

cd "$FRONTEND_DIR"

nohup npm run dev -- --host 0.0.0.0 \
    > "$PROJECT_DIR/frontend.log" 2>&1 &

FRONTEND_PID=$!

echo "Frontend started."
echo "Frontend PID: $FRONTEND_PID"

sleep 5

# ============================================================
# OPEN BROWSER
# ============================================================

echo
echo "Attempting to open browser..."

if command -v xdg-open >/dev/null 2>&1; then

    xdg-open "http://localhost:5173/" >/dev/null 2>&1 &

elif command -v open >/dev/null 2>&1; then

    open "http://localhost:5173/" >/dev/null 2>&1 &

else

    echo "No desktop browser opener detected."
    echo "Open the URL manually."

fi

# ============================================================
# COMPLETE
# ============================================================

echo
echo "============================================================"
echo "         JUMPSTART PLATFORM IS RUNNING"
echo "============================================================"
echo
echo "Backend:"
echo "http://127.0.0.1:8000/"
echo
echo "Frontend:"
echo "http://localhost:5173/"
echo
echo "Backend log:"
echo "$PROJECT_DIR/backend.log"
echo
echo "Frontend log:"
echo "$PROJECT_DIR/frontend.log"
echo
echo "============================================================"
echo
echo "Existing users and database data were preserved."
echo "No Superadmin was created."
echo "No database cleaning was performed."
echo
echo "Superadmin -> HR -> Employee onboarding hierarchy"
echo "remains managed by the existing application."
echo
echo "============================================================"
echo

# Keep script alive so the process information remains visible.
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "Press Ctrl+C to close this installer window."
echo "The services will continue running in the background."

wait