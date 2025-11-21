#!/bin/bash

echo "=========================================="
echo "InstantDB Setup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo ""
    echo "Please install Node.js first:"
    echo "1. Visit https://nodejs.org/"
    echo "2. Download and install the LTS version"
    echo "3. Restart your terminal"
    echo ""
    echo "Or install via Homebrew (if you have it):"
    echo "  brew install node"
    echo ""
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Check if instant-cli is available
echo "Checking InstantDB CLI..."
if ! npx instant-cli --version &> /dev/null; then
    echo "Installing InstantDB CLI..."
fi

echo ""
echo "=========================================="
echo "Step 1: Login to InstantDB"
echo "=========================================="
echo "This will open your browser for authentication..."
echo ""
read -p "Press Enter to continue with login..."

npx instant-cli login

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Login successful!"
    echo ""
    echo "=========================================="
    echo "Step 2: Push Schema to InstantDB"
    echo "=========================================="
    echo ""
    read -p "Press Enter to push your schema..."
    
    npx instant-cli push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Schema pushed successfully!"
        echo ""
        echo "=========================================="
        echo "Next Steps:"
        echo "=========================================="
        echo "1. Run: npm install (if you haven't already)"
        echo "2. Run: npm run dev"
        echo "3. Open: http://localhost:3000"
        echo ""
    else
        echo ""
        echo "❌ Schema push failed. Please check the error above."
    fi
else
    echo ""
    echo "❌ Login failed. Please try again."
fi

