import * as THREE from 'three';
import { setupScene, isPositionSafe } from './render/scene.js';
import { createTree, createDeciduousTree, createKayak, createShepherd, createFox, createSheep, createShrub, createCloud } from './render/assets.js';
import { animateWater, updateAnimations, setupKeyboardControls, resetAnimations, triggerShake, triggerGameOverCues, clearGameOverCues, triggerResetGlide } from './render/animation.js';
import { GameState } from './core/state.js';
import { DEVELOPER_MODE } from './core/constants.js';
import { soundManager } from './core/audio.js';
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

// 4. Procedurally Spawn Double Dense Stylized Low-Poly Trees (50/50 Conifer & Deciduous)
// Spawning ~52 trees total (~26 on each bank) to double tree density safely!
let treeCount = 0;
let treeAttempts = 0;
while (treeCount < 52 && treeAttempts < 400) {
  treeAttempts++;
  const isLeft = Math.random() > 0.5;
  // Generate coordinates directly within the valid safe land bounds ranges to reduce fail attempts
  const x = isLeft ? -9.75 + Math.random() * 6.35 : 3.4 + Math.random() * 6.35;
  const z = -7.05 + Math.random() * 14.1;

  if (isPositionSafe(x, z, 0.75)) {
    const scale = 0.8 + Math.random() * 0.45;
    // 50/50 mixture
    const isConifer = Math.random() > 0.5;
    const tree = isConifer ? createTree(scale, treeCount) : createDeciduousTree(scale, treeCount);
    tree.position.set(x, 0, z);
    scene.add(tree);
    treeCount++;
  }
}

// 4b. Procedurally Spawn Double Dense Low-Poly Shrubs/Bushes Across Both Banks
// Spawning ~28 shrubs total (~14 on each bank)
let shrubCount = 0;
let shrubAttempts = 0;
while (shrubCount < 28 && shrubAttempts < 400) {
  shrubAttempts++;
  const isLeft = Math.random() > 0.5;
  // Generate coordinates directly within the valid safe land bounds ranges to reduce fail attempts
  const x = isLeft ? -10.05 + Math.random() * 6.95 : 3.1 + Math.random() * 6.95;
  const z = -7.35 + Math.random() * 14.7;

  if (isPositionSafe(x, z, 0.45)) {
    const scale = 0.75 + Math.random() * 0.4;
    const shrub = createShrub(scale, shrubCount);
    shrub.position.set(x, 0, z);
    scene.add(shrub);
    shrubCount++;
  }
}

// 4c. Spawn Floating Clouds in the air near the mountain peaks
const clouds = [];
const numClouds = 4;
const cloudMinX = -11.0;
const cloudMaxX = 11.0;

for (let i = 0; i < numClouds; i++) {
  const cloudMesh = createCloud();

  // Distribute clouds along the X-axis initially
  const initialX = cloudMinX + ((cloudMaxX - cloudMinX) / numClouds) * i + (Math.random() - 0.5) * 2.0;
  // Position above the peaks (mountain peaks are ~6-10 units tall, so let's put clouds at Y = 5.5 to 7.8)
  const initialY = 5.5 + Math.random() * 2.3;
  // Position slightly behind the docks/valley (Z = -3.5 to -7.5)
  const initialZ = -3.5 - Math.random() * 4.0;

  cloudMesh.position.set(initialX, initialY, initialZ);

  // Set random cloud properties
  const scale = 0.8 + Math.random() * 0.6; // Scale between 0.8x and 1.4x
  cloudMesh.scale.set(scale, scale, scale);

  // Randomized gentle drift speeds (units per second)
  cloudMesh.userData = {
    driftSpeed: 0.15 + Math.random() * 0.25, // 0.15 to 0.40 units per second
    baseY: initialY,
    baseZ: initialZ
  };

  scene.add(cloudMesh);
  clouds.push(cloudMesh);
}

// Check rules after any movement & lock state tracking
let gameLoopLocked = false;
let gameOverTimeout = null;

// 5. Track Settings, Instructions, Stats & Rules modal states
let settingsOpen = false;
let instructionsOpen = false;
let statsModalOpen = false;
let rulesModalOpen = false;

// UI Minimization State tracking
const collapsedCards = {
  controls: false,
  layout: false
};

let uiInitialized = false;

function ensureUIShell() {
  if (uiInitialized) return;
  const appContainer = document.getElementById('app-container');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <!-- Top-Left Floating Title Header -->
    <div class="top-left-floating-header">
      <header class="glass-panel hud-card" style="padding: 12px 20px;">
        <h1 class="hud-title">RIVER PUZZLE 3D</h1>
        <p class="hud-subtitle">Elegant low-poly brainteaser</p>
      </header>
    </div>

    <!-- Mobile Top Navigation Bar -->
    <div class="mobile-top-bar">
      <button class="mobile-nav-btn glass-panel" id="mobile-rules-btn" title="View Rules">
        📖 Rules
      </button>
      <button class="mobile-nav-btn glass-panel" id="mobile-stats-btn" title="View Stats">
        📊 Stats
      </button>
      <button class="mobile-nav-btn glass-panel" id="mobile-settings-btn" title="Open Settings" aria-label="Open Settings Dialog">
        ⚙️
      </button>
    </div>

    <!-- Right Panel: Unified Stats, Game Controls, and Settings Card -->
    <div class="right-hud-panel">
      <!-- Card 1: Game Controls -->
      <div class="glass-panel hud-card card-collapsible" id="card-controls">
        <div class="card-header-row" id="header-controls">
          <div style="display: flex; align-items: center; gap: 12px;">
            <h3 class="status-heading" style="margin: 0;">🎮 GAME CONTROLS</h3>
            <button class="card-toggle-button" id="controls-collapse-btn" aria-expanded="true" aria-controls="card-controls-body" aria-label="Toggle Game Controls card content">
              <span class="collapse-icon" id="controls-collapse-icon" aria-hidden="true">▲</span>
            </button>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; pointer-events: auto;">
            <button class="settings-gear-btn" id="instructions-trigger-btn" title="View Mission & Rules" aria-label="View Mission and Rules">
              ℹ️
            </button>
            <button class="settings-gear-btn" id="settings-trigger-btn" title="Open Settings Dialog" aria-label="Open Settings Dialog">
              ⚙️
            </button>
          </div>
        </div>

        <div class="card-body-wrapper" id="card-controls-body">
          <p class="status-item"><strong>Boat Docked:</strong> <span id="val-boat-docked">LEFT-Bank</span></p>
          <p class="status-item"><strong>On Boat:</strong> <span id="val-boat-actors"><em>Empty</em></span></p>

          <div class="status-item highlight-moves">
            <strong>Moves:</strong>
            <span class="moves-count" id="val-moves-count">0</span>
          </div>

          <div class="action-buttons-container">
            <button class="move-boat-button glass-button" id="move-boat-btn"></button>
            <button class="reset-hud-button glass-button" id="hud-reset-btn" aria-label="Reset the game">
              🔄 RESET
            </button>
          </div>
        </div>
      </div>

      <!-- Card 2: Bank Layout -->
      <div class="glass-panel hud-card card-collapsible" id="card-layout">
        <div class="card-header-row" id="header-layout">
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <h3 class="status-heading" style="margin: 0;">🏝️ BANK LAYOUT</h3>
            <button class="card-toggle-button" id="layout-collapse-btn" aria-expanded="true" aria-controls="card-layout-body" aria-label="Toggle Bank Layout card content">
              <span class="collapse-icon" id="layout-collapse-icon" aria-hidden="true">▲</span>
            </button>
          </div>
        </div>

        <div class="card-body-wrapper" id="card-layout-body">
          <div class="banks-info">
            <div class="bank-col">
              <strong>Left Bank</strong>
              <ul id="val-left-bank-list"></ul>
            </div>
            <div class="bank-col">
              <strong>Right Bank</strong>
              <ul id="val-right-bank-list"></ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Dev Controls Container -->
      <div id="dev-controls-container"></div>
    </div>

    <!-- Pinned Mobile Bottom Bar with "Move Boat" and "Reset" -->
    <div class="mobile-bottom-bar">
      <button class="move-boat-button glass-button mobile-pill-btn" id="mobile-move-boat-btn"></button>
      <button class="reset-hud-button glass-button mobile-reset-btn" id="mobile-reset-btn">
        🔄 RESET
      </button>
    </div>

    <!-- Modals Container -->
    <div id="modal-container"></div>

    <footer class="glass-panel hud-footer">
      <div class="hud-footer-content">
        Visual & Spatial Polish Phase • Jules PR Reviewer v1.2.0
      </div>
    </footer>
  `;

  // Attach card collapse listeners exactly once
  const controlsCollapseBtn = document.getElementById('controls-collapse-btn');
  if (controlsCollapseBtn) {
    controlsCollapseBtn.addEventListener('click', () => {
      collapsedCards.controls = !collapsedCards.controls;
      updateUIOverlay();
    });
  }

  const layoutCollapseBtn = document.getElementById('layout-collapse-btn');
  if (layoutCollapseBtn) {
    layoutCollapseBtn.addEventListener('click', () => {
      collapsedCards.layout = !collapsedCards.layout;
      updateUIOverlay();
    });
  }

  // Attach Settings Toggle button listener exactly once
  const settingsBtn = document.getElementById('settings-trigger-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.init();
      settingsOpen = true;
      updateUIOverlay();
    });
  }

  // Attach Instructions Toggle button listener exactly once
  const instructionsBtn = document.getElementById('instructions-trigger-btn');
  if (instructionsBtn) {
    instructionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.init();
      instructionsOpen = true;
      updateUIOverlay();
    });
  }

  // Attach HUD standard reset button listener exactly once
  const hudResetBtn = document.getElementById('hud-reset-btn');
  if (hudResetBtn) {
    hudResetBtn.addEventListener('click', () => {
      resetGame();
    });
  }

  // Mobile navigation button listeners
  const mobRulesBtn = document.getElementById('mobile-rules-btn');
  if (mobRulesBtn) {
    mobRulesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.init();
      rulesModalOpen = true;
      updateUIOverlay();
    });
  }

  const mobStatsBtn = document.getElementById('mobile-stats-btn');
  if (mobStatsBtn) {
    mobStatsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.init();
      statsModalOpen = true;
      updateUIOverlay();
    });
  }

  const mobSettingsBtn = document.getElementById('mobile-settings-btn');
  if (mobSettingsBtn) {
    mobSettingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.init();
      settingsOpen = true;
      updateUIOverlay();
    });
  }

  // Attach move boat button listener exactly once
  const moveBoatBtn = document.getElementById('move-boat-btn');
  if (moveBoatBtn) {
    moveBoatBtn.addEventListener('click', () => {
      if (gameState.actorPositions.man === 'boat') {
        handleBoatMove();
      }
    });
  }

  // Attach mobile move boat button
  const mobMoveBoatBtn = document.getElementById('mobile-move-boat-btn');
  if (mobMoveBoatBtn) {
    mobMoveBoatBtn.addEventListener('click', () => {
      if (gameState.actorPositions.man === 'boat') {
        handleBoatMove();
      }
    });
  }

  // Attach mobile reset button
  const mobResetBtn = document.getElementById('mobile-reset-btn');
  if (mobResetBtn) {
    mobResetBtn.addEventListener('click', () => {
      resetGame();
    });
  }

  uiInitialized = true;
}

function resetGame() {
  soundManager.init();
  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
    gameOverTimeout = null;
  }
  gameLoopLocked = false;
  gameState.reset();
  triggerResetGlide();
  soundManager.playToggleOn();
  updateUIOverlay();
}

// Setup Interactive Glassmorphic UI HUD Updates - Targeted element updates to avoid performance lags
function updateUIOverlay() {
  ensureUIShell();

  const ruleResult = gameState.checkRules();
  const boatLoc = gameState.boatLocation.toUpperCase();
  const devPanelVisible = !!window.devPanelVisible;

  // Format actor locations cleanly
  const leftActors = [];
  const boatActors = [];
  const rightActors = [];

  Object.entries(gameState.actorPositions).forEach(([actor, pos]) => {
    const displayName = actor === 'man' ? 'Shepherd 👨‍🌾' : actor === 'fox' ? 'Fox 🦊' : actor === 'sheep1' ? 'Sheep 🐑' : 'Lamb 🐏';
    if (pos === 'left') leftActors.push(displayName);
    else if (pos === 'boat') boatActors.push(displayName);
    else if (pos === 'right') rightActors.push(displayName);
  });

  const isShepherdOnBoat = gameState.actorPositions.man === 'boat';

  // 1. Update dynamic text and state contents in Game Controls card
  const elBoatDocked = document.getElementById('val-boat-docked');
  if (elBoatDocked) {
    elBoatDocked.textContent = `${boatLoc}-Bank`;
  }

  const elBoatActors = document.getElementById('val-boat-actors');
  if (elBoatActors) {
    elBoatActors.innerHTML = boatActors.join(', ') || '<em>Empty</em>';
  }

  const elMovesCount = document.getElementById('val-moves-count');
  if (elMovesCount) {
    elMovesCount.textContent = gameState.moves;
  }

  const elMoveBoatBtn = document.getElementById('move-boat-btn');
  if (elMoveBoatBtn) {
    elMoveBoatBtn.className = `move-boat-button glass-button ${isShepherdOnBoat ? '' : 'disabled'}`;
    elMoveBoatBtn.textContent = isShepherdOnBoat ? '⛵ MOVE BOAT' : '🔒 SHEPHERD NEEDED';
    elMoveBoatBtn.disabled = !isShepherdOnBoat;
  }

  // Update mobile move boat button too
  const elMobMoveBoatBtn = document.getElementById('mobile-move-boat-btn');
  if (elMobMoveBoatBtn) {
    elMobMoveBoatBtn.className = `move-boat-button glass-button mobile-pill-btn ${isShepherdOnBoat ? '' : 'disabled'}`;
    elMobMoveBoatBtn.textContent = isShepherdOnBoat ? '⛵ MOVE BOAT' : '🔒 SHEPHERD NEEDED';
    elMobMoveBoatBtn.disabled = !isShepherdOnBoat;
  }

  // 2. Update Left and Right banks list in Bank Layout card
  const elLeftList = document.getElementById('val-left-bank-list');
  if (elLeftList) {
    elLeftList.innerHTML = leftActors.map(a => `<li>${a}</li>`).join('') || '<li><em>None</em></li>';
  }

  const elRightList = document.getElementById('val-right-bank-list');
  if (elRightList) {
    elRightList.innerHTML = rightActors.map(a => `<li>${a}</li>`).join('') || '<li><em>None</em></li>';
  }

  // 3. Update collapsible classes and icons dynamically
  const cardControls = document.getElementById('card-controls');
  const btnControls = document.getElementById('controls-collapse-btn');
  if (cardControls) {
    if (collapsedCards.controls) {
      cardControls.classList.add('collapsed');
      if (btnControls) btnControls.setAttribute('aria-expanded', 'false');
    } else {
      cardControls.classList.remove('collapsed');
      if (btnControls) btnControls.setAttribute('aria-expanded', 'true');
    }
  }

  const iconControls = document.getElementById('controls-collapse-icon');
  if (iconControls) {
    iconControls.textContent = collapsedCards.controls ? '▼' : '▲';
  }

  const cardLayout = document.getElementById('card-layout');
  const btnLayout = document.getElementById('layout-collapse-btn');
  if (cardLayout) {
    if (collapsedCards.layout) {
      cardLayout.classList.add('collapsed');
      if (btnLayout) btnLayout.setAttribute('aria-expanded', 'false');
    } else {
      cardLayout.classList.remove('collapsed');
      if (btnLayout) btnLayout.setAttribute('aria-expanded', 'true');
    }
  }

  const iconLayout = document.getElementById('layout-collapse-icon');
  if (iconLayout) {
    iconLayout.textContent = collapsedCards.layout ? '▼' : '▲';
  }

  // 4. Update Developer Controls panel visibility
  const elDevControls = document.getElementById('dev-controls-container');
  if (elDevControls) {
    if (devPanelVisible) {
      elDevControls.innerHTML = `
        <div class="glass-panel hud-card dev-controls-panel">
          <h3 class="status-heading" style="margin-bottom: 10px; color: #ff8800;">🛠️ DEV CONTROLS</h3>
          <p class="dev-instruction"><kbd>Spacebar</kbd> : Sail Kayak</p>
          <p class="dev-instruction"><kbd>1</kbd> : Load/Unload Shepherd</p>
          <p class="dev-instruction"><kbd>2</kbd> : Load/Unload Fox</p>
          <p class="dev-instruction"><kbd>3</kbd> : Load/Unload Sheep</p>
          <p class="dev-instruction"><kbd>4</kbd> : Load/Unload Lamb</p>
          <div class="dev-note">Hotkeys are active while dev panel is toggled (D key).</div>
        </div>
      `;
    } else {
      elDevControls.innerHTML = '';
    }
  }

  // 5. Render active Modals inside the modal container
  const elModalContainer = document.getElementById('modal-container');
  if (elModalContainer) {
    let modalHTML = '';
    if (settingsOpen) {
      modalHTML = `
        <div class="modal-overlay" id="settings-modal-overlay">
          <div class="glass-panel terminal-modal">
            <h2 class="modal-title" style="color: #014f86; margin-bottom: 20px;">⚙️ GAME SETTINGS</h2>
            <div class="settings-modal-content">
              <div class="settings-row">
                <span class="settings-label">
                  <span id="speaker-icon">${soundManager.enabled ? '🔊' : '🔇'}</span> Sound Effects
                </span>
                <label class="toggle-switch">
                  <input type="checkbox" id="sound-toggle-input" ${soundManager.enabled ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            <button class="reset-button" id="settings-close-btn">Close Settings</button>
          </div>
        </div>
      `;
    } else if (instructionsOpen || rulesModalOpen) {
      modalHTML = `
        <div class="modal-overlay" id="instructions-modal-overlay">
          <div class="glass-panel terminal-modal" style="width: 480px; text-align: left;">
            <h2 class="modal-title" style="color: #014f86; margin-bottom: 15px; text-align: center;">📜 MISSION & RULES</h2>
            <div class="instructions-card-content">
              <p>Help the <strong>Shepherd</strong> safely transport the hungry <strong>Fox</strong> and the two fluffy <strong>Sheep (Sheep and Lamb)</strong> across the river to the Right Bank.</p>
              <hr class="hud-divider" />
              <p><strong>Safety Rules:</strong></p>
              <ul class="rules-list">
                <li>The Shepherd must navigate the boat.</li>
                <li>The kayak can only hold <strong>at most 2 passengers</strong>.</li>
                <li>If left alone on a bank without the shepherd:
                  <ul>
                    <li>The Fox will eat the Sheep.</li>
                    <li>The Fox will eat the Lamb.</li>
                  </ul>
                  </li>
              </ul>
              <div class="hud-rules-warning" style="margin-top: 15px;">
                ⚠️ <strong>Warning:</strong> Left-alone combos like (Fox + Sheep) or (Fox + Lamb) trigger a GAME OVER!
              </div>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <button class="reset-button" id="instructions-close-btn">Close Instructions</button>
            </div>
          </div>
        </div>
      `;
    } else if (statsModalOpen) {
      modalHTML = `
        <div class="modal-overlay" id="stats-modal-overlay">
          <div class="glass-panel terminal-modal" style="width: 420px; text-align: left;">
            <h2 class="modal-title" style="color: #014f86; margin-bottom: 15px; text-align: center;">📊 GAME STATUS</h2>
            <div class="instructions-card-content">
              <p class="status-item"><strong>Boat Docked:</strong> ${boatLoc}-Bank</p>
              <p class="status-item"><strong>On Boat:</strong> ${boatActors.join(', ') || '<em>Empty</em>'}</p>
              <div class="status-item highlight-moves" style="margin: 12px 0;">
                <strong>Moves:</strong>
                <span class="moves-count">${gameState.moves}</span>
              </div>
              <hr class="hud-divider" />
              <div class="banks-info">
                <div class="bank-col">
                  <strong>Left Bank</strong>
                  <ul>${leftActors.map(a => `<li>${a}</li>`).join('') || '<li><em>None</em></li>'}</ul>
                </div>
                <div class="bank-col">
                  <strong>Right Bank</strong>
                  <ul>${rightActors.map(a => `<li>${a}</li>`).join('') || '<li><em>None</em></li>'}</ul>
                </div>
              </div>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <button class="reset-button" id="stats-close-btn">Close Stats</button>
            </div>
          </div>
        </div>
      `;
    } else if (ruleResult !== 'playing' && !gameLoopLocked) {
      modalHTML = `
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
      `;
    }

    elModalContainer.innerHTML = modalHTML;

    // Attach listeners dynamically to the elements inside the active modal
    if (settingsOpen) {
      const settingsCloseBtn = document.getElementById('settings-close-btn');
      if (settingsCloseBtn) {
        settingsCloseBtn.addEventListener('click', () => {
          settingsOpen = false;
          updateUIOverlay();
        });
      }

      const soundToggle = document.getElementById('sound-toggle-input');
      if (soundToggle) {
        soundToggle.addEventListener('change', () => {
          soundManager.toggleSound();
          const speaker = document.getElementById('speaker-icon');
          if (speaker) {
            speaker.textContent = soundManager.enabled ? '🔊' : '🔇';
          }
        });
      }
    } else if (instructionsOpen || rulesModalOpen) {
      const instructionsCloseBtn = document.getElementById('instructions-close-btn');
      if (instructionsCloseBtn) {
        instructionsCloseBtn.addEventListener('click', () => {
          instructionsOpen = false;
          rulesModalOpen = false;
          updateUIOverlay();
        });
      }
    } else if (statsModalOpen) {
      const statsCloseBtn = document.getElementById('stats-close-btn');
      if (statsCloseBtn) {
        statsCloseBtn.addEventListener('click', () => {
          statsModalOpen = false;
          updateUIOverlay();
        });
      }
    } else if (ruleResult !== 'playing' && !gameLoopLocked) {
      const resetBtn = document.getElementById('reset-game-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          soundManager.init();
          if (gameOverTimeout) {
            clearTimeout(gameOverTimeout);
            gameOverTimeout = null;
          }
          gameLoopLocked = false;
          gameState.reset();
          triggerResetGlide();
          soundManager.playToggleOn();
          updateUIOverlay();
        });
      }
    }
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
  soundManager.init(); // Initialize sound on interaction safely
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
  // Ignore clicks that originate on interactive UI elements
  if (e.target.closest('.glass-panel') || e.target.closest('.modal-overlay') || e.target.closest('.mobile-top-bar') || e.target.closest('.mobile-bottom-bar')) return;
  handleInteraction(e.clientX, e.clientY);
});

window.addEventListener('touchstart', (e) => {
  // Ignore touch events that originate on interactive UI elements
  if (e.target.closest('.glass-panel') || e.target.closest('.modal-overlay') || e.target.closest('.mobile-top-bar') || e.target.closest('.mobile-bottom-bar')) return;
  if (e.touches && e.touches.length > 0) {
    e.preventDefault(); // Stop overlapping synthesized mouse/click events immediately
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY);
  }
}, { passive: false });

// 5c. Mouse Wheel Zoom for Orthographic Camera
window.addEventListener('wheel', (e) => {
  // Prevent default scroll behavior inside canvas and restrict camera zoom
  if (e.target && typeof e.target.closest === 'function' && (e.target.closest('#canvas-container') || e.target.tagName === 'CANVAS')) {
    e.preventDefault();
  } else {
    return;
  }

  camera.zoom -= e.deltaY * 0.001;
  camera.zoom = Math.max(0.6, Math.min(1.8, camera.zoom));
  camera.updateProjectionMatrix();
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
    // Play distinctive character click and load/unload sound
    if (actorId === 'sheep1') {
      soundManager.playSheepBaa(false); // adult
    } else if (actorId === 'sheep2') {
      soundManager.playSheepBaa(true);  // lamb (baby)
    } else if (actorId === 'fox') {
      soundManager.playFoxRustle();
    } else if (actorId === 'man') {
      soundManager.playShepherdThud();
    } else {
      soundManager.playHop();
    }
    updateUIOverlay();
    checkGameLoopRules();
  } else {
    triggerShake(actorId);
    soundManager.playBuzzer();
  }
}

// Boat move logic (State Machine binding)
// Boat move logic (State Machine binding)
function handleBoatMove() {
  if (gameState.moveBoat()) {
    soundManager.playSplash();
    updateUIOverlay();
    checkGameLoopRules();
  } else {
    triggerShake('man');
    soundManager.playBuzzer();
  }
}

// Check rules after any movement
function checkGameLoopRules() {
  const result = gameState.checkRules();
  if (result === 'playing') return;

  if (result === 'victory') {
    soundManager.playVictory();
    updateUIOverlay();
  } else if (result === 'game_over_fox_ate_sheep') {
    soundManager.playGameOver();
    gameLoopLocked = true;

    // Find which sheep was left alone with the fox on the same bank
    const banks = ['left', 'right'];
    let eatenSheep = 'sheep1';
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

    triggerGameOverCues(eatenSheep);

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

  // 2. Gentle floating cloud X-axis drift and wrap-around
  const wrapLeft = -12.0;
  const wrapRight = 12.0;
  clouds.forEach(cloud => {
    cloud.position.x += cloud.userData.driftSpeed * delta;
    if (cloud.position.x > wrapRight) {
      cloud.position.x = wrapLeft;
      cloud.userData.baseY = 5.5 + Math.random() * 2.3;
      cloud.position.z = -3.5 - Math.random() * 4.0;
    }
    cloud.position.y = cloud.userData.baseY + Math.sin(elapsedTime * 0.8 + cloud.position.x) * 0.1;
  });

  // 3. Update boat/actors smooth transitions, bobbing, and kayak paddle rowing animation
  updateAnimations(delta, elapsedTime, boatMesh, actorMeshes, gameState);

  // 4. Render frame
  renderer.render(scene, camera);
}

// Start loop
animate();

console.log('[Main] Three.js modular world and developer demo mode running!');
