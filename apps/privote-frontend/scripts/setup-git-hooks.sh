#!/bin/bash

# Setup Git Hooks for Prettier Formatting
# This script sets up a pre-commit hook that automatically formats staged files

set -e

echo "Setting up Git hooks for automatic formatting..."

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|css|scss|json|md)$' | tr '\n' ' ')

if [ -z "$STAGED_FILES" ]; then
  echo "No staged files to format"
  exit 0
fi

echo "Formatting staged files with Prettier..."

# Check if prettier is available
if ! command -v bunx &> /dev/null; then
  echo "Error: bunx not found. Please install bun first."
  exit 1
fi

# Format staged files
echo "$STAGED_FILES" | xargs bunx prettier --write

# Add formatted files back to staging
echo "$STAGED_FILES" | xargs git add

echo "✅ Files formatted and staged successfully"
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "The hook will automatically:"
echo "  - Format staged files with Prettier before each commit"
echo "  - Re-stage the formatted files"
echo "  - Only process supported file types (.ts, .tsx, .js, .jsx, .css, .scss, .json, .md)"
echo ""
echo "To test the hook, stage some files and make a commit:"
echo "  git add ."
echo "  git commit -m 'test formatting hook'"
echo ""
echo "To disable the hook temporarily, use:"
echo "  git commit --no-verify -m 'skip formatting'"
