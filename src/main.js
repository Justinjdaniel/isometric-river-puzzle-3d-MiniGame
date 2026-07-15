import * as THREE from 'three';
import { setupScene } from './render/scene.js';
import { createTree, createKayak, createShepherd, createFox, createSheep } from './render/assets.js';
import { animateWater, updateAnimations, setupKeyboardControls, resetAnimations } from './render/animation.js';
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
scene.add(boatMesh);

const actorMeshes = {
  man: createShepherd(),
  fox: createFox(),
  sheep1: createSheep(1.0, 0.0),            // Regular sheep
  sheep2: createSheep(0.85, 0.45)           // Cute smaller lamb, slightly rotated
};

// Add actor meshes to scene (their initial coordinates are managed by the animation system)
Object.values(actorMeshes).forEach(mesh => scene.add(mesh));

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
  { x: 4.4, z: 4.8, s: 1.05 }
];

treeCoordinates.forEach(tc => {
  const tree = createTree(tc.s);
  tree.position.set(tc.x, 0, tc.z);
  scene.add(tree);
});

// 5. Setup Interactive Glassmorphic UI HUD Updates
function updateUIOverlay() {
  const ruleResult = gameState.checkRules();
  const boatLoc = gameState.boatLocation.toUpperCase();

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
        <p class="status-item"><strong>On Boat:</strong> ${boatActors.join(', ') || '<em>Empty</em>'}</p>
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

    ${DEVELOPER_MODE ? `
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

    ${ruleResult !== 'playing' ? `
    <div class="modal-overlay">
      <div class="glass-panel terminal-modal ${ruleResult}">
        <h2 class="modal-title">${ruleResult === 'victory' ? '🎉 VICTORY!' : '⚠️ GAME OVER!'}</h2>
        <p class="modal-text">
          ${ruleResult === 'victory'
            ? 'Splendid job! You successfully guided the Shepherd, Fox, and Sheep safely to the Right Bank!'
            : 'Oh no! The shepherd left the hungry fox alone with the fluffy sheep on a bank, and the fox ate the sheep!'}
        </p>
        <button class="reset-button" id="reset-game-btn">Try Again</button>
      </div>
    </div>
    ` : ''}

    <footer class="glass-panel hud-footer">
      <div class="hud-footer-content">
        Design Step 3 • Modular Scene, Low-Poly Assets & Fluid Parabolic Animations
      </div>
    </footer>
  `;

  // Attach event listener to reset button if it exists
  const resetBtn = document.getElementById('reset-game-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      gameState.reset();
      resetAnimations();
      updateUIOverlay();
    });
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
