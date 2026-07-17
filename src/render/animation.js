import * as THREE from 'three';
import { BOUNDS, POSITIONS, BOAT_SEATS, getBankPosition, DEVELOPER_MODE, SPEED } from '../core/constants.js';

// Track animation states for actors
const actorAnims = {
  man: { startPos: new THREE.Vector3(), startRotY: 0, progress: 1.0, animating: false, prevLocation: 'left', shakeTime: 0, isGliding: false },
  fox: { startPos: new THREE.Vector3(), startRotY: 0, progress: 1.0, animating: false, prevLocation: 'left', shakeTime: 0, isGliding: false },
  sheep1: { startPos: new THREE.Vector3(), startRotY: 0, progress: 1.0, animating: false, prevLocation: 'left', shakeTime: 0, isGliding: false },
  sheep2: { startPos: new THREE.Vector3(), startRotY: 0, progress: 1.0, animating: false, prevLocation: 'left', shakeTime: 0, isGliding: false }
};

// Track game over visual cue states
let gameOverState = { active: false, eatenSheep: null };

/**
 * Triggers a subtle rotational shake animation on the actor.
 * @param {string} actor
 */
export function triggerShake(actor) {
  if (actorAnims[actor]) {
    actorAnims[actor].shakeTime = 0.4; // 0.4 seconds of high-frequency Y wobbling
  }
}

/**
 * Triggers the custom game over animations for Fox and Sheep.
 * @param {string} eatenSheep - 'sheep1' or 'sheep2'
 */
export function triggerGameOverCues(eatenSheep) {
  gameOverState.active = true;
  gameOverState.eatenSheep = eatenSheep;
}

/**
 * Clears any active game over visual cues.
 */
export function clearGameOverCues() {
  gameOverState.active = false;
  gameOverState.eatenSheep = null;
}

/**
 * Initiates a rapid reset glide transition back to the left bank.
 */
export function triggerResetGlide() {
  clearGameOverCues();
  Object.keys(actorAnims).forEach(actor => {
    actorAnims[actor].isGliding = actorAnims[actor].prevLocation !== 'left';
    actorAnims[actor].shakeTime = 0;
  });
}

/**
 * CPU-based water plane vertex wave displacement.
 * @param {THREE.Mesh} waterMesh
 * @param {number} elapsedTime
 */
export function animateWater(waterMesh, elapsedTime) {
  if (!waterMesh || !waterMesh.geometry) return;

  const geom = waterMesh.geometry;
  const posAttr = geom.attributes.position;
  const count = posAttr.count;

  const flowSpeed = 1.5;

  if (!geom.userData.originalY) {
    geom.userData.originalY = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      geom.userData.originalY[i] = posAttr.getY(i);
    }
  }

  const originalY = geom.userData.originalY;

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const y = originalY[i];
    const z = posAttr.getZ(i);

    if (y > 0.6) {
      const wave = Math.sin(x * 1.2 + (z - elapsedTime * flowSpeed) * 0.8) * 0.07 +
                   Math.cos((z - elapsedTime * flowSpeed * 1.4) * 1.2) * 0.04;

      posAttr.setY(i, y + wave);
    }
  }

  posAttr.needsUpdate = true;
}

/**
 * Updates boat bobbing, smooth transition lerps, and kayak paddle rowing animation.
 * @param {number} delta - Frame delta time in seconds
 * @param {number} elapsedTime - Total elapsed clock time
 * @param {THREE.Mesh} boatMesh - The boat/kayak mesh
 * @param {Object} actorMeshes - Dictionary of actor meshes
 * @param {GameState} gameState - The headless state machine
 */
export function updateAnimations(delta, elapsedTime, boatMesh, actorMeshes, gameState) {
  if (!boatMesh) return;

  // 1. Boat Target and Lerping
  const targetDockX = gameState.boatLocation === 'left' ? POSITIONS.BOAT_DOCK_LEFT.x : POSITIONS.BOAT_DOCK_RIGHT.x;

  // Smoothly lerp boat X position
  const boatSpeed = SPEED.BOAT;
  boatMesh.position.x += (targetDockX - boatMesh.position.x) * boatSpeed * delta;

  // 2. Kayak Micro-Bobbing
  const bobY = POSITIONS.BOAT_DOCK_LEFT.y + Math.sin(elapsedTime * 2.2) * 0.022;
  const bobPitch = Math.sin(elapsedTime * 1.6) * 0.012;
  const bobRoll = Math.cos(elapsedTime * 1.3) * 0.016;

  boatMesh.position.y = bobY;

  boatMesh.rotation.z = bobRoll;
  boatMesh.rotation.x = bobPitch;

  // 2b. Kayak Paddle Rowing Animation
  const paddle = boatMesh.getObjectByName('paddle');
  if (paddle) {
    const isTransiting = Math.abs(boatMesh.position.x - targetDockX) > 0.01;

    if (boatMesh.userData.rowingIntensity === undefined) {
      boatMesh.userData.rowingIntensity = 0.0;
    }

    if (isTransiting) {
      // Lerp intensity up to 1.0 when moving
      boatMesh.userData.rowingIntensity = THREE.MathUtils.lerp(boatMesh.userData.rowingIntensity, 1.0, 5.0 * delta);
    } else {
      // Lerp intensity down to 0.0 when stopped/docked
      boatMesh.userData.rowingIntensity = THREE.MathUtils.lerp(boatMesh.userData.rowingIntensity, 0.0, 5.0 * delta);
    }

    const intensity = boatMesh.userData.rowingIntensity;

    // Beautiful kayak rowing stroke motion (Pitch back-and-forth, Roll side-to-side)
    const rowSpeed = 9.0;
    const pitchVal = Math.sin(elapsedTime * rowSpeed) * 0.35;
    const rollVal = Math.cos(elapsedTime * rowSpeed) * 0.5;

    // Linearly interpolate the paddle's rotation between neutral (x=0, z=0) and rowing values
    paddle.rotation.x = THREE.MathUtils.lerp(0, pitchVal, intensity);
    paddle.rotation.z = THREE.MathUtils.lerp(0, rollVal, intensity);
    paddle.rotation.y = 0.15; // Maintain default horizontal slant
  }

  // 3. Actors Position Updates and Hop Animations
  const actors = Object.keys(actorMeshes);

  actors.forEach(actor => {
    const mesh = actorMeshes[actor];
    if (!mesh) return;

    const currentLocation = gameState.actorPositions[actor];
    const animState = actorAnims[actor];

    if (animState.shakeTime > 0) {
      animState.shakeTime -= delta;
      if (animState.shakeTime < 0) animState.shakeTime = 0;
    }

    if (currentLocation !== animState.prevLocation) {
      mesh.getWorldPosition(animState.startPos);
      animState.startRotY = mesh.rotation.y;
      animState.progress = 0.0;
      animState.animating = true;
      animState.prevLocation = currentLocation;
    }

    let targetX = 0, targetY = 0, targetZ = 0;
    let targetRotY = 0;
    const rotationOffset = mesh.userData.rotationOffset || 0;

    if (currentLocation === 'boat') {
      const seatOffset = actor === 'man' ? BOAT_SEATS.seat1 : BOAT_SEATS.seat2;
      targetX = boatMesh.position.x + seatOffset.x;
      targetY = boatMesh.position.y + seatOffset.y;
      targetZ = boatMesh.position.z + seatOffset.z;
      targetRotY = actor === 'man' ? 0 : Math.PI;
    } else {
      const bankPos = getBankPosition(actor, currentLocation);
      targetX = bankPos.x;
      targetY = bankPos.y;
      targetZ = bankPos.z;
      targetRotY = (currentLocation === 'left' ? 0 : Math.PI) + rotationOffset;
    }

    const baseScaleX = mesh.userData.baseScaleX || (mesh.userData.baseScaleX = mesh.scale.x);
    const baseScaleY = mesh.userData.baseScaleY || (mesh.userData.baseScaleY = mesh.scale.y);
    const baseScaleZ = mesh.userData.baseScaleZ || (mesh.userData.baseScaleZ = mesh.scale.z);

    if (animState.animating) {
      const speedMult = animState.isGliding ? 10.0 : SPEED.ANIMATION;
      animState.progress += delta * speedMult;
      const t = Math.min(animState.progress, 1.0);

      const currentX = THREE.MathUtils.lerp(animState.startPos.x, targetX, t);
      const currentZ = THREE.MathUtils.lerp(animState.startPos.z, targetZ, t);

      let currentY;
      if (animState.isGliding) {
        currentY = THREE.MathUtils.lerp(animState.startPos.y, targetY, t);
        mesh.scale.set(baseScaleX, baseScaleY, baseScaleZ);
        mesh.rotation.set(0, THREE.MathUtils.lerp(animState.startRotY || 0, targetRotY, t), 0);
      } else {
        const hopHeight = 1.1;
        currentY = THREE.MathUtils.lerp(animState.startPos.y, targetY, t) + Math.sin(t * Math.PI) * hopHeight;

        let scaleYMult = 1.0;
        if (t < 0.82) {
          const midAirT = t / 0.82;
          scaleYMult = 1.0 + Math.sin(midAirT * Math.PI) * 0.16;
        } else {
          const landingT = (t - 0.82) / 0.18;
          scaleYMult = 1.0 - Math.sin(landingT * Math.PI) * 0.16;
        }
        const scaleXZMult = 2.0 - scaleYMult;

        mesh.scale.set(
          baseScaleX * scaleXZMult,
          baseScaleY * scaleYMult,
          baseScaleZ * scaleXZMult
        );

        mesh.rotation.set(0, THREE.MathUtils.lerp(animState.startRotY || 0, targetRotY, t) + Math.sin(t * Math.PI) * Math.PI * 2, 0);
      }

      mesh.position.set(currentX, currentY, currentZ);

      if (t >= 1.0) {
        animState.animating = false;
        animState.isGliding = false;
        mesh.scale.set(baseScaleX, baseScaleY, baseScaleZ);
        mesh.rotation.set(0, targetRotY, 0);
      }
    } else {
      mesh.position.set(targetX, targetY, targetZ);
      mesh.rotation.set(0, targetRotY, 0);
      mesh.scale.set(baseScaleX, baseScaleY, baseScaleZ);

      if (animState.shakeTime > 0) {
        mesh.rotation.y = targetRotY + Math.sin(elapsedTime * 40) * 0.25;
      }

      if (gameOverState.active) {
        if (actor === 'fox') {
          mesh.rotation.z = 0.5 + Math.sin(elapsedTime * 10) * 0.08;
          mesh.position.y = targetY + 0.15;
        } else if (actor === gameOverState.eatenSheep) {
          mesh.rotation.y = targetRotY + elapsedTime * 15.0;
          mesh.position.y = targetY + Math.abs(Math.sin(elapsedTime * 20)) * 0.25;
        }
      }
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
 * @param {GameState} gameState - The game state instance
 * @param {Function} onStateChanged - Callback
 */
export function setupKeyboardControls(gameState, onStateChanged) {
  window.devPanelVisible = false;

  console.log('[Animation] Key listeners loaded:');
  console.log(' - Press "D" to toggle Developer Demo Controls panel & activate hotkeys');

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyD') {
      e.preventDefault();
      window.devPanelVisible = !window.devPanelVisible;
      console.log(`[Demo] Developer controls panel visibility: ${window.devPanelVisible}`);
      if (typeof onStateChanged === 'function') {
        onStateChanged();
      }
      return;
    }

    if (!window.devPanelVisible) return;

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
