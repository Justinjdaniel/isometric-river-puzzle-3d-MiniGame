# Tasks Delegation Matrix & Tracking (tasks.md)

This file tracks the completion progress of the **Isometric River Crossing Puzzle Game (3D)** project. Tasks must follow the **Rules of the Agent Lifecycle** outlined below.

## Rules of the Agent Lifecycle
1. **Supervisor Agent** (Jules) writes or updates tasks and assigns them to sub-agents.
2. **Sub-Agent** picks up a task, changes its status to `[In Progress]`, and writes the code alongside robust tests.
3. Once local automated tests and validation scripts PASS, the sub-agent marks the task as `[Ready for Verification]`.
4. **Supervisor Agent** runs the verification suite, inspects the outcome, and marks the task as `[Done]`.

---

## 1. Environment Setup & Project Boilerplate

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

---

## 2. Headless State Machine & Testing Suite

- [x] **Task 6: Define Core Constants**
  - **Description**: Export key constants such as hex colors, boat speed, and layout coordinates in `src/core/constants.js`.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 7: Setup Vitest Unit Testing Framework**
  - **Description**: Install `vitest` with `pnpm` as a devDependency and update `package.json` with a test script.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 8: Implement Headless State Machine**
  - **Description**: Write the `GameState` class in `src/core/state.js` that tracks actor positions, boat state, passenger loading rules, movement criteria, and rule evaluation.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 9: Write Robust Unit Tests**
  - **Description**: Write extensive unit tests in `src/core/state.test.js` validating rules, bounds, win conditions, and game over states.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

---

## 3. Design 3D Scene, Assets & Animations

- [x] **Task 10: Update Technical Specifications & Design Parameters**
  - **Description**: Refine `specs.md` with layout boundaries, actor offsets, developer demo controls, and low-poly visual specifications.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 11: Setup Constants and Coordinates**
  - **Description**: Refine `src/core/constants.js` to include exact coordinates, heights, scale modifiers, and `DEVELOPER_MODE` toggle.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 12: Build Isometric Scene with Floating Chunk & River**
  - **Description**: Create `src/render/scene.js` with the orthographic camera, a floating modular grass/earth landmass block, background mountains, custom flowing riverbed, docks, and soft low-poly directional/ambient lighting.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 13: Program Procedural Low-Poly Asset Models**
  - **Description**: Create `src/render/assets.js` with conifer trees, kayak/canoe, shepherd, fox, and parameterizable sheep models using flat-shaded standard materials.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 14: Implement Wave Displacement & Smooth Transition Animations**
  - **Description**: Create `src/render/animation.js` with CPU plane vertex displacement, bobbing effects, lerp translations, and developer keyboard-triggered animation demo routines.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)

- [x] **Task 15: Orchestrate Main Entry Point**
  - **Description**: Connect the scene setup, asset spawning, rendering, and anim loop in `src/main.js` to render the initial static board state with developer-triggerable demo animations.
  - **Assignee**: Sub-Agent
  - **Status**: `[Done]` (Verified by Jules)
