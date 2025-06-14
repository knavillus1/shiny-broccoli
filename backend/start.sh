#!/usr/bin/env bash
export PYTHONPATH=/Users/kevinsullivan/code/shiny-broccoli:$PYTHONPATH
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
