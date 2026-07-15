# Agent Behavior & Developer Guidelines (agent.md)

Welcome to the multi-agent orchestration setup for **Isometric River Crossing Puzzle Game (3D)**.

## Framework Roles

### 1. Supervisor Agent (Jules)
- **Responsibility**: Governs the repository structure, defines task specifications in `specs.md`, assigns work items in `tasks.md`, and performs the final functional verification.
- **Verification Rule**: Supervisor Agent must run the live build, inspect terminal and canvas logs, and check the visual layout before marking tasks as `[Done]`.

### 2. Sub-Agents
- **Responsibility**: Scope-constrained execution environments created to solve specific steps in `tasks.md`.
- **Workflow**:
  1. Inspect `tasks.md` and select a `[Pending]` task.
  2. Mark the selected task as `[In Progress]`.
  3. Author the requested changes in the codebase, implementing corresponding unit or integration tests.
  4. Ensure all local build, lint, and test scripts pass.
  5. Commit and mark the task as `[Ready for Verification]`.

## Commands Reference

- **Run Dev Server**: `pnpm run dev`
- **Build Project**: `pnpm run build`
- **Run Preview**: `pnpm run preview`
- **Run Test**: `pnpm run test` (to be set up later)
- **Run Lint**: `pnpm run lint` (to be set up later)
