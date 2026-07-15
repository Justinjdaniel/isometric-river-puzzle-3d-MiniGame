import * as THREE from 'three';
import { COLORS, BOUNDS } from '../core/constants.js';

export function setupScene(container) {
  // 1. Create Scene
  const scene = new THREE.Scene();
  // Deep, elegant cinematic background color
  scene.background = new THREE.Color(COLORS.SHADOW);

  // 2. Camera Setup (Orthographic Camera for Isometric Projection)
  const aspect = window.innerWidth / (window.innerHeight || 1);
  const d = 6.5; // Adjusted zoom/view size factor to fit the 16x12 floating chunk beautifully
  const camera = new THREE.OrthographicCamera(
    -d * aspect, d * aspect,
    d, -d,
    1, 1000
  );

  // Classic Isometric position
  camera.position.set(12, 12, 12);
  camera.lookAt(0, -0.5, 0);

  // 3. Renderer Setup
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
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
  const chunkW = BOUNDS.CHUNK_WIDTH;  // 16.0
  const chunkD = BOUNDS.CHUNK_DEPTH;  // 12.0
  const chunkH = BOUNDS.CHUNK_HEIGHT; // 3.0
  const riverW = BOUNDS.RIVER_WIDTH;  // 5.0 (X is -2.5 to 2.5)

  const bankWidth = (chunkW - riverW) / 2; // (16 - 5) / 2 = 5.5

  // Left Bank Box
  const leftBankGeom = new THREE.BoxGeometry(bankWidth, chunkH, chunkD);
  const leftBankMesh = new THREE.Mesh(leftBankGeom, landMaterials);
  // Center is X = - (riverW/2 + bankWidth/2) = - (2.5 + 2.75) = -5.25
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

  // Add some stylized low-poly rocks inside the riverbed and along the banks
  addStylizedRocks(scene, earthMaterial);

  // 7. Water Plane (Faceted for low-poly wave updates)
  const waterGeom = new THREE.PlaneGeometry(riverW, chunkD, 8, 16);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.WATER,
    flatShading: true,
    roughness: 0.12,
    metalness: 0.3, // Lowered metalness slightly so it reflects bright diffuse light and looks clean, vibrant turquoise
    transparent: true,
    opacity: 0.85
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMaterial);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(0, BOUNDS.WATER_Y, 0); // Y = -0.1
  waterMesh.receiveShadow = true;
  scene.add(waterMesh);

  // 8. Docks Setup
  const leftDock = createDock(true);
  const rightDock = createDock(false);
  scene.add(leftDock);
  scene.add(rightDock);

  // 9. Background Mountains Setup
  createBackgroundMountains(scene);

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

  // 1. Deck Plate (slightly floating over the water and land boundary)
  // Let's make it 1.4 units long on Z, 1.0 unit wide on X
  const deckGeom = new THREE.BoxGeometry(1.2, 0.08, 1.8);
  const deck = new THREE.Mesh(deckGeom, woodMaterial);
  // Dock sits exactly on the boundary, projecting slightly onto water.
  // Left bank land is X <= -2.5. Right bank land is X >= 2.5.
  // If left dock is at X = -2.5, and deck is 1.2 wide, we can offset it slightly to project:
  // Center it at X = -2.5 + 0.3 = -2.2 (so it extends from -2.8 to -1.6, projecting 0.9 units over water)
  // Or keep it simple: center at X = -2.3 for left, X = 2.3 for right
  const xOffset = isLeft ? 0.3 : -0.3;
  deck.position.set(dockX + xOffset, dockY, dockZ);
  deck.castShadow = true;
  deck.receiveShadow = true;
  dockGroup.add(deck);

  // 2. Add individual stylized planks to emphasize the low-poly wooden look
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

  // 3. Support Pillars (Piles)
  // Two pillars at the front of the dock, extending down into the riverbed
  const pillarGeom = new THREE.BoxGeometry(0.12, 1.6, 0.12);
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3d24, // Slightly darker wood
    flatShading: true,
    roughness: 0.95
  });

  // Placed at the water edge of the dock
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

  // Add decorative cylindrical post caps
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
 * Adds stylized rocks along the riverbed and banks
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

  rocksData.forEach(data => {
    // Low-poly rock shape using Dodecahedron Geometry
    const geom = new THREE.DodecahedronGeometry(0.5, 0); // No subdivisions = 12 flat faces
    const mesh = new THREE.Mesh(geom, rockMaterial);
    mesh.position.set(data.x, data.y, data.z);
    mesh.rotation.set(data.rx, data.ry, data.rz);
    mesh.scale.set(data.sx, data.sy, data.sz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });
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

  // Mountain data (x, y, z, height, radius, sides)
  const mountainList = [
    { x: -8.0, y: -1.0, z: -6.5, h: 8.5, r: 4.0 },
    { x: -3.5, y: -1.5, z: -7.0, h: 6.0, r: 3.0 },
    { x: 4.0, y: -1.0, z: -6.5, h: 9.0, r: 4.5 },
    { x: 8.5, y: -1.2, z: -6.8, h: 7.5, r: 3.5 }
  ];

  mountainList.forEach(m => {
    const group = new THREE.Group();

    // 1. Base Mountain Cone
    // No subdivisions on height, 5 or 6 radial segments for chunky look
    const geom = new THREE.ConeGeometry(m.r, m.h, 5);
    const mesh = new THREE.Mesh(geom, mountainMaterial);
    mesh.position.y = m.h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // 2. Snow Cap
    const capH = m.h * 0.35; // top 35% of mountain
    const capR = m.r * 0.35;
    const capGeom = new THREE.ConeGeometry(capR, capH, 5);
    const capMesh = new THREE.Mesh(capGeom, snowMaterial);
    capMesh.position.y = m.h - capH / 2 - 0.05; // Position exactly at peak
    capMesh.rotation.y = Math.PI / 5; // Rotate slightly for faceted overlap
    capMesh.castShadow = true;
    group.add(capMesh);

    group.position.set(m.x, m.y, m.z);
    scene.add(group);
  });
}
