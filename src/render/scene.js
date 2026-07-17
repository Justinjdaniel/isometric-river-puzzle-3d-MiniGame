import * as THREE from 'three';
import { COLORS, BOUNDS } from '../core/constants.js';

/**
 * Checks if a coordinate is safe to spawn environmental assets (no clipping into water, stage zone, docks, or mountains)
 * @param {number} x
 * @param {number} z
 * @param {number} r - safety radius
 * @returns {boolean}
 */
export function isPositionSafe(x, z, r = 0.1, checkPlayArea = true) {
  // 1. River boundary check (must be securely on land)
  if (Math.abs(x) < 2.65 + r) return false;
  // Out of bounds check (keep inside chunks)
  if (Math.abs(x) > 10.5 - r) return false;
  if (Math.abs(z) > 7.8 - r) return false;

  // 2. Stage Zone (where characters start and walk, and docks sit)
  if (checkPlayArea) {
    // Left bank stage zone
    if (x >= -7.2 - r && x <= -2.0 && z >= -2.6 - r && z <= 2.6 + r) return false;
    // Right bank stage zone
    if (x <= 7.2 + r && x >= 2.0 && z >= -2.6 - r && z <= 2.6 + r) return false;
  }

  // 3. Mountain checks (avoid colliding inside mountain base radius)
  const mountainList = [
    { x: -8.5, z: -4.5, r: 3.5 },
    { x: -4.2, z: -4.8, r: 2.8 },
    { x: 5.2, z: -4.8, r: 4.0 },
    { x: 9.3, z: -5.1, r: 3.4 }
  ];
  for (const m of mountainList) {
    const dx = x - m.x;
    const dz = z - m.z;
    const distSq = dx * dx + dz * dz;
    const limit = m.r + r - 0.2;
    if (distSq < limit * limit) return false; // Allow slight foliage overlap but not trunk/base
  }

  return true;
}

export function setupScene(container) {
  // 1. Create Scene with subtle atmospheric fog and transparent background
  const scene = new THREE.Scene();
  scene.background = null; // Transparent scene background to let CSS gradient show through
  scene.fog = new THREE.FogExp2(COLORS.SKY_AMBIENT, 0.012);

  // 2. Camera Setup (Orthographic Camera for Isometric Projection)
  const aspect = window.innerWidth / (window.innerHeight || 1);
  const d = 7.8; // Adjusted zoom out factor by ~20% (from 6.5 to 7.8) to give entire island some breathing room
  const camera = new THREE.OrthographicCamera(
    -d * aspect, d * aspect,
    d, -d,
    1, 1000
  );

  // Classic Isometric position
  camera.position.set(14.4, 14.4, 14.4); // slightly adjusted for the larger zoom out to keep perfect proportions
  camera.lookAt(0, -0.5, 0);

  // 3. Renderer Setup
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0); // Set clearColor to fully transparent
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; // Make colors vibrant, brilliant, and properly color-managed

  if (container) {
    container.appendChild(renderer.domElement);
  } else {
    console.error('[Scene] Container element not found.');
  }

  // 4. Lighting Setup (Stylized Low-Poly Rig - Bright Sunny Day)
  const ambientLight = new THREE.AmbientLight(COLORS.SKY_AMBIENT, 0.95);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(COLORS.SUNLIGHT, 1.7);
  directionalLight.position.set(14, 22, 10);
  directionalLight.castShadow = true;

  // Shadow Map configuration for crisp low-poly shadows
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 45;
  directionalLight.shadow.camera.left = -11;
  directionalLight.shadow.camera.right = 11;
  directionalLight.shadow.camera.top = 11;
  directionalLight.shadow.camera.bottom = -11;
  directionalLight.shadow.bias = -0.0005;
  scene.add(directionalLight);

  // 5. Environmental Materials Setup (Standard flatShading)
  const landTopMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.BANK_LAND,
    flatShading: true,
    roughness: 0.8,
    metalness: 0.1
  });

  const earthMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.EARTH_DARK,
    flatShading: true,
    roughness: 0.9,
    metalness: 0.1
  });

  // Material array for the BoxGeometry (Right, Left, Top, Bottom, Front, Back)
  const landMaterials = [
    earthMaterial,      // +X
    earthMaterial,      // -X
    landTopMaterial,    // +Y (Top is green grass)
    earthMaterial,      // -Y
    earthMaterial,      // +Z
    earthMaterial       // -Z
  ];

  const riverbedMaterials = [
    earthMaterial,
    earthMaterial,
    earthMaterial,      // Top of riverbed under water is muddy/rocky earth
    earthMaterial,
    earthMaterial,
    earthMaterial
  ];

  // 6. Floating Chunk Base Landmasses
  const chunkW = BOUNDS.CHUNK_WIDTH;  // 22.0
  const chunkD = BOUNDS.CHUNK_DEPTH;  // 16.5
  const chunkH = BOUNDS.CHUNK_HEIGHT; // 3.0
  const riverW = BOUNDS.RIVER_WIDTH;  // 5.0 (X is -2.5 to 2.5)

  const bankWidth = (chunkW - riverW) / 2; // (22 - 5) / 2 = 8.5

  // Left Bank Box
  const leftBankGeom = new THREE.BoxGeometry(bankWidth, chunkH, chunkD);
  const leftBankMesh = new THREE.Mesh(leftBankGeom, landMaterials);
  leftBankMesh.position.set(-(riverW / 2 + bankWidth / 2), -chunkH / 2, 0);
  leftBankMesh.receiveShadow = true;
  leftBankMesh.castShadow = true;
  scene.add(leftBankMesh);

  // Right Bank Box
  const rightBankGeom = new THREE.BoxGeometry(bankWidth, chunkH, chunkD);
  const rightBankMesh = new THREE.Mesh(rightBankGeom, landMaterials);
  rightBankMesh.position.set(riverW / 2 + bankWidth / 2, -chunkH / 2, 0);
  rightBankMesh.receiveShadow = true;
  rightBankMesh.castShadow = true;
  scene.add(rightBankMesh);

  // Central Riverbed Box (Lowered to carve a channel)
  const riverbedH = chunkH / 2; // 1.5 units deep
  const riverbedGeom = new THREE.BoxGeometry(riverW, riverbedH, chunkD);
  const riverbedMesh = new THREE.Mesh(riverbedGeom, riverbedMaterials);
  riverbedMesh.position.set(0, -chunkH + riverbedH / 2, 0); // Y = -3.0 + 0.75 = -2.25
  riverbedMesh.receiveShadow = true;
  riverbedMesh.castShadow = true;
  scene.add(riverbedMesh);

  // 6b. Continuous sandy shoreline transition strip right where the meadow meets the riverbed,
  // sitting slightly below grass level at the water line.
  const sandMaterial = new THREE.MeshStandardMaterial({
    color: 0xe6cda3, // Beautiful warm yellow/tan sand
    flatShading: true,
    roughness: 0.95,
    metalness: 0.05
  });

  // Left Sand Strip
  const sandWidth = 0.20;
  const sandHeight = 0.12;
  const leftSandGeom = new THREE.BoxGeometry(sandWidth, sandHeight, chunkD);
  const leftSand = new THREE.Mesh(leftSandGeom, sandMaterial);
  leftSand.position.set(-2.55, -0.06, 0.0);
  leftSand.receiveShadow = true;
  leftSand.castShadow = true;
  scene.add(leftSand);

  // Right Sand Strip
  const rightSandGeom = new THREE.BoxGeometry(sandWidth, sandHeight, chunkD);
  const rightSand = new THREE.Mesh(rightSandGeom, sandMaterial);
  rightSand.position.set(2.55, -0.06, 0.0);
  rightSand.receiveShadow = true;
  rightSand.castShadow = true;
  scene.add(rightSand);

  // Add stylized low-poly rocks inside the riverbed and along the banks
  addStylizedRocks(scene, earthMaterial);

  // Add shore pebbles and gravel at the water's edge
  addShorePebbles(scene);

  // Add grass tufts on the land top
  addGrassTufts(scene);

  // Add rich mud strata and rocky layers to the vertical cutout faces
  addEarthStrata(scene);

  // 7. Water 3D Box Volume (semi-transparent, with top-face deforming vertex waves)
  const waterGeom = new THREE.BoxGeometry(riverW, 1.4, chunkD, 8, 1, 16);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.WATER,
    flatShading: true,
    roughness: 0.12,
    metalness: 0.3,
    transparent: true,
    opacity: 0.82
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMaterial);
  waterMesh.position.set(0, BOUNDS.WATER_Y - 0.7, 0);
  waterMesh.receiveShadow = true;
  scene.add(waterMesh);

  // 8. Docks Setup
  const leftDock = createDock(true);
  const rightDock = createDock(false);
  scene.add(leftDock);
  scene.add(rightDock);

  // 9. Background Mountains Setup with smooth sloped foothills transition
  createBackgroundMountains(scene);
  addMountainFoothills(scene);

  // 10. Resize Handler Configuration
  const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight || 1;
    const newAspect = width / height;

    camera.left = -d * newAspect;
    camera.right = d * newAspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  window.addEventListener('resize', onResize);

  return {
    scene,
    camera,
    renderer,
    waterMesh,
    directionalLight,
    onResize
  };
}

/**
 * Creates a stylized wooden dock
 * @param {boolean} isLeft - true for left bank dock, false for right bank
 * @returns {THREE.Group}
 */
function createDock(isLeft) {
  const dockGroup = new THREE.Group();
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.DOCK_WOOD,
    flatShading: true,
    roughness: 0.8,
    metalness: 0.05
  });

  const dockX = isLeft ? -BOUNDS.DOCK_X : BOUNDS.DOCK_X; // -2.5 or 2.5
  const dockZ = 0.0;
  const dockY = BOUNDS.DOCKS_Y; // 0.05

  const xOffset = isLeft ? 0.3 : -0.3;
  const deckGeom = new THREE.BoxGeometry(1.2, 0.08, 1.8);
  const deck = new THREE.Mesh(deckGeom, woodMaterial);
  deck.position.set(dockX + xOffset, dockY, dockZ);
  deck.castShadow = true;
  deck.receiveShadow = true;
  dockGroup.add(deck);

  // Planks
  const plankCount = 4;
  const plankSpacing = 0.42;
  const plankGeom = new THREE.BoxGeometry(1.25, 0.03, 0.34);
  for (let i = 0; i < plankCount; i++) {
    const plank = new THREE.Mesh(plankGeom, woodMaterial);
    const zPos = dockZ - 0.6 + i * plankSpacing;
    plank.position.set(dockX + xOffset, dockY + 0.04, zPos);
    plank.rotation.y = (Math.random() - 0.5) * 0.05; // Slightly randomized angle for rustic look
    plank.castShadow = true;
    plank.receiveShadow = true;
    dockGroup.add(plank);
  }

  // Support Pillars (Piles)
  const pillarGeom = new THREE.BoxGeometry(0.12, 1.6, 0.12);
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3d24, // Slightly darker wood
    flatShading: true,
    roughness: 0.95
  });

  const frontX = dockX + (isLeft ? 0.75 : -0.75);
  const pillarZ1 = dockZ - 0.7;
  const pillarZ2 = dockZ + 0.7;

  const pillar1 = new THREE.Mesh(pillarGeom, pillarMaterial);
  pillar1.position.set(frontX, dockY - 0.7, pillarZ1);
  pillar1.castShadow = true;
  pillar1.receiveShadow = true;
  dockGroup.add(pillar1);

  const pillar2 = new THREE.Mesh(pillarGeom, pillarMaterial);
  pillar2.position.set(frontX, dockY - 0.7, pillarZ2);
  pillar2.castShadow = true;
  pillar2.receiveShadow = true;
  dockGroup.add(pillar2);

  // Decorative cylindrical post caps
  const capGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 5);
  const cap1 = new THREE.Mesh(capGeom, pillarMaterial);
  cap1.position.set(frontX, dockY + 0.15, pillarZ1);
  cap1.castShadow = true;
  dockGroup.add(cap1);

  const cap2 = new THREE.Mesh(capGeom, pillarMaterial);
  cap2.position.set(frontX, dockY + 0.15, pillarZ2);
  cap2.castShadow = true;
  dockGroup.add(cap2);

  return dockGroup;
}

/**
 * Adds stylized rocks along the riverbed and banks (with double density)
 */
function addStylizedRocks(scene, baseMaterial) {
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a7a7a,
    flatShading: true,
    roughness: 0.85
  });

  const rocksData = [
    // Under-water riverbed rocks
    { x: -0.5, y: -1.2, z: -3.0, rx: 0.4, ry: 1.2, rz: 0.5, sx: 0.8, sy: 0.6, sz: 0.8 },
    { x: 0.8, y: -1.4, z: 2.5, rx: -0.2, ry: 0.4, rz: 0.8, sx: 0.6, sy: 0.4, sz: 0.7 },
    // Shore edge rocks
    { x: -2.6, y: -0.2, z: 4.5, rx: 0.1, ry: -0.5, rz: 0.2, sx: 0.9, sy: 0.8, sz: 0.9 },
    { x: -2.4, y: -0.3, z: -4.0, rx: 0.5, ry: 0.8, rz: -0.1, sx: 0.7, sy: 0.7, sz: 0.6 },
    { x: 2.5, y: -0.2, z: -2.0, rx: -0.3, ry: 0.2, rz: 0.4, sx: 0.8, sy: 0.9, sz: 0.8 },
    { x: 2.6, y: -0.1, z: 3.2, rx: 0.1, ry: -1.1, rz: -0.2, sx: 1.0, sy: 0.8, sz: 1.1 }
  ];

  const geom = new THREE.DodecahedronGeometry(0.5, 0);
  rocksData.forEach(data => {
    const mesh = new THREE.Mesh(geom, rockMaterial);
    mesh.position.set(data.x, data.y, data.z);
    mesh.rotation.set(data.rx, data.ry, data.rz);
    mesh.scale.set(data.sx, data.sy, data.sz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  // Spawn 6 more land rocks procedurally to double density
  let spawned = 0;
  let attempts = 0;
  while (spawned < 6 && attempts < 300) {
    attempts++;
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (3.0 + Math.random() * 7.0);
    const z = -7.8 + Math.random() * 15.6;

    if (isPositionSafe(x, z, 0.5)) {
      const mesh = new THREE.Mesh(geom, rockMaterial);
      mesh.position.set(x, -0.1, z);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = 0.6 + Math.random() * 0.5;
      mesh.scale.set(s, s * 0.8, s);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      spawned++;
    }
  }
}

/**
 * Creates low-poly sharp mountains along the back edge of the scene
 */
function createBackgroundMountains(scene) {
  const mountainMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.MOUNTAIN,
    flatShading: true,
    roughness: 0.9,
    metalness: 0.05
  });

  const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
    roughness: 0.8,
    metalness: 0.05
  });

  const mountainList = [
    { x: -8.5, y: -1.0, z: -4.5, h: 9.5, r: 3.5 },
    { x: -4.2, y: -1.5, z: -4.8, h: 7.0, r: 2.8 },
    { x: 5.2, y: -1.0, z: -4.8, h: 10.5, r: 4.0 },
    { x: 9.3, y: -1.2, z: -5.1, h: 9.0, r: 3.4 }
  ];

  mountainList.forEach(m => {
    const group = new THREE.Group();

    const geom = new THREE.ConeGeometry(m.r, m.h, 5);
    const mesh = new THREE.Mesh(geom, mountainMaterial);
    mesh.position.y = m.h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    const capH = m.h * 0.35; // top 35% of mountain
    const capR = m.r * 0.35;
    const capGeom = new THREE.ConeGeometry(capR, capH, 5);
    const capMesh = new THREE.Mesh(capGeom, snowMaterial);
    capMesh.position.y = m.h - capH / 2 - 0.05;
    capMesh.rotation.y = Math.PI / 5;
    capMesh.castShadow = true;
    group.add(capMesh);

    group.position.set(m.x, m.y, m.z);
    scene.add(group);
  });
}

/**
 * Adds shore pebbles and tiny rocks along the water's edge, avoiding the stage zone.
 */
function addShorePebbles(scene) {
  const pebbleMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a8a8a,
    flatShading: true,
    roughness: 0.9
  });
  const smallPebbleMaterial = new THREE.MeshStandardMaterial({
    color: 0x6e6e6e,
    flatShading: true,
    roughness: 0.9
  });

  const geom = new THREE.DodecahedronGeometry(1, 0);

  // We want to spawn 24 pebbles (doubled from 12)
  let spawned = 0;
  let attempts = 0;
  while (spawned < 24 && attempts < 500) {
    attempts++;
    const isLeft = Math.random() > 0.5;
    const x = isLeft ? -2.55 + (Math.random() - 0.5) * 0.1 : 2.55 + (Math.random() - 0.5) * 0.1;
    const z = -7.8 + Math.random() * 15.6;

    // Must be outside stage zone Z limits to keep character starting area completely clear
    if (Math.abs(z) > 2.65) {
      const mesh = new THREE.Mesh(geom, Math.random() > 0.5 ? pebbleMaterial : smallPebbleMaterial);
      mesh.position.set(x, -0.04, z);
      const s = 0.14 + Math.random() * 0.15;
      mesh.scale.set(s, s, s);
      mesh.rotation.set(Math.random() * 0.5, Math.random() * 2.0, Math.random() * 0.3);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      spawned++;
    }
  }
}

/**
 * Procedurally scatters grass/clover tufts on top of both banks (respecting safety bounds)
 */
function addGrassTufts(scene) {
  const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x7cfc00, // Brighter fresh grass green for outstanding contrast
    flatShading: true,
    roughness: 0.8
  });

  const bladeGeom = new THREE.BoxGeometry(0.04, 0.22, 0.04);

  const scatterTuft = (x, z) => {
    const tuft = new THREE.Group();
    tuft.position.set(x, 0.1, z);

    const b1 = new THREE.Mesh(bladeGeom, grassMaterial);
    b1.rotation.set(0.2, 0.1, 0.25);
    b1.position.set(-0.03, 0.08, 0);
    tuft.add(b1);

    const b2 = new THREE.Mesh(bladeGeom, grassMaterial);
    b2.rotation.set(-0.25, -0.15, -0.2);
    b2.position.set(0.03, 0.08, 0.02);
    tuft.add(b2);

    const b3 = new THREE.Mesh(bladeGeom, grassMaterial);
    b3.rotation.set(0.05, 0.3, -0.3);
    b3.position.set(0, 0.08, -0.03);
    tuft.add(b3);

    const scale = 0.75 + Math.random() * 0.5;
    tuft.scale.set(scale, scale, scale);
    tuft.rotation.y = Math.random() * Math.PI;

    scene.add(tuft);
  };

  // Generate 180 grass tufts procedurally (doubled density to make map lush, allowing grass in the stage zone)
  let spawned = 0;
  let attempts = 0;
  while (spawned < 180 && attempts < 2000) {
    attempts++;
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (2.65 + Math.random() * 7.85);
    const z = -7.8 + Math.random() * 15.6;

    // Grass does not collide, so pass checkPlayArea = false to decorate character spawn spots
    if (isPositionSafe(x, z, 0.1, false)) {
      scatterTuft(x, z);
      spawned++;
    }
  }
}

/**
 * Creates mud/rocky strata on visible faces
 */
function addEarthStrata(scene) {
  const strataMaterial = new THREE.MeshStandardMaterial({
    color: 0x58391b,
    flatShading: true,
    roughness: 0.95
  });
  const coalMaterial = new THREE.MeshStandardMaterial({
    color: 0x422c18,
    flatShading: true,
    roughness: 0.95
  });

  const w = BOUNDS.CHUNK_WIDTH;
  const d = BOUNDS.CHUNK_DEPTH;
  const halfW = w / 2;
  const halfD = d / 2;
  const bankW = (w - BOUNDS.RIVER_WIDTH) / 2;
  const bankCenter = BOUNDS.RIVER_WIDTH / 2 + bankW / 2;

  const strataBands = [
    { x: -bankCenter, y: -1.2, z: halfD + 0.01, w: bankW, h: 0.15, d: 0.06, m: strataMaterial },
    { x: -bankCenter, y: -2.2, z: halfD + 0.01, w: bankW, h: 0.18, d: 0.06, m: coalMaterial },
    { x: bankCenter,  y: -1.2, z: halfD + 0.01, w: bankW, h: 0.15, d: 0.06, m: strataMaterial },
    { x: bankCenter,  y: -2.2, z: halfD + 0.01, w: bankW, h: 0.18, d: 0.06, m: coalMaterial },
    { x: 0.0,   y: -2.6, z: halfD + 0.01, w: 5.0, h: 0.12, d: 0.06, m: coalMaterial },

    { x: -halfW - 0.01, y: -1.5, z: 0.0, w: 0.06, h: 0.22, d: d, m: strataMaterial },
    { x: -halfW - 0.01, y: -2.5, z: 2.0, w: 0.06, h: 0.15, d: d * 0.65,  m: coalMaterial },

    { x: halfW + 0.01,  y: -1.5, z: 0.0, w: 0.06, h: 0.22, d: d, m: strataMaterial },
    { x: halfW + 0.01,  y: -2.5, z: -2.0, w: 0.06, h: 0.15, d: d * 0.65,  m: coalMaterial }
  ];

  strataBands.forEach(band => {
    const geom = new THREE.BoxGeometry(band.w, band.h, band.d);
    const mesh = new THREE.Mesh(geom, band.m);
    mesh.position.set(band.x, band.y, band.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

  const clods = [
    { x: -bankCenter - 1.0, y: -1.6, z: halfD + 0.04, sx: 0.25, sy: 0.2, sz: 0.12 },
    { x: -bankCenter + 1.5, y: -0.8, z: halfD + 0.04, sx: 0.3,  sy: 0.3, sz: 0.1 },
    { x: -bankCenter + 0.2, y: -2.4, z: halfD + 0.04, sx: 0.2,  sy: 0.2, sz: 0.14 },
    { x:  bankCenter - 1.5, y: -1.8, z: halfD + 0.04, sx: 0.28, sy: 0.22, sz: 0.12 },
    { x:  bankCenter + 1.2, y: -0.9, z: halfD + 0.04, sx: 0.32, sy: 0.28, sz: 0.1 },
    { x:  bankCenter - 0.5, y: -2.3, z: halfD + 0.04, sx: 0.18, sy: 0.18, sz: 0.15 },

    { x: -halfW - 0.04, y: -1.0, z: -3.2, sx: 0.12, sy: 0.24, sz: 0.3 },
    { x: -halfW - 0.04, y: -2.1, z:  1.5, sx: 0.15, sy: 0.18, sz: 0.25 },
    { x: -halfW - 0.04, y: -0.6, z:  4.2, sx: 0.1,  sy: 0.3,  sz: 0.2 },

    { x:  halfW + 0.04, y: -1.1, z: -2.5, sx: 0.12, sy: 0.25, sz: 0.32 },
    { x:  halfW + 0.04, y: -2.3, z:  3.0, sx: 0.15, sy: 0.2,  sz: 0.22 },
    { x:  halfW + 0.04, y: -0.7, z: -4.8, sx: 0.1,  sy: 0.28, sz: 0.2 }
  ];

  const geom = new THREE.BoxGeometry(1, 1, 1);

  clods.forEach(c => {
    const mesh = new THREE.Mesh(geom, strataMaterial);
    mesh.position.set(c.x, c.y, c.z);
    mesh.scale.set(c.sx, c.sy, c.sz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });
}

/**
 * Creates sloping foothills
 */
function addMountainFoothills(scene) {
  const hillMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.BANK_LAND,
    flatShading: true,
    roughness: 0.8
  });

  const mudSideMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.EARTH_DARK,
    flatShading: true,
    roughness: 0.9
  });

  const hillMaterials = [
    mudSideMaterial,
    mudSideMaterial,
    hillMaterial,
    mudSideMaterial,
    mudSideMaterial,
    mudSideMaterial
  ];

  const hills = [
    { x: -6.5, y: -0.4, z: -5.2, w: 2.8, h: 0.8, d: 2.5 },
    { x: -4.2, y: -0.5, z: -5.4, w: 2.2, h: 0.6, d: 2.0 },
    { x:  7.2, y: -0.4, z: -5.4, w: 2.8, h: 0.8, d: 2.5 },
    { x:  4.9, y: -0.5, z: -5.6, w: 2.2, h: 0.6, d: 2.0 },
    { x:  0.0, y: -1.0, z: -5.8, w: 4.8, h: 0.5, d: 1.8 }
  ];

  hills.forEach(h => {
    const geom = new THREE.BoxGeometry(h.w, h.h, h.d);
    const mesh = new THREE.Mesh(geom, hillMaterials);
    mesh.position.set(h.x, h.y, h.z);
    mesh.rotation.x = -0.06;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });
}
