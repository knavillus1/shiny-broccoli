#!/usr/bin/env bash
set -euo pipefail

# Parse command line arguments
NO_INTEGRATION=false
ONLY_INTEGRATION=false
PYTEST_ARGS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    -no_integration|--no-integration)
      NO_INTEGRATION=true
      shift
      ;;
    -only_integration|--only-integration)
      ONLY_INTEGRATION=true
      shift
      ;;
    *)
      PYTEST_ARGS+=("$1")
      shift
      ;;
  esac
done

if ! python -c 'import httpx' 2>/dev/null; then
  echo "httpx not installed, skipping tests"
  exit 0
fi

echo "Running pytest..."
export PYTHONPATH="${PYTHONPATH:-}:$(pwd)"

# Determine which test directories to run
if [[ "$NO_INTEGRATION" == "true" && "$ONLY_INTEGRATION" == "true" ]]; then
  echo "Cannot use both -no_integration and -only_integration flags."
  exit 1
fi

if [[ "$NO_INTEGRATION" == "true" ]]; then
  echo "Skipping integration tests..."
  if [[ ${#PYTEST_ARGS[@]} -eq 0 ]]; then
    pytest backend/tests/unit
  else
    pytest backend/tests/unit "${PYTEST_ARGS[@]}"
  fi
elif [[ "$ONLY_INTEGRATION" == "true" ]]; then
  echo "Running only integration tests..."
  if [[ ${#PYTEST_ARGS[@]} -eq 0 ]]; then
    pytest backend/tests/integration
  else
    pytest backend/tests/integration "${PYTEST_ARGS[@]}"
  fi
else
  echo "Running unit and integration tests..."
  if [[ ${#PYTEST_ARGS[@]} -eq 0 ]]; then
    pytest backend/tests/unit backend/tests/integration
  else
    pytest backend/tests/unit backend/tests/integration "${PYTEST_ARGS[@]}"
  fi
fi
echo "Running vitest..."
cd frontend
# Ensure dependencies are installed before checking vitest
if ! npm list jsdom >/dev/null 2>&1 || ! npm list eventsource-parser >/dev/null 2>&1; then
  echo "Installing missing frontend dependencies..."
  npm install
fi
if ! npx vitest --version >/dev/null 2>&1; then
  echo "vitest not installed, skipping frontend tests"
else
  npx vitest run
fi
cd ..
