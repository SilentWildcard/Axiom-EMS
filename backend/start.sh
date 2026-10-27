#!/bin/bash
# Start AXIOM EMS Backend
uvicorn main:app --reload --port 8000
