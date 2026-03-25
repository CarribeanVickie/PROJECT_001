#!/bin/sh

echo "Running DB setup..."
node dbsetup.js || echo "DB setup skipped or already run"

echo "Starting server..."
node dist/middleware/server.js