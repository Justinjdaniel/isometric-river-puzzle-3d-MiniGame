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

The puzzle follows the classic river crossing riddle (Shepherd, Two Sheep, and Fox).
- **Rules**:
  - The shepherd is the only one who can navigate the kayak.
  - The kayak can hold the shepherd and at most one animal (sheep or fox).
  - If the shepherd is on the opposite bank/kayak:
    - A Sheep and the Fox cannot be left alone on a bank (Fox eats Sheep).
    - Two Sheep cannot be left alone on a bank? Wait, the classical riddle is: Shepherd, Wolf, Goat, Cabbage.
      Here, the riddle says: "Help the shepherd transport two sheep and a fox across a moving low-poly river using a single kayak!".
      Wait, let's look at the rules for "two sheep and a fox":
      - If a fox and a sheep are left alone, the fox eats the sheep.
      - Are there other constraints? If there are two sheep and one fox, and the fox is left with one sheep (or two), the fox eats a sheep if unattended.
      - Let's specify: Fox eats Sheep if the Shepherd is not present. If there are two sheep and one fox, and the shepherd is on the other side:
        - If Left Bank has Fox and Sheep (and Shepherd is on Right or Kayak), Fox eats Sheep.
        - If Left Bank has Fox and 2 Sheep, does Fox eat Sheep? Yes, because Fox is unattended with Sheep.
        - So anytime the Fox is on a bank with any number of Sheep (1 or 2) and the Shepherd is NOT on that bank, it's a fail condition (Fox eats Sheep).
  - **State Representation**:
    - `shepherdBank`: `'left'` | `'right'` | `'kayak'`
    - `kayakBank`: `'left'` | `'right'`
    - `kayakPassenger`: `null` | `'sheep1'` | `'sheep2'` | `'fox'`
    - `leftBank`: Array of animals `['sheep1', 'sheep2', 'fox']` (initially)
    - `rightBank`: Array of animals (initially empty)
    - `gameStatus`: `'playing'` | `'won'` | `'failed'` | `'animating'`

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
