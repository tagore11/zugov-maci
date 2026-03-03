# Code Formatting Guide

This project uses **Prettier** for consistent code formatting across all editors and team members. The formatting configuration is designed to work seamlessly with Windsurf, Cursor, Zed, and VS Code.

## 🎯 Formatting Rules

Our Prettier configuration uses the following settings:

- **Semi-colons**: Always required
- **Quotes**: Single quotes for strings, JSX attributes
- **Trailing commas**: No trailing commas
- **Print width**: 120 characters
- **Tab width**: 2 spaces
- **Indentation**: Spaces (not tabs)
- **Bracket spacing**: Enabled (`{ foo }` not `{foo}`)
- **Arrow function parentheses**: Avoid when possible (`x => x` not `(x) => x`)
- **End of line**: LF (Unix style)

## 🚀 Quick Start

### Format All Files

```bash
bun run format
```

### Check Formatting (CI/Validation)

```bash
bun run format:check
```

### Format Staged Files (Git Hooks)

```bash
bun run format:staged
```

## 📁 Configuration Files

- **`.prettierrc`** - Main Prettier configuration
- **`.prettierignore`** - Files to exclude from formatting
- **`eslint.config.mjs`** - ESLint integration with Prettier

## 🔧 What Gets Formatted

### Included Files

- TypeScript/JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`)
- CSS/SCSS (`.css`, `.scss`)
- JSON files (`.json`)
- HTML files (`.html`)
- Markdown files (`.md`)

### Excluded Files

- `node_modules/`
- `.next/` build directory
- `dist/` and `build/` directories
- Lock files (`bun.lock`, `package-lock.json`)
- Generated files (`.d.ts` except in `src/`)
- Public assets (`public/`)

## 🎨 Pre-commit Integration

To automatically format files before committing, you can add a git hook:

```bash
# Install husky (optional)
bun add -d husky lint-staged

# Add to package.json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,css,scss,json,md}": [
      "prettier --write",
      "git add"
    ]
  }
}
```

## 🔍 Troubleshooting

### Editor Not Formatting on Save

1. **Check Prettier extension** is installed and enabled
2. **Verify `.prettierrc`** exists in project root
3. **Ensure format on save** is enabled in editor settings
4. **Check file type** is included in formatter configuration

### Conflicting Formatting Rules

1. **ESLint conflicts**: Our setup includes `eslint-config-prettier` to disable conflicting rules
2. **Editor defaults**: Project settings override editor defaults
3. **Extension conflicts**: Disable other formatting extensions (Beautify, etc.)

### Format Check Fails in CI

```bash
# Run locally to see what needs formatting
bun run format:check

# Fix all issues
bun run format

# Verify fix
bun run format:check
```

## 🤝 Contributing

When contributing to this project:

1. **Run `bun run format`** before committing
2. **Ensure format check passes**: `bun run format:check`
3. **Don't modify** `.prettierrc` without team discussion
4. **Use consistent editor settings** as provided

## 💡 Benefits

- **Consistent code style** across all editors and team members
- **Automatic formatting** on save eliminates manual work
- **Reduced merge conflicts** from formatting differences
- **Improved code readability** and maintainability
- **Faster code reviews** focused on logic, not style

---

For questions about the formatting setup, please check the project's main README or create an issue.
