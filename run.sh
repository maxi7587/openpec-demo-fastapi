#!/usr/bin/env bash
set -e

CMD="${1:-up}"

case "$CMD" in
  up)
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
    ;;

  test)
    TARGET="${2:-all}"
    case "$TARGET" in
      be)
        echo "Running back-end tests..."
        python -m pytest back-end/test_store_api.py -v
        ;;
      fe)
        echo "Running front-end tests..."
        node --test front-end/test_ui.mjs
        ;;
      all)
        echo "Running all tests..."
        echo ""
        echo "=== Back-end tests ==="
        python -m pytest back-end/test_store_api.py -v
        echo ""
        echo "=== Front-end tests ==="
        node --test front-end/test_ui.mjs
        ;;
      *)
        echo "Unknown test target: $TARGET"
        echo "Usage: ./run.sh test [be|fe|all]"
        exit 1
        ;;
    esac
    ;;

  *)
    echo "Usage: ./run.sh <command>"
    echo ""
    echo "Commands:"
    echo "  up          Start both back-end and front-end servers"
    echo "  test [target]  Run tests (be, fe, or all)"
    exit 1
    ;;
esac
