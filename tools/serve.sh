#!/usr/bin/env bash
PORT=8000
echo "Serving current dir on http://localhost:${PORT}"
python3 -m http.server ${PORT}
