# Tasks Delegation Matrix & Tracking (tasks.md)

This file tracks the completion progress of the **Isometric River Crossing Puzzle Game (3D)** project. Tasks must follow the **Rules of the Agent Lifecycle** outlined below.

## Rules of the Agent Lifecycle
1. **Supervisor Agent** (Jules) writes or updates tasks and assigns them to sub-agents.
2. **Sub-Agent** picks up a task, changes its status to `[In Progress]`, and writes the code alongside robust tests.
3. Once local automated tests and validation scripts PASS, the sub-agent marks the task as `[Ready for Verification]`.
4. **Supervisor Agent** runs the verification suite, inspects the outcome, and marks the task as `[Done]`.

---

## 1. Environment Setup & Project Boilerplate (Current Phase)

- [x] **Task 1: Project Initialization & Package Manager**
  - **Description**: Initialize the project directory with `package.json` utilizing pnpm v11. Install `three` and `vite` dependencies.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 2: Editor Configuration & CI/CD pipeline**
  - **Description**: Set up `.vscode/settings.json` and `.vscode/tasks.json`. Configure `.github/workflows/deploy.yml` with a pnpm actions build-and-deploy flow targeting GitHub Pages.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 3: Multi-Agent SDD Framework Documentation**
  - **Description**: Create `CLAUDE.md`, `agent.md`, `specs.md`, and `tasks.md` in the repository root.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 4: Vite Configuration & Canvas Styles**
  - **Description**: Configure `vite.config.js` with `base: './'` relative pathing. Create `index.html` and full-screen styles in `src/style.css`.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 5: Main Entry Point & Spinning Cube Scene**
  - **Description**: Implement a standard Three.js render loop in `src/main.js` featuring a faceted low-poly style spinning cube (`MeshStandardMaterial` with `flatShading: true`), directional/ambient lighting, and window resize listeners.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)
