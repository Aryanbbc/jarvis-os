#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "Python is not installed."
  exit 1
fi

if [ ! -d ".venv" ]; then
  "$PYTHON_BIN" -m venv .venv
fi

source .venv/bin/activate

python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt

mkdir -p vault/reports
mkdir -p vault/daily
mkdir -p vault/notes
mkdir -p vault/memory
mkdir -p vault/logs
mkdir -p vault/cache
mkdir -p vault/conversations
mkdir -p vault/audio
mkdir -p vault/transcripts
mkdir -p skills/research
mkdir -p skills/coding
mkdir -p skills/daily-brief
mkdir -p voice
mkdir -p dashboard/src/components

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

echo "jarvis-os setup complete."
echo "Run: source .venv/bin/activate"