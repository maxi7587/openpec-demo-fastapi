#!/usr/bin/env bash
set -e

# Start back-end (uvicorn with auto-reload)
echo "Starting back-end on http://localhost:8000 ..."
cd back-end
uvicorn store-api:app --reload --port 8000 &
BE_PID=$!
cd ..

# Start front-end (python dev server)
echo "Starting front-end on http://localhost:3000 ..."
cd front-end
python -m http.server 3000 &
FE_PID=$!
cd ..

echo ""
echo "Back-end:  http://localhost:8000"
echo "Front-end: http://localhost:3000"
echo "Press Ctrl+C to stop both."

# Shut down both on exit
trap "kill $BE_PID $FE_PID 2>/dev/null" EXIT
wait
