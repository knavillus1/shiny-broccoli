#!/usr/bin/env bash
set -euo pipefail

# Ensure required versions are available
PY_VER=$(python3 --version 2>/dev/null || true)
if [[ $PY_VER != 3.11* ]]; then
  echo "Warning: Python 3.11 is recommended. Found: $PY_VER" >&2
fi

NODE_VER=$(node --version 2>/dev/null || true)
if [[ -z $NODE_VER ]]; then
  echo "Node.js is required but not found" >&2
  exit 1
fi
NODE_MAJOR=${NODE_VER#v}
NODE_MAJOR=${NODE_MAJOR%%.*}
if (( NODE_MAJOR < 18 )); then
  echo "Warning: Node.js 18+ is recommended. Found: $NODE_VER" >&2
fi

echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

echo "Installing Node.js dependencies..."
cd frontend

# Ensure we have a clean node_modules if package-lock.json exists
if [ -f package-lock.json ]; then
  echo "Using npm ci for clean install..."
  if ! npm ci; then
    echo "npm ci failed (lockfile mismatch), falling back to npm install..."
    npm install
  fi
else
  echo "Using npm install..."
  npm install
fi

# Verify key dependencies are installed
if ! npm list jsdom >/dev/null 2>&1; then
  echo "jsdom not found, installing explicitly..."
  npm install jsdom --save-dev
fi

if ! npm list vitest >/dev/null 2>&1; then
  echo "vitest not found, installing explicitly..."
  npm install vitest --save-dev
fi

cd ..
echo "Installation complete!"
