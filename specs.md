# Technical System Specification (specs.md)

This document establishes the architectural, visual, and behavioral specifications of the **Isometric River Crossing Puzzle Game (3D)**.

## 1. Scene & Coordinates System

- **Projection**: Isometric projection using an orthographic camera (`THREE.OrthographicCamera`).
- **Coordinate Alignments**:
  - **Left Bank**: Coordinates negative on the X-axis (e.g., $X \in [-10, -3]$).
  - **River Channel**: Coordinates near the center (e.g., $X \in [-3, 3]$).
  - **Right Bank**: Coordinates positive on the X-axis (e.g., $X \in [3, 10]$).
  - **Z-Axis**: Represents the depth of the valley (e.g., $Z \in [-5, 5]$).
  - **Y-Axis**: Height axis ($Y = 0$ is the water surface, positive $Y$ represents land/meadows/mountains).
- **Floating Chunk Base**: The world is a circular or square floating rock structure with vertical cutouts down into a dark void.

## 2. State Machine Requirements

The puzzle follows the classic river crossing riddle (Shepherd/Man, Two Sheep, and Fox) using a boat.
- **Rules**:
  - The boat capacity limit is exactly 2.
  - The shepherd ('man') must ALWAYS be on the boat to move it.
  - The remaining 1 spot on the boat can contain either 'fox', 'sheep1', 'sheep2', or remain empty.
  - An actor (including the 'man') is considered "present" on a bank if:
    * Their location is physically on that bank (e.g., 'left'), OR
    * Their location is 'boat' AND the boat is currently docked at that bank.
  - A game-over state occurs if the 'man' is "away" from a bank (not present on that bank), and both the 'fox' and at least one 'sheep' ('sheep1' or 'sheep2') are present on that same bank.
  - Leaving 'sheep1' and 'sheep2' alone together on a bank is perfectly safe.
  - All movements and state changes are instantaneous and synchronous in the headless engine.

- **Core API Methods**:
  - `loadToBoat(actor)`: Safely boards an actor from their current bank. Returns `true` on success, `false` on failure.
  - `unloadFromBoat(actor)`: Unloads an actor to the boat's current bank. Returns `true` on success, `false` on failure.
  - `moveBoat()`: Triggers bank transition if the 'man' is on board. Returns `true` on success, `false` on failure.
  - `checkRules()`: Evaluates the current layout and returns:
    - `'victory'`: If all 4 actors are safe on 'right'.
    - `'game_over_fox_ate_sheep'`: If the 'man' is away and 'fox' is present with at least one sheep on the same bank.
    - `'playing'`: If the current setup is valid and the game is ongoing.
  - `reset()`: Resets all values back to default starting conditions (all actors and boat on 'left' bank).

- **State Representation**:
  - `actorPositions`: Object mapping `'man'`, `'fox'`, `'sheep1'`, `'sheep2'` to `'left'`, `'boat'`, or `'right'`.
  - `boatLocation`: `'left'` or `'right'`.

## 3. Aesthetic Style

- **Low-Poly Art Design**:
  - Faceted look, no smooth shading. Apply `flatShading: true` to all materials.
  - Landmasses and floating chunks built with stylized, randomized sharp vertices.
  - Trees built from basic geometry (cylinders for trunks, stacked cones/tetrahedrons for foliage).
  - River animated with slight wave vertex displacements or simple vertex shader offsets.
- **Glassmorphic UI**:
  - Overlaid HUD, menus, and win/fail modals.
  - Transparent frosted glass aesthetic (`backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.15)`).
  - Thin elegant borders, clear legibility with modern sans-serif typography.

## 4. Responsive & Performance Constraints

- **Window Sizing**: Full-screen layout. Redraw canvas dynamically on resize.
- **Performance**: High refresh rates (60fps+) using efficient geometry sharing and single render loops. Keep light count low (one ambient, one directional with shadows enabled).
