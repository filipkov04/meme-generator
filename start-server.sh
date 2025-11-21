#!/bin/bash

# Simple HTTP server to run the meme generator locally
# This script starts a local web server on port 8000

echo "Starting local server..."
echo "Open your browser and go to: http://localhost:8000/meme-generator.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python 3 first, then Python 2, then node's http-server
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
elif command -v node &> /dev/null && command -v npx &> /dev/null; then
    npx http-server -p 8000
else
    echo "Error: No suitable server found."
    echo "Please install Python 3 or Node.js to run a local server."
    exit 1
fi

