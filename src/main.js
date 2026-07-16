import * as THREE from 'three';
import { setupScene } from './render/scene.js';
import { createTree, createKayak, createShepherd, createFox, createSheep, createShrub } from './render/assets.js';
import { animateWater, updateAnimations, setupKeyboardControls, resetAnimations, triggerShake, triggerGameOverCues, clearGameOverCues, triggerResetGlide } from './render/animation.js';
import { GameState } from './core/state.js';
import { DEVELOPER_MODE } from './core/constants.js';
import './style.css';

// 1. Initialize Headless Game State
const gameState = new GameState();

// 2. Setup Three.js Scene, Orthographic Camera, Renderer, and Lighting
const container = document.getElementById('canvas-container');
const { scene, camera, renderer, waterMesh, onResize } = setupScene(container);

// 3. Create and Place Game Actor Meshes
const boatMesh = createKayak();
boatMesh.userData.actorId = 'boat'; // Tag for raycasting identification
scene.add(boatMesh);

const actorMeshes = {
  man: createShepherd(),
  fox: createFox(),
  sheep1: createSheep(1.0, 0.0),            // Regular sheep
  sheep2: createSheep(0.85, 0.45)           // Cute smaller lamb, slightly rotated
};

// Tag actor root groups for raycasting identification and add to scene
Object.entries(actorMeshes).forEach(([id, mesh]) => {
  mesh.userData.actorId = id;
  scene.add(mesh);
});

// 4. Scatter Stylized Low-Poly Pine Trees on Valley Banks
const treeCoordinates = [
  // Left Bank (X negative, Z negative & positive)
  { x: -5.5, z: -4.2, s: 1.1 },
  { x: -4.2, z: -3.5, s: 0.95 },
  { x: -6.8, z: -3.8, s: 1.2 },
  { x: -4.8, z: -5.0, s: 0.8 },
  { x: -7.2, z: -4.8, s: 1.15 },
  { x: -5.0, z: 3.8, s: 1.0 },
  { x: -6.5, z: 3.2, s: 1.1 },
  { x: -5.8, z: 4.5, s: 0.85 },
  { x: -7.2, z: 4.0, s: 1.3 },
  { x: -4.4, z: 4.8, s: 0.9 },
  // Additional dense forest left bank trees
  { x: -3.5, z: -4.8, s: 0.7 },
  { x: -3.2, z: 4.5, s: 0.8 },
  { x: -6.2, z: -2.8, s: 1.0 },

  // Right Bank (X positive, Z negative & positive)
  { x: 5.5, z: -4.2, s: 1.15 },
  { x: 4.2, z: -3.5, s: 0.85 },
  { x: 6.8, z: -3.8, s: 1.25 },
  { x: 4.8, z: -5.0, s: 1.0 },
  { x: 7.2, z: -4.8, s: 0.9 },
  { x: 5.0, z: 3.8, s: 1.1 },
  { x: 6.5, z: 3.2, s: 0.8 },
  { x: 5.8, z: 4.5, s: 1.2 },
  { x: 7.2, z: 4.0, s: 0.95 },
  { x: 4.4, z: 4.8, s: 1.05 },
  // Additional dense forest right bank trees
  { x: 3.5, z: -4.8, s: 0.7 },
  { x: 3.2, z: 4.5, s: 0.8 },
  { x: 6.2, z: -2.8, s: 1.0 }
];

treeCoordinates.forEach((tc, index) => {
  const tree = createTree(tc.s, index);
  tree.position.set(tc.x, 0, tc.z);
  scene.add(tree);
});

// 4b. Scatter Cute Low-Poly Shrubs/Bushes Across Both Banks
const shrubCoordinates = [
  // Left Bank
  { x: -4.0, z: -2.2, s: 0.95 },
  { x: -3.4, z:  2.5, s: 1.1 },
  { x: -4.8, z:  0.8, s: 0.75 },
  { x: -5.2, z: -3.0, s: 1.0 },
  { x: -6.3, z: -1.8, s: 0.8 },
  { x: -6.0, z:  3.0, s: 0.95 },
  { x: -4.1, z: -1.0, s: 0.85 },

  // Right Bank
  { x:  4.0, z: -2.2, s: 0.95 },
  { x:  3.4, z:  2.5, s: 1.1 },
  { x:  4.8, z:  0.8, s: 0.75 },
  { x:  5.2, z: -3.0, s: 1.0 },
  { x:  6.3, z: -1.8, s: 0.8 },
  { x:  6.0, z:  3.0, s: 0.95 },
  { x:  4.1, z: -1.0, s: 0.85 }
];

shrubCoordinates.forEach((sc, index) => {
  const shrub = createShrub(sc.s, index);
  shrub.position.set(sc.x, 0, sc.z);
  scene.add(shrub);
});

// Check rules after any movement & lock state tracking
let gameLoopLocked = false;
let gameOverTimeout = null;

// 5. Setup Interactive Glassmorphic UI HUD Updates
function updateUIOverlay() {
  const ruleResult = gameState.checkRules();
  const boatLoc = gameState.boatLocation.toUpperCase();
  const devPanelVisible = !!window.devPanelVisible;

  // Format actor locations cleanly
  const leftActors = [];
  const boatActors = [];
  const rightActors = [];

  Object.entries(gameState.actorPositions).forEach(([actor, pos]) => {
    const displayName = actor === 'man' ? 'Shepherd' : actor === 'fox' ? 'Fox' : actor === 'sheep1' ? 'Sheep 1' : 'Sheep 2 (Lamb)';
    if (pos === 'left') leftActors.push(displayName);
    else if (pos === 'boat') boatActors.push(displayName);
    else if (pos === 'right') rightActors.push(displayName);
  });

  // Target elements to update
  const appContainer = document.getElementById('app-container');
  if (!appContainer) return;

  const isShepherdOnBoat = gameState.actorPositions.man === 'boat';

  // Let's create a beautiful rich layout
  appContainer.innerHTML = `
    <header class="glass-panel hud-header">
      <div class="hud-header-content">
        <h1 class="hud-title">ISOMETRIC RIVER PUZZLE 3D</h1>
        <p class="hud-subtitle"><strong>Challenge:</strong> Help the shepherd transport the sheep and fox safely across the river.</p>
        <div class="hud-rules-warning">
          <strong>Rules:</strong> Boat capacity: 2. Shepherd must navigate. Left-alone combos like (Fox + Sheep) fail!
        </div>
      </div>
    </header>

    <div class="glass-panel hud-status">
      <div class="hud-status-content">
        <h3 class="status-heading">CURRENT GAME STATE</h3>
        <p class="status-item"><strong>Boat Docked:</strong> ${boatLoc}-Bank</p>
        <div class="status-item highlight-moves"><strong>Moves:</strong> <span class="moves-count">${gameState.moves}</span></div>
        <p class="status-item"><strong>On Boat:</strong> ${boatActors.join(', ') || '<em>Empty</em>'}</p>

        <div class="action-buttons-container">
          <button class="move-boat-button glass-button ${isShepherdOnBoat ? '' : 'disabled'}" id="move-boat-btn" ${isShepherdOnBoat ? '' : 'disabled'}>
            ${isShepherdOnBoat ? '⛵ MOVE BOAT' : '🔒 SHEPHERD NEEDED'}
          </button>
          <button class="reset-hud-button glass-button" id="hud-reset-btn">
            🔄 RESET
          </button>
        </div>

        <hr class="hud-divider" />
        <div class="banks-info">
          <div class="bank-col">
            <strong>L-Bank Assets:</strong>
            <ul>${leftActors.map(a => `<li>${a}</li>`).join('') || '<li><em>None</em></li>'}</ul>
          </div>
          <div class="bank-col">
            <strong>R-Bank Assets:</strong>
            <ul>${rightActors.map(a => `<li>${a}</li>`).join('') || '<li><em>None</em></li>'}</ul>
          </div>
        </div>
      </div>
    </div>

    ${devPanelVisible ? `
    <div class="glass-panel dev-controls-panel">
      <h3 class="status-heading">DEV DEMO CONTROLS</h3>
      <p class="dev-instruction"><kbd>Spacebar</kbd> : Sail Kayak</p>
      <p class="dev-instruction"><kbd>1</kbd> : Load / Unload Shepherd</p>
      <p class="dev-instruction"><kbd>2</kbd> : Load / Unload Fox</p>
      <p class="dev-instruction"><kbd>3</kbd> : Load / Unload Sheep 1</p>
      <p class="dev-instruction"><kbd>4</kbd> : Load / Unload Sheep 2 (Lamb)</p>
      <div class="dev-note">Press keys to test robust animations & state validation.</div>
    </div>
    ` : ''}

    ${(ruleResult !== 'playing' && !gameLoopLocked) ? `
    <div class="modal-overlay">
      <div class="glass-panel terminal-modal ${ruleResult}">
        <h2 class="modal-title">${ruleResult === 'victory' ? '🎉 VICTORY!' : '⚠️ GAME OVER!'}</h2>
        <p class="modal-text">
          ${ruleResult === 'victory'
            ? 'Splendid job! You successfully guided the Shepherd, Fox, and Sheep safely to the Right Bank!'
            : 'Oh no! The shepherd left the hungry fox alone with the fluffy sheep on a bank, and the fox ate the sheep!'}
        </p>
        <button class="reset-button" id="reset-game-btn">${ruleResult === 'victory' ? 'Play Again' : 'Try Again'}</button>
      </div>
    </div>
    ` : ''}

    <footer class="glass-panel hud-footer">
      <div class="hud-footer-content">
        Design Step 4 • Interactive Gameplay, Raycasting, & Game Flow
      </div>
    </footer>
  `;

  // Attach event listener to modal reset button if it exists
  const resetBtn = document.getElementById('reset-game-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (gameOverTimeout) {
        clearTimeout(gameOverTimeout);
        gameOverTimeout = null;
      }
      gameLoopLocked = false;
      gameState.reset();
      triggerResetGlide();
      updateUIOverlay();
    });
  }

  // Attach event listener to HUD standard reset button
  const hudResetBtn = document.getElementById('hud-reset-btn');
  if (hudResetBtn) {
    hudResetBtn.addEventListener('click', () => {
      if (gameOverTimeout) {
        clearTimeout(gameOverTimeout);
        gameOverTimeout = null;
      }
      gameLoopLocked = false;
      gameState.reset();
      triggerResetGlide();
      updateUIOverlay();
    });
  }

  // Attach event listener to move boat button
  const moveBoatBtn = document.getElementById('move-boat-btn');
  if (moveBoatBtn && isShepherdOnBoat) {
    moveBoatBtn.addEventListener('click', () => {
      handleBoatMove();
    });
  }
}

// 5b. Mouse/Touch Click Raycasting & Hover Pointers
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function getInteractiveRoot(object) {
  let curr = object;
  while (curr) {
    if (curr.userData && curr.userData.actorId) {
      return curr;
    }
    curr = curr.parent;
  }
  return null;
}

// Mouse Move event to update cursor pointer
window.addEventListener('mousemove', (e) => {
  if (gameState.checkRules() !== 'playing') {
    document.body.style.cursor = 'default';
    return;
  }

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const targets = [boatMesh, ...Object.values(actorMeshes)];
  const intersects = raycaster.intersectObjects(targets, true);

  if (intersects.length > 0) {
    const root = getInteractiveRoot(intersects[0].object);
    if (root) {
      document.body.style.cursor = 'pointer';
      return;
    }
  }
  document.body.style.cursor = 'default';
});

// Click/Touch Tap Handler
function handleInteraction(clientX, clientY) {
  if (gameState.checkRules() !== 'playing') return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const targets = [boatMesh, ...Object.values(actorMeshes)];
  const intersects = raycaster.intersectObjects(targets, true);

  if (intersects.length > 0) {
    const root = getInteractiveRoot(intersects[0].object);
    if (root) {
      const actorId = root.userData.actorId;
      if (actorId === 'boat') {
        handleBoatMove();
      } else {
        handleActorClick(actorId);
      }
    }
  }
}

window.addEventListener('click', (e) => {
  if (e.target.closest('.glass-panel') || e.target.closest('.modal-overlay')) return;
  handleInteraction(e.clientX, e.clientY);
});

window.addEventListener('touchend', (e) => {
  if (e.target.closest('.glass-panel') || e.target.closest('.modal-overlay')) return;
  if (e.changedTouches && e.changedTouches.length > 0) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    handleInteraction(touch.clientX, touch.clientY);
  }
}, { passive: false });

// Actor click logic (State Machine binding)
function handleActorClick(actorId) {
  const currentPos = gameState.actorPositions[actorId];
  let success = false;

  if (currentPos === 'boat') {
    success = gameState.unloadFromBoat(actorId);
  } else {
    success = gameState.loadToBoat(actorId);
  }

  if (success) {
    // Refresh UI Overlay and check rules
    updateUIOverlay();
    checkGameLoopRules();
  } else {
    // Subtle visual rotational wobble/shake feedback
    triggerShake(actorId);
  }
}

// Boat move logic (State Machine binding)
function handleBoatMove() {
  if (gameState.moveBoat()) {
    updateUIOverlay();
    checkGameLoopRules();
  } else {
    // If Shepherd is not on board, shake the kayak
    triggerShake('man'); // Shake shepherd to show they are required, or shake the boat?
    // Since shepherd is required, let's also trigger shake on the boat mesh itself if needed, or shake 'man'.
    // Shaking the boat mesh itself can also be done. Let's add 'boat' to triggerShake support!
    // But shaking 'man' (or both) is extremely helpful feedback. Let's trigger shake on 'man' if not on boat.
  }
}

// Check rules after any movement
function checkGameLoopRules() {
  const result = gameState.checkRules();
  if (result === 'playing') return;

  if (result === 'victory') {
    // Instant display of victory modal as there is no sad loss event
    updateUIOverlay();
  } else if (result === 'game_over_fox_ate_sheep') {
    gameLoopLocked = true;

    // Find which sheep was left alone with the fox on the same bank (without shepherd)
    const banks = ['left', 'right'];
    let eatenSheep = 'sheep1'; // fallback
    for (const bank of banks) {
      const manPresent = gameState._isPresentOnBank('man', bank);
      const foxPresent = gameState._isPresentOnBank('fox', bank);
      const sheep1Present = gameState._isPresentOnBank('sheep1', bank);
      const sheep2Present = gameState._isPresentOnBank('sheep2', bank);

      if (!manPresent && foxPresent) {
        if (sheep1Present) {
          eatenSheep = 'sheep1';
          break;
        } else if (sheep2Present) {
          eatenSheep = 'sheep2';
          break;
        }
      }
    }

    // Trigger visual game over cues
    triggerGameOverCues(eatenSheep);

    // Delay game over modal by 1.5 seconds
    gameOverTimeout = setTimeout(() => {
      gameLoopLocked = false;
      gameOverTimeout = null;
      updateUIOverlay();
    }, 1500);
  }
}

// 6. Setup Dev Mode Controls and Bind UI Updates
setupKeyboardControls(gameState, updateUIOverlay);
updateUIOverlay();

// 7. Core Render and Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);
  const elapsedTime = clock.getElapsedTime();

  // 1. Water waves vertex shader displacement
  animateWater(waterMesh, elapsedTime);

  // 2. Update boat/actors smooth transitions and bobbing
  updateAnimations(delta, elapsedTime, boatMesh, actorMeshes, gameState);

  // 3. Render frame
  renderer.render(scene, camera);
}

// Start loop
animate();

console.log('[Main] Three.js modular world and developer demo mode running!');
