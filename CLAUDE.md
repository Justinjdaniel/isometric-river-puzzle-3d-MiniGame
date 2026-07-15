# Developer Guidelines & Agent Behavior (CLAUDE.md)

## Agent Roles
- **Supervisor Agent (Jules)**: Guides the design, sets plans, updates tasks, and conducts final verifications of sub-agent implementations.
- **Sub-Agent**: Picks up tasks from `tasks.md`, marks them `[In Progress]`, implements robust code and tests, and signals `[Ready for Verification]` upon local test success.

## Project Automation Commands
- **Local Development**: `pnpm run dev`
- **Build Output**: `pnpm run build`
- **Preview Build**: `pnpm run preview`
- **Lint Code (once configured)**: `pnpm run lint`
- **Test Suite (once configured)**: `pnpm run test`

## Code Conventions
- JavaScript: vanilla ES Modules (`src/main.js`).
- Layout structure:
  - `src/core/` (Game state and puzzle logic)
  - `src/render/` (Three.js scene and rendering assets)
  - `src/ui/` (HTML/CSS layout and user interface overlays)
- Style: Strict low-poly aesthetics with flat-shaded materials.
- Canvas: Auto-resized, full-screen viewport.
