# Technical System Specification (specs.md)

This document establishes the architectural, visual, and behavioral specifications of the **Isometric River Crossing Puzzle Game (3D)**.

## 1. Scene & Coordinates System

- **Projection**: Isometric projection using an orthographic camera (`THREE.OrthographicCamera`).
- **Coordinate Alignments**:
  - **Floating Chunk Total Dimensions**: Width 16.0 units (X-axis, $X \in [-8.0, 8.0]$), Depth 12.0 units (Z-axis, $Z \in [-6.0, 6.0]$), Height/Void Depth 3.0 units deep (Y-axis, extruded from $Y = 0.0$ down to $Y = -3.0$).
  - **Left Bank**: $X \le -2.5$ (Grass top height $Y = 0.0$).
  - **River Channel**: Spans from $X = -2.5$ to $X = 2.5$. Water plane sits slightly below the grass level at $Y = -0.1$ to prevent Z-fighting.
  - **Right Bank**: $X \ge 2.5$ (Grass top height $Y = 0.0$).
  - **Z-Axis**: Represents depth ($Z \in [-6, 6]$).
  - **Y-Axis**: Height axis ($Y = 0$ is land surface, positive $Y$ represents assets/characters/mountains, negative $Y$ is floating chunk base and void).
  - **Docks**: Placed at $X = -2.5$ and $X = 2.5$, extending slightly over water at height $Y = 0.05$.
- **Floating Chunk Base**: The world is a clean, modular rectangular block with top grass-green faces and dark, earthy, rocky vertical sides extending downwards into the blackness.

- **Actor Starting Offsets on Left Bank**:
  - **Shepherd ('man')**: $X = -4.5$, $Y = 0.0$, $Z = 0.0$ (Closest to dock)
  - **Fox**: $X = -5.5$, $Y = 0.0$, $Z = -2.0$ (Keeping its distance)
  - **Sheep 1**: $X = -5.5$, $Y = 0.0$, $Z = 2.0$
  - **Sheep 2**: $X = -6.5$, $Y = 0.0$, $Z = 0.5$ (Visual lamb distinction: scaled down to 0.85, rotated differently)

- **Developer Demo Mode**:
  - If `DEVELOPER_MODE` is enabled in `constants.js`, temporary keyboard controls allow testing:
    - `Spacebar`: Smoothly transit boat/kayak between docks.
    - Keys `1`, `2`, `3`, `4`: Board/unload Shepherd, Fox, Sheep 1, and Sheep 2.
  - Toggled by the hidden `'D'` key, showing/hiding the `DEV DEMO CONTROLS` panel.
  - Keyboard shortcuts are only active when the developer controls panel is visible.

- **Mouse/Touch Raycasting & Hover Elements**:
  - Use `THREE.Raycaster` to capture clicks/taps on interactive assets: Shepherd, Fox, Sheep 1, Sheep 2, and the Kayak/Boat.
  - Asset roots are identified using `userData.actorId` tags (e.g., `'man'`, `'fox'`, `'sheep1'`, `'sheep2'`, `'boat'`).
  - Cursor changes to `'pointer'` when hovering over any interactive actor or boat.

- **Interaction Feedback & Animations**:
  - **Successful Load/Unload**: Parabolic jump/hop with squash-and-stretch scale profile.
  - **Successful Boat Transit**: Kayak lerps smoothly along X-axis, carrying any boarded passenger.
  - **Invalid Move Feedback**: A quick rotational wobble/shake (Y-axis head-shake back-and-forth) to indicate a "No" visually.
  - **Reset Glide**: A quick continuous translation glide along X and Z axes without a vertical hop, rapidly aligning all meshes back to left-bank home coordinates.

- **Game Over Custom Cues**:
  - Triggered immediately when a game-over condition evaluates.
  - Fox does a quick rearing-up animation, tilting back on its hind legs.
  - The targeted Sheep (the one left alone with the Fox) does a rapid distressed rotational spin.
  - Both animations play for 1.5 seconds before showing the game-over modal, and continue playing in the background while the modal is open.

- **Glassmorphic HUD Integration**:
  - A permanent, elegant, frosted-glass "Move Boat" button is placed on the HUD.
  - The button is dynamically enabled only when the Shepherd is on board, displaying reduced opacity and a disabled state otherwise.

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

## 3. Aesthetic Style & Visual Specifications (Vibrant Sunlit Day)

- **Low-Poly Art Design**:
  - Faceted look, no smooth shading. Apply `flatShading: true` to all materials.
  - Landmasses and floating chunks built with stylized, randomized sharp vertices.
  - Trees built from basic geometry (cylinders for trunks, stacked cones/tetrahedrons for foliage).
  - River animated with slight wave vertex displacements or simple vertex shader offsets.
- **Vibrant Sunlit Lighting Model**:
  - Shifted from a dim, moody aesthetic to a bright, vibrant, sunlit daytime scene.
  - **Sky/Background**: Set to a soft pastel sky-blue (`#E0F7FA`), making the diorama look like it's drifting in a breeze.
  - **Fog**: Subtle atmospheric exp2 fog (`THREE.FogExp2` with `#E0F7FA`, density `0.015`) to blend distant mountains.
  - **Water**: Clear turquoise hue (`#33EEFF` or `#00CCCC`) with a stylized, glassy reflection. Waves flow downstream (longitudinally along the Z-axis) over time.
  - **Grass**: Vibrant, rich, sunlit grass green (`#55CC55`).
  - **Rock Cutout**: Lighter, warm-toned rocky brown/earth texture.
  - **AmbientLight**: Globally lightened shadows using a strong AmbientLight (intensity `0.85+` with light-blue sky color).
  - **DirectionalLight**: A high-intensity main sunlight (intensity `1.6+` using warm color `#FFFCEB`) casting sharp, well-defined shadows that create depth across the low-poly terrain block.
- **Detailed Asset Polish**:
  - **Shepherd**: Deep blue coat, dark grey/black brimmed hat with brown leather band, holding a simple brown cylinder walking staff.
  - **Sheep & Lamb**: Soft floppy blocky ears, black-and-white spherical beady eyes on a dark face.
  - **Fox**: Black paws/socks on lower legs, white chest, white tail tip.
  - **Conifer Trees**: Symmetrical three-tiered design with random scales (0.8x to 1.3x) and 3 distinct pine green tones (`light pine`, `classic pine`, `deep forest`).
- **Boarding Hops (Squash & Stretch)**:
  - Playful parabolic jump animations scale dynamically: stretching vertically (Y-scale up to 1.16x) in flight, and squashing on landing (Y-scale down to 0.84x) before returning to base size, while conserving volume on X/Z axes.
- **Glassmorphic UI**:
  - Overlaid HUD, menus, and win/fail modals.
  - Transparent frosted glass aesthetic (`backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.15)`).
  - Thin elegant borders, clear legibility with modern sans-serif typography.

## 4. Responsive & Performance Constraints

- **Window Sizing**: Full-screen layout. Redraw canvas dynamically on resize.
- **Performance**: High refresh rates (60fps+) using efficient geometry sharing and single render loops. Keep light count low (one ambient, one directional with shadows enabled).
