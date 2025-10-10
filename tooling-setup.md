## Tooling setup: Husky, lint-staged, Biome, Prettier

This document captures the exact setup and versions used in this project so you can replicate it in another Next.js app.

### Versions

- **@biomejs/biome**: ^2.1.1
- **husky**: ^9.1.7
- **lint-staged**: ^16.1.2
- **prettier**: ^3.6.2
- **prettier-plugin-organize-imports**: ^4.1.0

### Install

- npm
```bash
npm i -D @biomejs/biome@^2.1.1 husky@^9.1.7 lint-staged@^16.1.2 prettier@^3.6.2 prettier-plugin-organize-imports@^4.1.0
```

- pnpm
```bash
pnpm add -D @biomejs/biome@^2.1.1 husky@^9.1.7 lint-staged@^16.1.2 prettier@^3.6.2 prettier-plugin-organize-imports@^4.1.0
```

- bun
```bash
bun add -d @biomejs/biome@^2.1.1 husky@^9.1.7 lint-staged@^16.1.2 prettier@^3.6.2 prettier-plugin-organize-imports@^4.1.0
```

### package.json

Add the following to `package.json`:

```json
{
  "scripts": {
    "lint:biome": "biome lint ./src",
    "lint:biome:fix": "biome check --apply ./src",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:biome": "biome format ./src",
    "format:biome:fix": "biome format --write ./src",
    "check": "biome check ./src",
    "check:fix": "biome check --apply ./src",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,md,yml,yaml}": [
      "biome format --write"
    ]
  }
}
```

### Husky + lint-staged

Initialize Husky (creates `.husky/`):

```bash
npm run prepare
```

Create `.husky/pre-commit` to run lint-staged:

- For npm/pnpm
```bash
printf "# .husky/pre-commit\nnpx lint-staged\n" > .husky/pre-commit && chmod +x .husky/pre-commit
```

- For bun (matches this project)
```bash
printf "# .husky/pre-commit\nbunx lint-staged\n" > .husky/pre-commit && chmod +x .husky/pre-commit
```

### Biome configuration (`biome.json`)

Place this file at the project root:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.1.1/schema.json",
  "extends": [],
  "files": {
    "maxSize": 1048576,
    "includes": ["**"],
    "ignoreUnknown": false
  },
  "vcs": {
    "enabled": false,
    "clientKind": "git",
    "useIgnoreFile": false,
    "root": "",
    "defaultBranch": "main"
  },
  "linter": {
    "enabled": true,
    "includes": ["**"],
    "rules": {
      "recommended": true,
      "a11y": { "recommended": true },
      "complexity": { "recommended": true },
      "correctness": { "recommended": true },
      "nursery": { "recommended": true },
      "performance": { "recommended": true },
      "security": { "recommended": true },
      "style": { "recommended": true },
      "suspicious": { "recommended": true }
    }
  },
  "formatter": {
    "enabled": true,
    "includes": ["**"],
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf",
    "attributePosition": "auto",
    "useEditorconfig": false
  },
  "assist": { "actions": { "source": { "organizeImports": "on" } } },
  "javascript": {
    "parser": { "unsafeParameterDecoratorsEnabled": false },
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "trailingCommas": "es5",
      "semicolons": "always",
      "arrowParentheses": "asNeeded",
      "enabled": true,
      "indentStyle": "space",
      "indentWidth": 2,
      "lineEnding": "lf",
      "lineWidth": 80,
      "bracketSameLine": false,
      "bracketSpacing": true,
      "attributePosition": "auto"
    },
    "globals": [],
    "jsxRuntime": "transparent",
    "linter": { "enabled": true }
  },
  "json": {
    "parser": { "allowComments": false, "allowTrailingCommas": false },
    "formatter": {
      "enabled": true,
      "indentStyle": "space",
      "indentWidth": 2,
      "lineEnding": "lf",
      "lineWidth": 80,
      "trailingCommas": "none"
    },
    "linter": { "enabled": true }
  },
  "css": {
    "parser": { "cssModules": false },
    "formatter": {
      "enabled": false,
      "indentStyle": "space",
      "indentWidth": 2,
      "lineEnding": "lf",
      "lineWidth": 80,
      "quoteStyle": "single"
    },
    "linter": { "enabled": false }
  },
  "overrides": []
}
```

### Optional Prettier config

Prettier is available for ad-hoc formatting. If you want to organize imports with Prettier 3, add:

`prettier.config.cjs`
```js
/** @type {import('prettier').Config} */
module.exports = {
  plugins: ['prettier-plugin-organize-imports']
};
```

### Usage

- **Check with Biome**: `npm run check` or auto-fix `npm run check:fix`
- **Format with Prettier**: `npm run format` or verify `npm run format:check`
- **Pre-commit**: Husky runs lint-staged which formats staged files with `biome format --write`.


