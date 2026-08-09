import * as THREE from 'three';
import { COLORS, BOUNDS } from '../core/constants.js';

/**
 * Checks if a coordinate is safe to spawn environmental assets
 */
export function isPositionSafe(x, z, r = 0.1, checkPlayArea = true) {
  if (Math.abs(x) < 2.65 + r) return false;
  if (Math.abs(x) > 10.5 - r) return false;
  if (Math.abs(z) > 7.8 - r) return false;

  if (checkPlayArea) {
    if (x >= -7.2 - r && x <= -2.0 && z >= -2.6 - r && z <= 2.6 + r) return false;
    if (x <= 7.2 + r && x >= 2.0 && z >= -2.6 - r && z <= 2.6 + r) return false;
  }

  const mountainList = [
    { x: -8.5, z: -4.5, r: 3.5 },
    { x: -4.2, z: -4.8, r: 2.8 },
    { x: 6.8, z: -5.8, r: 3.8 },
    { x: 10.5, z: -5.1, r: 3.4 }
  ];
  for (const m of mountainList) {
    const dx = x - m.x;
    const dz = z - m.z;
    const distSq = dx * dx + dz * dz;
    const limit = m.r + r - 0.2;
    if (distSq < limit * limit) return false;
  }

  return true;
}

export function setupScene(container) {
  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.FogExp2(COLORS.SKY_AMBIENT, 0.012);

  const aspect = window.innerWidth / (window.innerHeight || 1);
  const d = 7.8;
  const camera = new THREE.OrthographicCamera(
    -d * aspect, d * aspect,
    d, -d,
    1, 1000
  );

  camera.position.set(14.4, 14.4, 14.4);
  camera.lookAt(0, -0.5, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  if (container) {
    container.appendChild(renderer.domElement);
  }

  // Soft romantic magical twilight lighting setup
  const ambientLight = new THREE.AmbientLight(COLORS.SKY_AMBIENT, 0.5);
  scene.add(ambientLight);

  // Soft gold sunset light casting cozy shadows
  const directionalLight = new THREE.DirectionalLight(COLORS.SUNLIGHT, 1.4);
  directionalLight.position.set(14, 18, 10);
  directionalLight.castShadow = true;

  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 45;
  directionalLight.shadow.camera.left = -11;
  directionalLight.shadow.camera.right = 11;
  directionalLight.shadow.camera.top = 11;
  directionalLight.shadow.camera.bottom = -11;
  directionalLight.shadow.bias = -0.0002;
  scene.add(directionalLight);

  // Point light for glowing campfire / lantern aesthetic
  const pointLight = new THREE.PointLight(COLORS.LANTERN_GLOW, 2.5, 12, 0.5);
  pointLight.position.set(-4.0, 1.0, 0);
  scene.add(pointLight);

  const pointLightRight = new THREE.PointLight(COLORS.LANTERN_GLOW, 2.5, 12, 0.5);
  pointLightRight.position.set(4.0, 1.0, 0);
  scene.add(pointLightRight);

  // Smooth environmental land surfaces
  const landTopMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.BANK_LAND,
    flatShading: false,
    roughness: 0.8,
    metalness: 0.1
  });

  const earthMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.EARTH_DARK,
    flatShading: false,
    roughness: 0.85,
    metalness: 0.1
  });

  const landMaterials = [
    earthMaterial,      // +X
    earthMaterial,      // -X
    landTopMaterial,    // +Y
    earthMaterial,      // -Y
    earthMaterial,      // +Z
    earthMaterial       // -Z
  ];

  const riverbedMaterials = [
    earthMaterial,
    earthMaterial,
    earthMaterial,
    earthMaterial,
    earthMaterial,
    earthMaterial
  ];

  const chunkW = BOUNDS.CHUNK_WIDTH;
  const chunkD = BOUNDS.CHUNK_DEPTH;
  const chunkH = BOUNDS.CHUNK_HEIGHT;
  const riverW = BOUNDS.RIVER_WIDTH;

  const bankWidth = (chunkW - riverW) / 2;

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

  // Central Riverbed Box
  const riverbedH = chunkH / 2;
  const riverbedGeom = new THREE.BoxGeometry(riverW, riverbedH, chunkD);
  const riverbedMesh = new THREE.Mesh(riverbedGeom, riverbedMaterials);
  riverbedMesh.position.set(0, -chunkH + riverbedH / 2, 0);
  riverbedMesh.receiveShadow = true;
  riverbedMesh.castShadow = true;
  scene.add(riverbedMesh);

  // Shore transitions with high-quality material
  const sandMaterial = new THREE.MeshStandardMaterial({
    color: 0xccbba3, // Warm grey-sand twilight shore
    flatShading: false,
    roughness: 0.85,
    metalness: 0.05
  });

  const sandWidth = 0.20;
  const sandHeight = 0.12;
  const leftSandGeom = new THREE.BoxGeometry(sandWidth, sandHeight, chunkD);
  const leftSand = new THREE.Mesh(leftSandGeom, sandMaterial);
  leftSand.position.set(-2.55, -0.06, 0.0);
  leftSand.receiveShadow = true;
  leftSand.castShadow = true;
  scene.add(leftSand);

  const rightSandGeom = new THREE.BoxGeometry(sandWidth, sandHeight, chunkD);
  const rightSand = new THREE.Mesh(rightSandGeom, sandMaterial);
  rightSand.position.set(2.55, -0.06, 0.0);
  rightSand.receiveShadow = true;
  rightSand.castShadow = true;
  scene.add(rightSand);

  addStylizedRocks(scene, earthMaterial);
  addShorePebbles(scene);
  addGrassTufts(scene);
  addEarthStrata(scene);

  // Water 3D Box Volume (Highly detailed semi-reflective magical material)
  const waterGeom = new THREE.BoxGeometry(riverW, 1.4, chunkD, 16, 1, 32);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.WATER,
    flatShading: false,
    roughness: 0.05,
    metalness: 0.4,
    transparent: true,
    opacity: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMaterial);
  waterMesh.position.set(0, BOUNDS.WATER_Y - 0.7, 0);
  waterMesh.receiveShadow = true;
  scene.add(waterMesh);

  // Docks
  const leftDock = createDock(true);
  const rightDock = createDock(false);
  scene.add(leftDock);
  scene.add(rightDock);

  createBackgroundMountains(scene);
  addMountainFoothills(scene);

  // Fireflies scattering procedurally in twilight
  createFireflies(scene);

  const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight || 1;
    const newAspect = width / height;

    if (newAspect >= 1.2) {
      camera.left = -d * newAspect;
      camera.right = d * newAspect;
      camera.top = d;
      camera.bottom = -d;
    } else {
      const refAspect = 1.2;
      camera.left = -d * refAspect;
      camera.right = d * refAspect;
      camera.top = d * (refAspect / newAspect);
      camera.bottom = -d * (refAspect / newAspect);
    }
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  window.addEventListener('resize', onResize);
  onResize();

  return {
    scene,
    camera,
    renderer,
    waterMesh,
    directionalLight,
    onResize
  };
}

function createDock(isLeft) {
  const dockGroup = new THREE.Group();
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.DOCK_WOOD,
    flatShading: false,
    roughness: 0.7,
    metalness: 0.1
  });

  const dockX = isLeft ? -BOUNDS.DOCK_X : BOUNDS.DOCK_X;
  const dockZ = 0.0;
  const dockY = BOUNDS.DOCKS_Y;

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
    plank.rotation.y = (Math.random() - 0.5) * 0.05;
    plank.castShadow = true;
    plank.receiveShadow = true;
    dockGroup.add(plank);
  }

  // Pillars
  const pillarGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 12);
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3d24,
    flatShading: false,
    roughness: 0.8
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

  return dockGroup;
}

function addStylizedRocks(scene, baseMaterial) {
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x475569, // Soft slate-grey rocks
    flatShading: false,
    roughness: 0.7
  });

  const geom = new THREE.SphereGeometry(0.5, 16, 16);

  const rocksData = [
    { x: -0.5, y: -1.2, z: -3.0, rx: 0.4, ry: 1.2, rz: 0.5, sx: 0.8, sy: 0.6, sz: 0.8 },
    { x: 0.8, y: -1.4, z: 2.5, rx: -0.2, ry: 0.4, rz: 0.8, sx: 0.6, sy: 0.4, sz: 0.7 },
    { x: -2.6, y: -0.2, z: 4.5, rx: 0.1, ry: -0.5, rz: 0.2, sx: 0.9, sy: 0.8, sz: 0.9 },
    { x: -2.4, y: -0.3, z: -4.0, rx: 0.5, ry: 0.8, rz: -0.1, sx: 0.7, sy: 0.7, sz: 0.6 },
    { x: 2.5, y: -0.2, z: -2.0, rx: -0.3, ry: 0.2, rz: 0.4, sx: 0.8, sy: 0.9, sz: 0.8 },
    { x: 2.6, y: -0.1, z: 3.2, rx: 0.1, ry: -1.1, rz: -0.2, sx: 1.0, sy: 0.8, sz: 1.1 }
  ];

  rocksData.forEach(data => {
    const mesh = new THREE.Mesh(geom, rockMaterial);
    mesh.position.set(data.x, data.y, data.z);
    mesh.rotation.set(data.rx, data.ry, data.rz);
    mesh.scale.set(data.sx, data.sy, data.sz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });

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
 * Creates highly realistic, naturally sculpted mountains by deforming sphere/cylinder geometries
 * using a noise-like mathematical sine wave offset on the vertices to avoid clinical cones.
 */
function createBackgroundMountains(scene) {
  const mountainMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.MOUNTAIN,
    flatShading: false,
    roughness: 0.88,
    metalness: 0.1
  });

  const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0x93c5fd, // Soft baby-blue twilight snow caps
    flatShading: false,
    roughness: 0.8
  });

  const mountainList = [
    { x: -8.5, y: -1.0, z: -4.5, h: 9.5, r: 3.5 },
    { x: -4.2, y: -1.5, z: -4.8, h: 7.0, r: 2.8 },
    { x: 6.8, y: -1.0, z: -5.8, h: 10.5, r: 3.8 },
    { x: 10.5, y: -1.2, z: -5.1, h: 9.0, r: 3.4 }
  ];

  mountainList.forEach(m => {
    const group = new THREE.Group();

    // To make mountains look realistic, we use a ConeGeometry with custom vertex deformation
    const geom = new THREE.ConeGeometry(m.r, m.h, 32, 16);

    // Deform vertices with layers of sine waves to simulate ridges, peaks and natural rugged rock structures
    const posAttr = geom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);

      // Don't deform bottom base vertex row
      if (vy > -m.h / 2 + 0.1) {
        // Calculate current radius of cone at height y
        const currentRadius = Math.sqrt(vx * vx + vz * vz);
        if (currentRadius > 0.01) {
          const angle = Math.atan2(vz, vx);
          // Apply fractal noise-like wave offsets
          const noise = Math.sin(angle * 5) * 0.12 + Math.cos(vy * 3) * 0.08 + Math.sin(angle * 2 + vy) * 0.05;

          posAttr.setX(i, vx + (vx / currentRadius) * noise);
          posAttr.setZ(i, vz + (vz / currentRadius) * noise);
          posAttr.setY(i, vy + Math.sin(angle * 4) * 0.08);
        }
      }
    }
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, mountainMaterial);
    mesh.position.y = m.h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Snow cap matching the deformed mountain shape
    const capH = m.h * 0.35;
    const capR = m.r * 0.35;
    const capGeom = new THREE.ConeGeometry(capR, capH, 32, 8);

    const capPosAttr = capGeom.attributes.position;
    for (let i = 0; i < capPosAttr.count; i++) {
      const vx = capPosAttr.getX(i);
      const vy = capPosAttr.getY(i);
      const vz = capPosAttr.getZ(i);
      const currentRadius = Math.sqrt(vx * vx + vz * vz);
      if (currentRadius > 0.01) {
        const angle = Math.atan2(vz, vx);
        const noise = Math.sin(angle * 5) * 0.05 + Math.cos(vy * 3) * 0.03;
        capPosAttr.setX(i, vx + (vx / currentRadius) * noise);
        capPosAttr.setZ(i, vz + (vz / currentRadius) * noise);
      }
    }
    capGeom.computeVertexNormals();

    const capMesh = new THREE.Mesh(capGeom, snowMaterial);
    capMesh.position.y = m.h - capH / 2 - 0.05;
    capMesh.castShadow = true;
    group.add(capMesh);

    group.position.set(m.x, m.y, m.z);
    scene.add(group);
  });
}

function addShorePebbles(scene) {
  const pebbleMaterial = new THREE.MeshStandardMaterial({ color: 0x475569, flatShading: false, roughness: 0.8 });
  const geom = new THREE.SphereGeometry(1, 12, 12);

  let spawned = 0;
  let attempts = 0;
  while (spawned < 24 && attempts < 500) {
    attempts++;
    const isLeft = Math.random() > 0.5;
    const x = isLeft ? -2.55 + (Math.random() - 0.5) * 0.1 : 2.55 + (Math.random() - 0.5) * 0.1;
    const z = -7.8 + Math.random() * 15.6;

    if (Math.abs(z) > 2.65) {
      const mesh = new THREE.Mesh(geom, pebbleMaterial);
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

function addGrassTufts(scene) {
  const flowerMaterial = new THREE.MeshStandardMaterial({
    color: 0xfef08a, // Glowing yellow fairy flower
    flatShading: false,
    roughness: 0.3
  });

  const bladeGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8);
  const flowerGeom = new THREE.SphereGeometry(0.03, 8, 8);

  const scatterTuft = (x, z) => {
    const tuft = new THREE.Group();
    tuft.position.set(x, 0.05, z);

    const stalk = new THREE.Mesh(bladeGeom, new THREE.MeshStandardMaterial({ color: 0x0f766e, flatShading: false }));
    stalk.position.y = 0.11;
    stalk.rotation.x = 0.1;
    tuft.add(stalk);

    const bud = new THREE.Mesh(flowerGeom, flowerMaterial);
    bud.position.set(0, 0.22, 0.02);
    tuft.add(bud);

    const scale = 0.75 + Math.random() * 0.5;
    tuft.scale.set(scale, scale, scale);
    scene.add(tuft);
  };

  let spawned = 0;
  let attempts = 0;
  while (spawned < 100 && attempts < 1500) {
    attempts++;
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (2.65 + Math.random() * 7.85);
    const z = -7.8 + Math.random() * 15.6;

    if (isPositionSafe(x, z, 0.1, false)) {
      scatterTuft(x, z);
      spawned++;
    }
  }
}

function addEarthStrata(scene) {
  const strataMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.EARTH_DARK,
    flatShading: false,
    roughness: 0.9
  });

  const w = BOUNDS.CHUNK_WIDTH;
  const d = BOUNDS.CHUNK_DEPTH;
  const halfW = w / 2;
  const halfD = d / 2;
  const bankW = (w - BOUNDS.RIVER_WIDTH) / 2;
  const bankCenter = BOUNDS.RIVER_WIDTH / 2 + bankW / 2;

  const strataBands = [
    { x: -bankCenter, y: -1.2, z: halfD + 0.01, w: bankW, h: 0.15, d: 0.06, m: strataMaterial },
    { x: bankCenter,  y: -1.2, z: halfD + 0.01, w: bankW, h: 0.15, d: 0.06, m: strataMaterial },
  ];

  strataBands.forEach(band => {
    const geom = new THREE.BoxGeometry(band.w, band.h, band.d);
    const mesh = new THREE.Mesh(geom, band.m);
    mesh.position.set(band.x, band.y, band.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  });
}

function addMountainFoothills(scene) {
  const hillMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.BANK_LAND,
    flatShading: false,
    roughness: 0.8
  });

  const mudSideMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.EARTH_DARK,
    flatShading: false,
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
    { x:  8.4, y: -0.4, z: -5.4, w: 2.8, h: 0.8, d: 2.5 },
    { x:  6.2, y: -0.5, z: -5.8, w: 2.2, h: 0.6, d: 2.0 },
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

/**
 * Procedurally scatters magical glowing twilight fireflies.
 */
function createFireflies(scene) {
  const count = 15;
  const geom = new THREE.SphereGeometry(0.04, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: COLORS.FIREFLY });

  for (let i = 0; i < count; i++) {
    const f = new THREE.Mesh(geom, material);
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (3.0 + Math.random() * 5.0);
    const y = 0.5 + Math.random() * 1.5;
    const z = -6.0 + Math.random() * 12.0;

    f.position.set(x, y, z);
    scene.add(f);

    if (i < 4) {
      const flyLight = new THREE.PointLight(COLORS.FIREFLY, 1.2, 4, 1.0);
      f.add(flyLight);
    }
  }
}
