import * as THREE from 'three';
import { BOUNDS, POSITIONS, BOAT_SEATS, getBankPosition, DEVELOPER_MODE, SPEED } from '../core/constants.js';

// Track animation states for actors
// Each actor can have: { startPos: Vector3, progress: number, animating: boolean, prevLocation: string }
const actorAnims = {
  man: { startPos: new THREE.Vector3(), progress: 1.0, animating: false, prevLocation: 'left' },
  fox: { startPos: new THREE.Vector3(), progress: 1.0, animating: false, prevLocation: 'left' },
  sheep1: { startPos: new THREE.Vector3(), progress: 1.0, animating: false, prevLocation: 'left' },
  sheep2: { startPos: new THREE.Vector3(), progress: 1.0, animating: false, prevLocation: 'left' }
};

// Target positions for meshes to assist in smooth lerps
const boatTargetX = { value: POSITIONS.BOAT_DOCK_LEFT.x };

/**
 * CPU-based water plane vertex wave displacement.
 * Modifies the position attribute of a PlaneGeometry to create chunky, low-poly waves.
 * @param {THREE.Mesh} waterMesh - The water plane mesh
 * @param {number} elapsedTime - The elapsed clock time
 */
export function animateWater(waterMesh, elapsedTime) {
  if (!waterMesh || !waterMesh.geometry) return;

  const geom = waterMesh.geometry;
  const posAttr = geom.attributes.position;
  const count = posAttr.count;

  for (let i = 0; i < count; i++) {
    // PlaneGeometry coordinates are relative: X and Y map to width and height
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);

    // Apply combined low-poly waves using multiple sine/cosine frequencies
    // Amplitude is kept subtle to keep it looking stylized and elegant
    const wave = Math.sin(x * 1.3 + elapsedTime * 1.5) * 0.08 +
                 Math.cos(y * 0.8 + elapsedTime * 1.2) * 0.06;

    // In PlaneGeometry, Z is perpendicular to the plane (the wave height)
    posAttr.setZ(i, wave);
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

/**
 * Updates boat bobbing and smooth transition lerps for all actor and boat meshes.
 * @param {number} delta - Frame delta time in seconds
 * @param {number} elapsedTime - Total elapsed clock time
 * @param {THREE.Mesh} boatMesh - The boat/kayak mesh
 * @param {Object} actorMeshes - Dictionary of actor meshes { man, fox, sheep1, sheep2 }
 * @param {GameState} gameState - The headless state machine
 */
export function updateAnimations(delta, elapsedTime, boatMesh, actorMeshes, gameState) {
  if (!boatMesh) return;

  // 1. Boat Target and Lerping
  const targetDockX = gameState.boatLocation === 'left' ? POSITIONS.BOAT_DOCK_LEFT.x : POSITIONS.BOAT_DOCK_RIGHT.x;

  // Smoothly lerp boat X position
  const boatSpeed = SPEED.BOAT;
  boatMesh.position.x += (targetDockX - boatMesh.position.x) * boatSpeed * delta;

  // 2. Kayak Micro-Bobbing (Sine wave math on water surface)
  // Only apply bobbing if the boat is close to its target dock or gently moving
  const bobY = POSITIONS.BOAT_DOCK_LEFT.y + Math.sin(elapsedTime * 2.2) * 0.022;
  const bobPitch = Math.sin(elapsedTime * 1.6) * 0.012; // Rotation on Z-axis
  const bobRoll = Math.cos(elapsedTime * 1.3) * 0.016;  // Rotation on X-axis

  boatMesh.position.y = bobY;
  boatMesh.rotation.z = bobPitch;
  boatMesh.rotation.x = bobRoll;

  // 3. Actors Position Updates and Hop Animations
  const actors = Object.keys(actorMeshes);

  actors.forEach(actor => {
    const mesh = actorMeshes[actor];
    if (!mesh) return;

    const currentLocation = gameState.actorPositions[actor];
    const animState = actorAnims[actor];

    // Detect state changes to trigger a "hop" animation
    if (currentLocation !== animState.prevLocation) {
      // Store current physical world position as the animation start position
      mesh.getWorldPosition(animState.startPos);
      animState.progress = 0.0;
      animState.animating = true;
      animState.prevLocation = currentLocation;
    }

    // Get final target world coordinate for this actor
    let targetX = 0, targetY = 0, targetZ = 0;

    if (currentLocation === 'boat') {
      // Position inside the boat (relative to boat's current position)
      // Shepherd (man) takes seat 1. Others take seat 2.
      const seatOffset = actor === 'man' ? BOAT_SEATS.seat1 : BOAT_SEATS.seat2;
      targetX = boatMesh.position.x + seatOffset.x;
      targetY = boatMesh.position.y + seatOffset.y;
      targetZ = boatMesh.position.z + seatOffset.z;
    } else {
      // Position on the respective land bank
      const bankPos = getBankPosition(actor, currentLocation);
      targetX = bankPos.x;
      targetY = bankPos.y;
      targetZ = bankPos.z;
    }

    if (animState.animating) {
      // Progress the hop animation
      animState.progress += delta * SPEED.ANIMATION;
      const t = Math.min(animState.progress, 1.0);

      // Linear interpolation for X and Z
      const currentX = THREE.MathUtils.lerp(animState.startPos.x, targetX, t);
      const currentZ = THREE.MathUtils.lerp(animState.startPos.z, targetZ, t);

      // Parabolic arc for Y (the vertical hop)
      const hopHeight = 1.1; // Max height of the jump
      const arcY = THREE.MathUtils.lerp(animState.startPos.y, targetY, t) + Math.sin(t * Math.PI) * hopHeight;

      mesh.position.set(currentX, arcY, currentZ);

      // Rotate slightly during jumping to make it look playful
      mesh.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, t) + (actor === 'sheep2' ? 0.3 : 0);

      if (t >= 1.0) {
        animState.animating = false;
      }
    } else {
      // No active animation, lock position to exact targets
      mesh.position.set(targetX, targetY, targetZ);

      // Face forward/symmetrical alignment on banks, or align with boat orientation
      if (currentLocation === 'boat') {
        mesh.rotation.y = actor === 'man' ? Math.PI / 2 : -Math.PI / 2; // Face forward in kayak
      } else {
        // Look slightly towards center
        mesh.rotation.y = currentLocation === 'left' ? 0 : Math.PI;
        // Keep lamb rotation offset
        if (actor === 'sheep2') mesh.rotation.y += 0.45;
      }
    }
  });
}

/**
 * Setup keyboard event listeners for Developer Demo Mode.
 * Allows testing boat transit and loading/unloading of individual actors.
 * @param {GameState} gameState - The game state instance
 * @param {Function} onStateChanged - Callback triggered on successful actions to refresh overlays
 */
export function setupKeyboardControls(gameState, onStateChanged) {
  if (!DEVELOPER_MODE) return;

  console.log('[Animation] Developer Demo Mode enabled. Controls:');
  console.log(' - Spacebar: Move Boat / Kayak');
  console.log(' - Key 1: Load/Unload Shepherd ("man")');
  console.log(' - Key 2: Load/Unload Fox');
  console.log(' - Key 3: Load/Unload Sheep 1');
  console.log(' - Key 4: Load/Unload Sheep 2');

  window.addEventListener('keydown', (e) => {
    let changed = false;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        console.log('[Demo] Attempting to move boat...');
        if (gameState.moveBoat()) {
          changed = true;
        }
        break;
      case 'Digit1':
      case 'Numpad1':
        console.log('[Demo] Attempting to load/unload Shepherd...');
        if (gameState.actorPositions.man === 'boat') {
          if (gameState.unloadFromBoat('man')) changed = true;
        } else {
          if (gameState.loadToBoat('man')) changed = true;
        }
        break;
      case 'Digit2':
      case 'Numpad2':
        console.log('[Demo] Attempting to load/unload Fox...');
        if (gameState.actorPositions.fox === 'boat') {
          if (gameState.unloadFromBoat('fox')) changed = true;
        } else {
          if (gameState.loadToBoat('fox')) changed = true;
        }
        break;
      case 'Digit3':
      case 'Numpad3':
        console.log('[Demo] Attempting to load/unload Sheep 1...');
        if (gameState.actorPositions.sheep1 === 'boat') {
          if (gameState.unloadFromBoat('sheep1')) changed = true;
        } else {
          if (gameState.loadToBoat('sheep1')) changed = true;
        }
        break;
      case 'Digit4':
      case 'Numpad4':
        console.log('[Demo] Attempting to load/unload Sheep 2...');
        if (gameState.actorPositions.sheep2 === 'boat') {
          if (gameState.unloadFromBoat('sheep2')) changed = true;
        } else {
          if (gameState.loadToBoat('sheep2')) changed = true;
        }
        break;
    }

    if (changed && typeof onStateChanged === 'function') {
      onStateChanged();
    }
  });
}
