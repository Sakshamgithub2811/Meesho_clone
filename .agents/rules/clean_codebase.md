# Clean Codebase & Zero Clutter Policy

## 1. No Redundant or Dead Files / Folders
- Never create or leave unused, dead, or duplicate files in any folder (backend or frontend).
- When a file or endpoint is refactored or made obsolete, remove it cleanly from the repository.

## 2. No Duplicate `index.js` in Subfolders
- Keep entry point naming unambiguous. The root server entry is `backend/index.js`.
- Subfolders (like `src/routes/`, `src/controllers/`, `src/services/`) must use explicit, descriptive file names (e.g. `dropshipper.routes.js`, `health.routes.js`, `adminAuth.routes.js`) instead of generic `index.js` to avoid tab confusion and architectural ambiguity.

## 3. Zero Dead Code & Clean Imports
- Do not leave unused imports, commented-out dead code blocks, or mock placeholders.
- Every added file must have a single, clearly defined responsibility and be connected to the application flow.