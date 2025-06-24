#!/bin/bash
# This script will delete all git commit history and force push a new initial commit to GitHub.
# WARNING: This is destructive and cannot be undone!

set -e

REPO_URL="https://github.com/TansyaBabu/-my-fullstack-app.git"

# Clone the repo if not already in it
if [ ! -d .git ]; then
  git clone "$REPO_URL"
  cd -my-fullstack-app
fi

echo "Creating orphan branch..."
git checkout --orphan latest_branch

echo "Adding all files..."
git add -A
git commit -am "Initial commit (history reset)"

echo "Deleting old main branch..."
git branch -D main || true

echo "Renaming new branch to main..."
git branch -m main

echo "Force pushing to GitHub..."
git push -f origin main

echo "All commit history deleted and new initial commit pushed!" 