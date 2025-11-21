#!/bin/bash

echo "Manual InstantDB Login"
echo "======================"
echo ""
echo "Running login command..."
echo ""

# Try login with explicit yes
echo "yes" | npx instant-cli login || npx instant-cli login

echo ""
echo "If login succeeded, now pushing schema..."
npx instant-cli push

