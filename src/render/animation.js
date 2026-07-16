import * as THREE from 'three';
import { BOUNDS, POSITIONS, BOAT_SEATS, getBankPosition, DEVELOPER_MODE, SPEED } from '../core/constants.js';

// Track animation states for actors
// Each actor can have: { startPos: Vector3, startRotY: number, progress: number, animating: boolean, prevLocation: string }
const actorAnims = {
  man: { startPos: new THREE.Vector3(), startRotY: 0, progress: 1.0, animating: false, prevLocation: 'left' },
  fox: { startPos: new THREE.Vector3(), startRotY: 0, progress: 1.0, animating: false, prevLocation: 'left' },
  sheep1: { startPos: new THREE.Vector3(), startRotY: 0, progress: 1.0, animating: false, prevLocation: 'left' },
  sheep2: { startPos: new THREE.Vector3(), startRotY: 0, progress: 1.0, animating: false, prevLocation: 'left' }
};

/**
 * CPU-based water plane vertex wave displacement.
 * Deforms only the top face of the 3D Water BoxGeometry to maintain solid straight vertical cross-sections on the floating island.
 * @param {THREE.Mesh} waterMesh - The 3D water box mesh
 * @param {number} elapsedTime - The elapsed clock time
 */
export function animateWater(waterMesh, elapsedTime) {
  if (!waterMesh || !waterMesh.geometry) return;

  const geom = waterMesh.geometry;
  const posAttr = geom.attributes.position;
  const count = posAttr.count;

  const flowSpeed = 1.5; // Downstream velocity along Z-axis (longitudinal)

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);

    // In 3D BoxGeometry, the height is along local Y (1.4 units tall).
    // The top face vertices reside at local Y = +0.7.
    if (y > 0.6) {
      const baseLocalY = 0.7;
      // Waves flow downstream along the Z-axis by translating coordinates over time.
      const wave = Math.sin(x * 1.2 + (z - elapsedTime * flowSpeed) * 0.8) * 0.07 +
                   Math.cos((z - elapsedTime * flowSpeed * 1.4) * 1.2) * 0.04;

      posAttr.setY(i, baseLocalY + wave);
    }
  }

  posAttr.needsUpdate = true;
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
  // Only apply bobbing if the boat is close to its target dock or gently moving.
  // When rotated 90 degrees (aligned with Z-axis), bobPitch (pitching along the kayak length)
  // needs to affect rotation.x, and bobRoll (side-to-side rolling) should affect rotation.z.
  const bobY = POSITIONS.BOAT_DOCK_LEFT.y + Math.sin(elapsedTime * 2.2) * 0.022;
  const bobPitch = Math.sin(elapsedTime * 1.6) * 0.012; // Pitching along kayak length (local X, global Z)
  const bobRoll = Math.cos(elapsedTime * 1.3) * 0.016;  // Side-to-side roll (local Z, global X)

  boatMesh.position.y = bobY;

  // Since the kayak mesh has a default rotation of y = Math.PI / 2:
  // Local pitch is around Z-axis of unrotated mesh, now corresponds to X-axis rotation globally.
  // Local roll is around X-axis of unrotated mesh, now corresponds to Z-axis rotation globally.
  boatMesh.rotation.z = bobRoll;
  boatMesh.rotation.x = bobPitch;

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
      animState.startRotY = mesh.rotation.y;
      animState.progress = 0.0;
      animState.animating = true;
      animState.prevLocation = currentLocation;
    }

    // Get final target world coordinate for this actor
    let targetX = 0, targetY = 0, targetZ = 0;
    let targetRotY = 0;
    const rotationOffset = mesh.userData.rotationOffset || 0;

    if (currentLocation === 'boat') {
      // Position inside the boat (relative to boat's current position)
      // Shepherd (man) takes seat 1. Others take seat 2.
      const seatOffset = actor === 'man' ? BOAT_SEATS.seat1 : BOAT_SEATS.seat2;
      targetX = boatMesh.position.x + seatOffset.x;
      targetY = boatMesh.position.y + seatOffset.y;
      targetZ = boatMesh.position.z + seatOffset.z;
      targetRotY = actor === 'man' ? 0 : Math.PI; // Face forward/backward along kayak's Z-axis
    } else {
      // Position on the respective land bank
      const bankPos = getBankPosition(actor, currentLocation);
      targetX = bankPos.x;
      targetY = bankPos.y;
      targetZ = bankPos.z;
      targetRotY = (currentLocation === 'left' ? 0 : Math.PI) + rotationOffset;
    }

    // Lazily capture the original base scale of the actor mesh to avoid overwriting visual differences
    const baseScaleX = mesh.userData.baseScaleX || (mesh.userData.baseScaleX = mesh.scale.x);
    const baseScaleY = mesh.userData.baseScaleY || (mesh.userData.baseScaleY = mesh.scale.y);
    const baseScaleZ = mesh.userData.baseScaleZ || (mesh.userData.baseScaleZ = mesh.scale.z);

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

      // Squash and stretch scale deformation:
      // - Stretch in mid-air (t < 0.82): Y expands, X/Z contract
      // - Squash on impact landing (t >= 0.82): Y contracts, X/Z expand
      let scaleYMult = 1.0;
      if (t < 0.82) {
        const midAirT = t / 0.82;
        scaleYMult = 1.0 + Math.sin(midAirT * Math.PI) * 0.16; // Up to 1.16x stretching
      } else {
        const landingT = (t - 0.82) / 0.18;
        scaleYMult = 1.0 - Math.sin(landingT * Math.PI) * 0.16; // Down to 0.84x squashing
      }
      const scaleXZMult = 2.0 - scaleYMult; // Inversely scale to preserve volume

      mesh.scale.set(
        baseScaleX * scaleXZMult,
        baseScaleY * scaleYMult,
        baseScaleZ * scaleXZMult
      );

      // Smoothly interpolate to target rotation and add a playful spin in the middle
      mesh.rotation.y = THREE.MathUtils.lerp(animState.startRotY || 0, targetRotY, t) + Math.sin(t * Math.PI) * Math.PI * 2;

      if (t >= 1.0) {
        animState.animating = false;
        mesh.scale.set(baseScaleX, baseScaleY, baseScaleZ);
      }
    } else {
      // No active animation, lock position and scale to exact targets
      mesh.position.set(targetX, targetY, targetZ);
      mesh.rotation.y = targetRotY;
      mesh.scale.set(baseScaleX, baseScaleY, baseScaleZ);
    }
  });
}

/**
 * Resets all actor animation states to their default starting values.
 */
export function resetAnimations() {
  Object.keys(actorAnims).forEach(actor => {
    actorAnims[actor].progress = 1.0;
    actorAnims[actor].animating = false;
    actorAnims[actor].prevLocation = 'left';
    actorAnims[actor].startRotY = 0;
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
