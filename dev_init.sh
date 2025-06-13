#!/usr/bin/env bash
set -euo pipefail

# Development initialization script
# Checks prerequisites, installs dependencies, and starts both backend and frontend.

# --------- Helper Functions ---------
require_python() {
  local ver
  if ! ver=$(python3 --version 2>/dev/null); then
    echo "Python 3.11+ is required but not found" >&2
    exit 1
  fi
  ver=${ver#Python }
  if [[ $ver != 3.11* && $ver != 3.12* ]]; then
    echo "Warning: expected Python 3.11.x, found $ver" >&2
  fi
}

require_node() {
  local ver
  if ! ver=$(node --version 2>/dev/null); then
    echo "Node.js 18+ is required but not found" >&2
    exit 1
  fi
  ver=${ver#v}
  major=${ver%%.*}
  if (( major < 18 )); then
    echo "Warning: expected Node.js 18+ (or 20), found $ver" >&2
  fi
}

# --------- Checks ---------
require_python
require_node

# --------- Backend Setup ---------
if [ ! -d backend/.venv ]; then
  python3 -m venv backend/.venv
fi
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
fi

# --------- Frontend Setup ---------
(cd frontend && npm install)

# --------- Start Servers ---------
uvicorn backend.app.main:app --reload --port 8000 &
BACKEND_PID=$!
(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID' INT TERM
wait $FRONTEND_PID
