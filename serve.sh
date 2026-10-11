#!/bin/bash
# Restart: bash /workspace/ohchute-store/serve.sh
pkill -f "http.server 8080 --directory /workspace/ohchute-store" 2>/dev/null
nohup python3 -m http.server 8080 --bind 0.0.0.0 --directory /workspace/ohchute-store >/workspace/ohchute-server.log 2>&1 &
