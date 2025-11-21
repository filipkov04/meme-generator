#!/bin/bash

echo "Quick InstantDB Setup"
echo "===================="
echo ""

echo "Step 1: Login to InstantDB (will open browser)..."
npx instant-cli login

echo ""
echo "Step 2: Push schema to InstantDB..."
npx instant-cli push

echo ""
echo "Done! Now run: npm run dev"

