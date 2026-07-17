import * as THREE from 'three';
import { COLORS, ROTATIONS } from '../core/constants.js';

// Three distinct shades of forest green for natural organic conifer trees
const TREE_GREENS = [
  COLORS.PINE_LIGHT,
  COLORS.PINE_CLASSIC,
  COLORS.PINE_DEEP
];

// Reusable/cached geometries and materials to avoid memory and garbage collection overhead
const sharedTrunkMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a2e1b,
  flatShading: true,
  roughness: 0.9
});

const sharedDeciduousTrunkMaterial = new THREE.MeshStandardMaterial({
  color: 0x5c3d24,
  flatShading: true,
  roughness: 0.9
});

const sharedPineConeMaterial = new THREE.MeshStandardMaterial({
  color: 0x3d2715,
  flatShading: true,
  roughness: 0.95
});

const sharedTrunkGeom = new THREE.CylinderGeometry(0.08, 0.16, 1.0, 8);
const sharedStumpGeom = new THREE.CylinderGeometry(0.03, 0.04, 0.25, 5);
const sharedPineConeGeom = new THREE.DodecahedronGeometry(0.07, 0);

// Foliage level geometries for Conifer trees
const levelGeometries = [
  new THREE.ConeGeometry(0.85, 0.9, 8),
  new THREE.ConeGeometry(0.70, 0.8, 8),
  new THREE.ConeGeometry(0.55, 0.7, 8),
  new THREE.ConeGeometry(0.40, 0.55, 8)
];

// Deciduous Tree Shared Assets
const sharedDeciduousTrunkGeom = new THREE.CylinderGeometry(0.1, 0.16, 1.1, 8);
const sharedBranchGeom = new THREE.CylinderGeometry(0.05, 0.07, 0.55, 6);
const sharedCanopyGeom = new THREE.DodecahedronGeometry(0.44, 0);

// Shared Foliage Materials
const sharedFoliageMaterials = TREE_GREENS.map(color => new THREE.MeshStandardMaterial({
  color,
  flatShading: true,
  roughness: 0.85
}));

/**
 * Creates a highly stylized, more detailed medium-poly conifer pine tree with custom green shades and smoother flat-shaded silhouette.
 * @param {number} scale - Scale multiplier for the tree
 * @param {number} shadeIndex - Optional index to pick a specific green shade
 * @returns {THREE.Group}
 */
export function createTree(scale = 1.0, shadeIndex = 0) {
  const treeGroup = new THREE.Group();

  // 1. Trunk (Brown cylinder) - tapered, 8 radial segments with a couple of branch stumps
  const trunk = new THREE.Mesh(sharedTrunkGeom, sharedTrunkMaterial);
  trunk.position.y = 0.5;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  // Tiny branch stumps for detailed texture
  const stump1 = new THREE.Mesh(sharedStumpGeom, sharedTrunkMaterial);
  stump1.position.set(0.1, 0.4, -0.05);
  stump1.rotation.z = Math.PI / 3;
  stump1.rotation.y = 0.5;
  treeGroup.add(stump1);

  const stump2 = new THREE.Mesh(sharedStumpGeom, sharedTrunkMaterial);
  stump2.position.set(-0.08, 0.6, 0.08);
  stump2.rotation.z = -Math.PI / 4;
  stump2.rotation.y = -0.8;
  treeGroup.add(stump2);

  // Pick a shared green foliage material
  const foliageMaterial = sharedFoliageMaterials[shadeIndex % sharedFoliageMaterials.length];

  // 2. Foliage (Stacked green cones with layered variations for extra medium-poly detail)
  const levels = [
    { geom: levelGeometries[0], y: 1.0 },
    { geom: levelGeometries[1], y: 1.55 },
    { geom: levelGeometries[2], y: 2.05 },
    { geom: levelGeometries[3], y: 2.45 }
  ];

  levels.forEach((lvl, idx) => {
    const cone = new THREE.Mesh(lvl.geom, foliageMaterial);
    cone.position.y = lvl.y;
    // Rotate layers slightly differently to create a organic jagged look
    cone.rotation.y = idx * 0.45 + (shadeIndex * 0.15);
    cone.castShadow = true;
    cone.receiveShadow = true;
    treeGroup.add(cone);
  });

  // 3. Add small hanging low-poly pine cones
  const coneOffsets = [
    { x: 0.45, y: 0.75, z: 0.2 },
    { x: -0.35, y: 1.25, z: -0.3 },
    { x: 0.25, y: 1.7, z: -0.35 }
  ];

  coneOffsets.forEach(pos => {
    const pCone = new THREE.Mesh(sharedPineConeGeom, sharedPineConeMaterial);
    pCone.position.set(pos.x, pos.y, pos.z);
    pCone.scale.set(1, 1.4, 1);
    treeGroup.add(pCone);
  });

  treeGroup.scale.set(scale, scale, scale);
  return treeGroup;
}

/**
 * Creates a deciduous tree with branchings and a multi-spherical lush canopy (mixed 50/50 in forest).
 * @param {number} scale
 * @param {number} shadeIndex
 * @returns {THREE.Group}
 */
export function createDeciduousTree(scale = 1.0, shadeIndex = 0) {
  const treeGroup = new THREE.Group();

  // 1. Trunk (Brown cylinder with branchings)
  const trunk = new THREE.Mesh(sharedDeciduousTrunkGeom, sharedDeciduousTrunkMaterial);
  trunk.position.y = 0.55;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  // Branches
  const branch1 = new THREE.Mesh(sharedBranchGeom, sharedDeciduousTrunkMaterial);
  branch1.position.set(0.18, 0.75, 0.1);
  branch1.rotation.z = Math.PI / 3.5;
  branch1.rotation.y = 0.4;
  branch1.castShadow = true;
  treeGroup.add(branch1);

  const branch2 = new THREE.Mesh(sharedBranchGeom, sharedDeciduousTrunkMaterial);
  branch2.position.set(-0.16, 0.85, -0.15);
  branch2.rotation.z = -Math.PI / 4;
  branch2.rotation.y = -0.5;
  branch2.castShadow = true;
  treeGroup.add(branch2);

  // Pick a green shade deterministically
  const foliageMaterial = sharedFoliageMaterials[(shadeIndex + 1) % sharedFoliageMaterials.length];

  // Canopy made of 6 intersecting low-poly spheres (Dodecahedrons for bubbly blocky look)
  const spheres = [
    { x: 0.0, y: 1.25, z: 0.0, s: 1.3 },     // Central core
    { x: -0.28, y: 1.45, z: 0.2, s: 0.9 },   // Top-Left bubble
    { x: 0.32, y: 1.4, z: -0.22, s: 0.95 },  // Top-Right bubble
    { x: 0.25, y: 1.05, z: 0.32, s: 0.85 },  // Front-Right bubble
    { x: -0.3, y: 1.1, z: -0.28, s: 0.8 },   // Back-Left bubble
    { x: 0.0, y: 1.65, z: 0.05, s: 0.85 }    // Top peak bubble
  ];

  spheres.forEach(sp => {
    const sphere = new THREE.Mesh(sharedCanopyGeom, foliageMaterial);
    sphere.position.set(sp.x, sp.y, sp.z);
    sphere.scale.set(sp.s, sp.s, sp.s);
    sphere.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    treeGroup.add(sphere);
  });

  treeGroup.scale.set(scale, scale, scale);
  return treeGroup;
}

/**
 * Creates an elegant, detailed, medium-poly orange kayak/canoe with curved tapered hull segments.
 * @returns {THREE.Group}
 */
export function createKayak() {
  const kayakGroup = new THREE.Group();

  const orangeMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.BOAT,
    flatShading: true,
    roughness: 0.35,
    metalness: 0.25
  });

  const darkWoodMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3d24,
    flatShading: true,
    roughness: 0.8
  });

  // Detailed, Curved and Tapered Canoe segments along X-axis
  // Instead of simple boxes, we create 5 tapered segmented boxes connected together
  const segments = [
    { x: 0.0, y: 0.08, z: 0.0, sx: 0.8, sy: 0.18, sz: 0.58 },     // Center floor
    { x: 0.6, y: 0.10, z: 0.0, sx: 0.5, sy: 0.18, sz: 0.48 },    // Front mid
    { x: -0.6, y: 0.10, z: 0.0, sx: 0.5, sy: 0.18, sz: 0.48 },   // Back mid
  ];

  segments.forEach(seg => {
    const geom = new THREE.BoxGeometry(seg.sx, seg.sy, seg.sz);
    const mesh = new THREE.Mesh(geom, orangeMaterial);
    mesh.position.set(seg.x, seg.y, seg.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    kayakGroup.add(mesh);
  });

  // Curved side gunwales
  const leftWallGeom = new THREE.BoxGeometry(1.4, 0.28, 0.06);
  const leftWall = new THREE.Mesh(leftWallGeom, orangeMaterial);
  leftWall.position.set(0, 0.16, 0.27);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  kayakGroup.add(leftWall);

  const rightWallGeom = new THREE.BoxGeometry(1.4, 0.28, 0.06);
  const rightWall = new THREE.Mesh(rightWallGeom, orangeMaterial);
  rightWall.position.set(0, 0.16, -0.27);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  kayakGroup.add(rightWall);

  // Elegant tapered pointy noses with metal/gold-trimmed stern caps
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, flatShading: true, roughness: 0.3, metalness: 0.8 });
  const noseConeGeom = new THREE.ConeGeometry(0.28, 0.7, 8);

  // Front Bow (Pointy Cone)
  const frontNose = new THREE.Mesh(noseConeGeom, orangeMaterial);
  frontNose.rotation.z = -Math.PI / 2; // Point forward along X
  frontNose.rotation.x = Math.PI / 8;
  frontNose.position.set(1.1, 0.16, 0);
  frontNose.scale.set(1, 1, 0.7);
  frontNose.castShadow = true;
  frontNose.receiveShadow = true;
  kayakGroup.add(frontNose);

  // Gold trim on Bow
  const bowCapGeom = new THREE.BoxGeometry(0.12, 0.15, 0.12);
  const bowCap = new THREE.Mesh(bowCapGeom, goldMaterial);
  bowCap.position.set(1.4, 0.16, 0);
  kayakGroup.add(bowCap);

  // Back Stern (Pointy Cone)
  const backNose = new THREE.Mesh(noseConeGeom, orangeMaterial);
  backNose.rotation.z = Math.PI / 2; // Point backward along X
  backNose.rotation.x = Math.PI / 8;
  backNose.position.set(-1.1, 0.16, 0);
  backNose.scale.set(1, 1, 0.7);
  backNose.castShadow = true;
  backNose.receiveShadow = true;
  kayakGroup.add(backNose);

  // Gold trim on Stern
  const sternCap = new THREE.Mesh(bowCapGeom, goldMaterial);
  sternCap.position.set(-1.4, 0.16, 0);
  kayakGroup.add(sternCap);

  // 4. Detailed Wooden Seats with comfortable curved backrests
  const seatGeom = new THREE.BoxGeometry(0.3, 0.06, 0.48);
  const backrestGeom = new THREE.BoxGeometry(0.04, 0.22, 0.44);

  // Front seat (Seat 1)
  const seat1Group = new THREE.Group();
  const seatBase1 = new THREE.Mesh(seatGeom, darkWoodMaterial);
  seatBase1.position.set(0, 0.1, 0);
  seatBase1.castShadow = true;
  seat1Group.add(seatBase1);

  const backrest1 = new THREE.Mesh(backrestGeom, darkWoodMaterial);
  backrest1.position.set(-0.14, 0.2, 0);
  backrest1.rotation.z = -0.15; // Comfy angle
  backrest1.castShadow = true;
  seat1Group.add(backrest1);

  seat1Group.position.set(-0.35, 0, 0);
  kayakGroup.add(seat1Group);

  // Back seat (Seat 2)
  const seat2Group = new THREE.Group();
  const seatBase2 = new THREE.Mesh(seatGeom, darkWoodMaterial);
  seatBase2.position.set(0, 0.1, 0);
  seatBase2.castShadow = true;
  seat2Group.add(seatBase2);

  const backrest2 = new THREE.Mesh(backrestGeom, darkWoodMaterial);
  backrest2.position.set(-0.14, 0.2, 0);
  backrest2.rotation.z = -0.15;
  backrest2.castShadow = true;
  seat2Group.add(backrest2);

  seat2Group.position.set(0.35, 0, 0);
  kayakGroup.add(seat2Group);

  // 5. Wooden Paddle (A dedicated Group clearly named 'paddle')
  const paddleGroup = new THREE.Group();
  paddleGroup.name = 'paddle';

  // Paddle Shaft (tapered cylindrical segments)
  const shaftGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.45, 8);
  const shaft = new THREE.Mesh(shaftGeom, darkWoodMaterial);
  shaft.rotation.z = Math.PI / 2; // Lie horizontal
  shaft.castShadow = true;
  paddleGroup.add(shaft);

  // Detail wrapped grips on the shaft
  const gripMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, flatShading: true, roughness: 0.85 });
  const gripGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 8);
  const leftGrip = new THREE.Mesh(gripGeom, gripMaterial);
  leftGrip.rotation.z = Math.PI / 2;
  leftGrip.position.set(-0.25, 0, 0);
  paddleGroup.add(leftGrip);

  const rightGrip = new THREE.Mesh(gripGeom, gripMaterial);
  rightGrip.rotation.z = Math.PI / 2;
  rightGrip.position.set(0.25, 0, 0);
  paddleGroup.add(rightGrip);

  // Paddle Blades (curved flared paddle blades)
  const bladeGeom = new THREE.BoxGeometry(0.3, 0.02, 0.14);
  const leftBlade = new THREE.Mesh(bladeGeom, orangeMaterial);
  leftBlade.position.set(-0.72, 0, 0);
  leftBlade.castShadow = true;
  paddleGroup.add(leftBlade);

  const rightBlade = new THREE.Mesh(bladeGeom, orangeMaterial);
  rightBlade.position.set(0.72, 0, 0);
  rightBlade.rotation.x = Math.PI / 2; // Feathered paddle blade angle
  rightBlade.castShadow = true;
  paddleGroup.add(rightBlade);

  paddleGroup.position.set(0, 0.35, 0);
  paddleGroup.rotation.y = 0.15; // Slightly slanted across kayak
  kayakGroup.add(paddleGroup);

  // Set default rotation to make the kayak parallel to the dock (aligned with Z-axis)
  kayakGroup.rotation.y = ROTATIONS.DOCKED_KAYAK.y;

  return kayakGroup;
}

/**
 * Creates the Shepherd (Man) - detailed, polished medium-poly character with clothing folds, facial structure, and jointed limbs.
 * @returns {THREE.Group}
 */
export function createShepherd() {
  const group = new THREE.Group();

  // Materials
  const shirtMaterial = new THREE.MeshStandardMaterial({ color: COLORS.MAN, flatShading: true, roughness: 0.65 });
  const shirtCuffMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.8 }); // white cuffs
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffd1a4, flatShading: true, roughness: 0.8 });
  const pantsMaterial = new THREE.MeshStandardMaterial({ color: 0x1c2833, flatShading: true, roughness: 0.8 });
  const bootsMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2715, flatShading: true, roughness: 0.95 });
  const bootsSoleMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, flatShading: true, roughness: 0.9 });
  const hatMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, flatShading: true, roughness: 0.8 });
  const leatherMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, flatShading: true, roughness: 0.9 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, flatShading: true, roughness: 0.3, metalness: 0.8 });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, flatShading: true, roughness: 0.5 });
  const beardMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3d24, flatShading: true, roughness: 0.9 });

  // 1. Boots (articulated with sole and heels)
  const leftBootGroup = new THREE.Group();
  leftBootGroup.position.set(-0.08, 0.0, 0.03);

  const soleGeom = new THREE.BoxGeometry(0.13, 0.03, 0.17);
  const leftSole = new THREE.Mesh(soleGeom, bootsSoleMaterial);
  leftSole.position.y = 0.015;
  leftBootGroup.add(leftSole);

  const bootGeom = new THREE.BoxGeometry(0.12, 0.12, 0.16);
  const leftBootMesh = new THREE.Mesh(bootGeom, bootsMaterial);
  leftBootMesh.position.y = 0.08;
  leftBootMesh.castShadow = true;
  leftBootGroup.add(leftBootMesh);

  group.add(leftBootGroup);

  const rightBootGroup = new THREE.Group();
  rightBootGroup.position.set(0.08, 0.0, 0.03);

  const rightSole = new THREE.Mesh(soleGeom, bootsSoleMaterial);
  rightSole.position.y = 0.015;
  rightBootGroup.add(rightSole);

  const rightBootMesh = new THREE.Mesh(bootGeom, bootsMaterial);
  rightBootMesh.position.y = 0.08;
  rightBootMesh.castShadow = true;
  rightBootGroup.add(rightBootMesh);

  group.add(rightBootGroup);

  // 2. Legs (Jointed shins, thighs, knee pad blocks representing clothing wrinkles)
  const thighGeom = new THREE.BoxGeometry(0.10, 0.16, 0.10);
  const shinGeom = new THREE.BoxGeometry(0.09, 0.16, 0.09);
  const kneeGeom = new THREE.BoxGeometry(0.11, 0.05, 0.11);

  // Left Leg
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.08, 0.12, 0);

  const leftShin = new THREE.Mesh(shinGeom, pantsMaterial);
  leftShin.position.y = 0.08;
  leftShin.castShadow = true;
  leftLegGroup.add(leftShin);

  const leftKnee = new THREE.Mesh(kneeGeom, pantsMaterial);
  leftKnee.position.y = 0.16;
  leftLegGroup.add(leftKnee);

  const leftThigh = new THREE.Mesh(thighGeom, pantsMaterial);
  leftThigh.position.y = 0.24;
  leftThigh.castShadow = true;
  leftLegGroup.add(leftThigh);

  group.add(leftLegGroup);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.08, 0.12, 0);

  const rightShin = new THREE.Mesh(shinGeom, pantsMaterial);
  rightShin.position.y = 0.08;
  rightShin.castShadow = true;
  rightLegGroup.add(rightShin);

  const rightKnee = new THREE.Mesh(kneeGeom, pantsMaterial);
  rightKnee.position.y = 0.16;
  rightLegGroup.add(rightKnee);

  const rightThigh = new THREE.Mesh(thighGeom, pantsMaterial);
  rightThigh.position.y = 0.24;
  rightThigh.castShadow = true;
  rightLegGroup.add(rightThigh);

  group.add(rightLegGroup);

  // 3. Torso (Coat folds, belt, golden buckle, detailed collar)
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.44, 0);

  // Torso base coat
  const coatGeom = new THREE.BoxGeometry(0.33, 0.45, 0.23);
  const coat = new THREE.Mesh(coatGeom, shirtMaterial);
  coat.position.y = 0.225;
  coat.castShadow = true;
  coat.receiveShadow = true;
  torsoGroup.add(coat);

  // Collar Fold Overlapping Triangles (using thin boxes)
  const collarGeom = new THREE.BoxGeometry(0.12, 0.08, 0.03);
  const leftCollar = new THREE.Mesh(collarGeom, shirtMaterial);
  leftCollar.position.set(-0.06, 0.4, 0.115);
  leftCollar.rotation.z = -0.3;
  leftCollar.rotation.y = 0.15;
  torsoGroup.add(leftCollar);

  const rightCollar = new THREE.Mesh(collarGeom, shirtMaterial);
  rightCollar.position.set(0.06, 0.4, 0.115);
  rightCollar.rotation.z = 0.3;
  rightCollar.rotation.y = -0.15;
  torsoGroup.add(rightCollar);

  // Belt around waist
  const beltGeom = new THREE.BoxGeometry(0.34, 0.06, 0.24);
  const belt = new THREE.Mesh(beltGeom, leatherMaterial);
  belt.position.y = 0.05;
  belt.castShadow = true;
  torsoGroup.add(belt);

  // Gold buckle
  const buckleGeom = new THREE.BoxGeometry(0.1, 0.08, 0.04);
  const buckle = new THREE.Mesh(buckleGeom, goldMaterial);
  buckle.position.set(0, 0.05, 0.12);
  buckle.castShadow = true;
  torsoGroup.add(buckle);

  group.add(torsoGroup);

  // 4. Arms (Jointed: shoulder, upper sleeve, lower sleeve, white cuffs, hands with thumbs)
  const upperArmGeom = new THREE.BoxGeometry(0.09, 0.18, 0.09);
  const lowerArmGeom = new THREE.BoxGeometry(0.08, 0.16, 0.08);
  const wristCuffGeom = new THREE.BoxGeometry(0.085, 0.03, 0.085);
  const thumbGeom = new THREE.BoxGeometry(0.03, 0.04, 0.03);

  // Left Arm Group (holds walking staff)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.21, 0.8, 0.02);

  const leftUpperArm = new THREE.Mesh(upperArmGeom, shirtMaterial);
  leftUpperArm.position.y = -0.09;
  leftUpperArm.castShadow = true;
  leftArmGroup.add(leftUpperArm);

  const leftLowerArm = new THREE.Mesh(lowerArmGeom, shirtMaterial);
  leftLowerArm.position.set(0, -0.24, 0.04);
  leftLowerArm.rotation.x = 0.4; // Reach forward a bit
  leftLowerArm.castShadow = true;
  leftArmGroup.add(leftLowerArm);

  const leftCuff = new THREE.Mesh(wristCuffGeom, shirtCuffMaterial);
  leftCuff.position.set(0, -0.32, 0.07);
  leftCuff.rotation.x = 0.4;
  leftArmGroup.add(leftCuff);

  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), skinMaterial);
  leftHand.position.set(0, -0.36, 0.09);
  leftHand.rotation.x = 0.4;
  leftHand.castShadow = true;
  leftArmGroup.add(leftHand);

  // Left Thumb
  const leftThumb = new THREE.Mesh(thumbGeom, skinMaterial);
  leftThumb.position.set(0.04, -0.35, 0.1);
  leftArmGroup.add(leftThumb);

  group.add(leftArmGroup);

  // Right Arm Group
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.21, 0.8, 0.02);

  const rightUpperArm = new THREE.Mesh(upperArmGeom, shirtMaterial);
  rightUpperArm.position.y = -0.09;
  rightUpperArm.castShadow = true;
  rightArmGroup.add(rightUpperArm);

  const rightLowerArm = new THREE.Mesh(lowerArmGeom, shirtMaterial);
  rightLowerArm.position.set(0, -0.24, -0.02);
  rightLowerArm.rotation.x = -0.2; // Relaxed back
  rightLowerArm.castShadow = true;
  rightArmGroup.add(rightLowerArm);

  const rightCuff = new THREE.Mesh(wristCuffGeom, shirtCuffMaterial);
  rightCuff.position.set(0, -0.32, -0.03);
  rightCuff.rotation.x = -0.2;
  rightArmGroup.add(rightCuff);

  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), skinMaterial);
  rightHand.position.set(0, -0.36, -0.04);
  rightHand.rotation.x = -0.2;
  rightHand.castShadow = true;
  rightArmGroup.add(rightHand);

  // Right Thumb
  const rightThumb = new THREE.Mesh(thumbGeom, skinMaterial);
  rightThumb.position.set(-0.04, -0.35, -0.03);
  rightArmGroup.add(rightThumb);

  group.add(rightArmGroup);

  // Walking Staff (Cylindrical staff with curved gold knob/handle)
  const staffMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3d24, flatShading: true, roughness: 0.95 });
  const staffGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.85, 6);
  const staff = new THREE.Mesh(staffGeom, staffMaterial);
  staff.position.set(-0.21, 0.45, 0.14);
  staff.rotation.x = 0.2;
  staff.castShadow = true;
  group.add(staff);

  // Gold staff knob
  const knobGeom = new THREE.DodecahedronGeometry(0.04, 0);
  const staffKnob = new THREE.Mesh(knobGeom, goldMaterial);
  staffKnob.position.set(-0.21, 0.88, 0.23);
  group.add(staffKnob);

  // 5. Head & Face (Defined cheeks, blocky nose, cute ears, structured beard, textured hair)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.9, 0);

  // Head Base
  const headGeom = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  const head = new THREE.Mesh(headGeom, skinMaterial);
  head.castShadow = true;
  headGroup.add(head);

  // Cheeks blocks for structure
  const cheekGeom = new THREE.BoxGeometry(0.03, 0.08, 0.08);
  const leftCheek = new THREE.Mesh(cheekGeom, skinMaterial);
  leftCheek.position.set(-0.115, -0.02, 0.02);
  headGroup.add(leftCheek);

  const rightCheek = new THREE.Mesh(cheekGeom, skinMaterial);
  rightCheek.position.set(0.115, -0.02, 0.02);
  headGroup.add(rightCheek);

  // Cute blocky Nose
  const noseGeom = new THREE.BoxGeometry(0.05, 0.05, 0.05);
  const nose = new THREE.Mesh(noseGeom, skinMaterial);
  nose.position.set(0, 0.01, 0.12);
  nose.castShadow = true;
  headGroup.add(nose);

  // Structured Beard (below nose, wrapping around sides)
  const beardGeom = new THREE.BoxGeometry(0.23, 0.08, 0.12);
  const beard = new THREE.Mesh(beardGeom, beardMaterial);
  beard.position.set(0, -0.08, 0.06);
  beard.castShadow = true;
  headGroup.add(beard);

  const goateeGeom = new THREE.BoxGeometry(0.08, 0.08, 0.06);
  const goatee = new THREE.Mesh(goateeGeom, beardMaterial);
  goatee.position.set(0, -0.12, 0.12);
  headGroup.add(goatee);

  // Beady dark eyes with eyelids
  const eyeGeom = new THREE.BoxGeometry(0.04, 0.04, 0.015);
  const leftEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  leftEye.position.set(-0.06, 0.04, 0.111);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  rightEye.position.set(0.06, 0.04, 0.111);
  headGroup.add(rightEye);

  // Eyebrows
  const browGeom = new THREE.BoxGeometry(0.06, 0.015, 0.015);
  const leftBrow = new THREE.Mesh(browGeom, beardMaterial);
  leftBrow.position.set(-0.06, 0.075, 0.113);
  headGroup.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeom, beardMaterial);
  rightBrow.position.set(0.06, 0.075, 0.113);
  headGroup.add(rightBrow);

  // Ears (Small skin boxes)
  const earGeom = new THREE.BoxGeometry(0.03, 0.06, 0.04);
  const leftEar = new THREE.Mesh(earGeom, skinMaterial);
  leftEar.position.set(-0.125, 0.01, -0.01);
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeom, skinMaterial);
  rightEar.position.set(0.125, 0.01, -0.01);
  headGroup.add(rightEar);

  // Textured Hair (segmented locks on the back & top sideburns)
  const hairGeom = new THREE.BoxGeometry(0.24, 0.12, 0.12);
  const hairBack = new THREE.Mesh(hairGeom, beardMaterial);
  hairBack.position.set(0, 0.04, -0.07);
  hairBack.castShadow = true;
  headGroup.add(hairBack);

  const sideburnGeom = new THREE.BoxGeometry(0.03, 0.09, 0.06);
  const leftSideburn = new THREE.Mesh(sideburnGeom, beardMaterial);
  leftSideburn.position.set(-0.115, -0.02, 0.03);
  headGroup.add(leftSideburn);

  const rightSideburn = new THREE.Mesh(sideburnGeom, beardMaterial);
  rightSideburn.position.set(0.115, -0.02, 0.03);
  headGroup.add(rightSideburn);

  // 6. Brimmed Hat (Upgraded details: curved brim, band buckle)
  const brimGeom = new THREE.BoxGeometry(0.38, 0.025, 0.38);
  const brim = new THREE.Mesh(brimGeom, hatMaterial);
  brim.position.set(0, 0.12, 0);
  brim.rotation.x = 0.04;
  brim.castShadow = true;
  headGroup.add(brim);

  // Hat Band
  const bandGeom = new THREE.BoxGeometry(0.23, 0.03, 0.23);
  const hatBand = new THREE.Mesh(bandGeom, leatherMaterial);
  hatBand.position.set(0, 0.14, -0.01);
  hatBand.rotation.x = 0.04;
  hatBand.castShadow = true;
  headGroup.add(hatBand);

  // Hat Buckle
  const hatBuckleGeom = new THREE.BoxGeometry(0.05, 0.04, 0.015);
  const hatBuckle = new THREE.Mesh(hatBuckleGeom, goldMaterial);
  hatBuckle.position.set(0, 0.14, 0.106);
  hatBuckle.rotation.x = 0.04;
  headGroup.add(hatBuckle);

  // Hat Cap
  const capGeom = new THREE.BoxGeometry(0.22, 0.12, 0.22);
  const cap = new THREE.Mesh(capGeom, hatMaterial);
  cap.position.set(0, 0.19, -0.015);
  cap.rotation.x = 0.04;
  cap.castShadow = true;
  headGroup.add(cap);

  group.add(headGroup);

  // Pivot centering: Scale down character slightly to look beautifully sized
  group.scale.set(0.8, 0.8, 0.8);

  return group;
}

/**
 * Creates a beautiful low-poly cloud asset using a cluster of 3-5 intersecting low-poly spheres (icosahedrons).
 * @returns {THREE.Group}
 */
export function createCloud() {
  const cloudGroup = new THREE.Group();

  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xF0F4F8, // Soft white/grey
    flatShading: true,
    roughness: 0.95,
    metalness: 0.05
  });

  // Use a low detail level Icosahedron for beautiful low-poly spheres!
  const cloudSphereGeom = new THREE.IcosahedronGeometry(0.5, 1);

  // Create a cluster of 4-5 low-poly spheres
  const numSpheres = 4 + Math.floor(Math.random() * 2);

  for (let i = 0; i < numSpheres; i++) {
    const sphere = new THREE.Mesh(cloudSphereGeom, cloudMaterial);

    let sx, sy, sz;
    let ox, oy, oz;

    if (i === 0) {
      // Main core sphere
      sx = 1.5 + Math.random() * 0.3;
      sy = 1.1 + Math.random() * 0.2;
      sz = 1.2 + Math.random() * 0.2;
      ox = oy = oz = 0;
    } else {
      // Clustered offset spheres
      sx = 0.8 + Math.random() * 0.5;
      sy = 0.7 + Math.random() * 0.4;
      sz = 0.8 + Math.random() * 0.4;

      ox = (Math.random() - 0.5) * 1.5;
      oy = (Math.random() - 0.5) * 0.3;
      oz = (Math.random() - 0.5) * 0.9;
    }

    sphere.scale.set(sx, sy, sz);
    sphere.position.set(ox, oy, oz);
    sphere.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    cloudGroup.add(sphere);
  }

  return cloudGroup;
}

/**
 * Creates a stylized cute low-poly shrub/bush.
 * @param {number} scale - Scale multiplier for the shrub
 * @param {number} shadeIndex - Pick a stable green shade from the TREE_GREENS array
 * @returns {THREE.Group}
 */
export function createShrub(scale = 1.0, shadeIndex = 0) {
  const shrubGroup = new THREE.Group();

  const leafColor = TREE_GREENS[(shadeIndex + 2) % TREE_GREENS.length];
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: leafColor,
    flatShading: true,
    roughness: 0.85
  });

  // Base little brown twig
  const twigMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3d24,
    flatShading: true,
    roughness: 0.95
  });
  const twigGeom = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 5);
  const twig = new THREE.Mesh(twigGeom, twigMaterial);
  twig.position.y = 0.15;
  shrubGroup.add(twig);

  // 4 overlapping faceted dodecahedrons representing organic foliage
  const sphereGeom = new THREE.DodecahedronGeometry(0.3, 0);

  // Central cluster
  const c1 = new THREE.Mesh(sphereGeom, leafMaterial);
  c1.position.set(0, 0.35, 0);
  c1.scale.set(1.1, 1.1, 1.1);
  c1.castShadow = true;
  c1.receiveShadow = true;
  shrubGroup.add(c1);

  // Left cluster
  const c2 = new THREE.Mesh(sphereGeom, leafMaterial);
  c2.position.set(-0.18, 0.28, 0.1);
  c2.scale.set(0.85, 0.8, 0.85);
  c2.castShadow = true;
  c2.receiveShadow = true;
  shrubGroup.add(c2);

  // Right cluster
  const c3 = new THREE.Mesh(sphereGeom, leafMaterial);
  c3.position.set(0.18, 0.26, -0.1);
  c3.scale.set(0.8, 0.85, 0.8);
  c3.castShadow = true;
  c3.receiveShadow = true;
  shrubGroup.add(c3);

  // Top peak
  const c4 = new THREE.Mesh(sphereGeom, leafMaterial);
  c4.position.set(0, 0.52, -0.05);
  c4.scale.set(0.7, 0.7, 0.7);
  c4.castShadow = true;
  c4.receiveShadow = true;
  shrubGroup.add(c4);

  shrubGroup.scale.set(scale, scale, scale);
  return shrubGroup;
}

/**
 * Creates the Fox - a highly detailed red-orange medium-poly fox with articulated curved legs and full snout structure.
 * @returns {THREE.Group}
 */
export function createFox() {
  const group = new THREE.Group();

  const orangeMaterial = new THREE.MeshStandardMaterial({ color: COLORS.FOX, flatShading: true, roughness: 0.55 });
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xfafafa, flatShading: true, roughness: 0.65 });
  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, flatShading: true, roughness: 0.75 });
  const pinkMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1, flatShading: true, roughness: 0.8 });

  // 1. Torso/Body (curved, segmented sections: chest, mid, loin)
  const chestGeom = new THREE.BoxGeometry(0.24, 0.32, 0.28);
  const chest = new THREE.Mesh(chestGeom, orangeMaterial);
  chest.position.set(0.15, 0.28, 0);
  chest.castShadow = true;
  chest.receiveShadow = true;
  group.add(chest);

  const midBodyGeom = new THREE.BoxGeometry(0.28, 0.28, 0.26);
  const midBody = new THREE.Mesh(midBodyGeom, orangeMaterial);
  midBody.position.set(-0.06, 0.26, 0);
  midBody.castShadow = true;
  group.add(midBody);

  const loinGeom = new THREE.BoxGeometry(0.2, 0.24, 0.22);
  const loin = new THREE.Mesh(loinGeom, orangeMaterial);
  loin.position.set(-0.25, 0.24, 0);
  loin.castShadow = true;
  group.add(loin);

  // White chest fur patch
  const chestFurGeom = new THREE.BoxGeometry(0.12, 0.24, 0.24);
  const chestFur = new THREE.Mesh(chestFurGeom, whiteMaterial);
  chestFur.position.set(0.23, 0.28, 0);
  chestFur.castShadow = true;
  group.add(chestFur);

  // 2. Neck connection
  const neckGeom = new THREE.BoxGeometry(0.12, 0.16, 0.14);
  const neck = new THREE.Mesh(neckGeom, orangeMaterial);
  neck.position.set(0.22, 0.4, 0);
  neck.rotation.z = -Math.PI / 6;
  neck.castShadow = true;
  group.add(neck);

  // 3. Articulated Jointed Legs (Upper thigh, shin, black paw cups)
  const frontLegGeom = new THREE.BoxGeometry(0.065, 0.12, 0.065);
  const rearThighGeom = new THREE.BoxGeometry(0.11, 0.12, 0.09);
  const pawGeom = new THREE.BoxGeometry(0.08, 0.06, 0.08);

  // Front Left
  const flLegGroup = new THREE.Group();
  flLegGroup.position.set(0.2, 0.18, 0.09);
  const flThigh = new THREE.Mesh(frontLegGeom, orangeMaterial);
  flThigh.position.y = -0.04;
  flLegGroup.add(flThigh);
  const flShin = new THREE.Mesh(frontLegGeom, blackMaterial);
  flShin.position.y = -0.12;
  flLegGroup.add(flShin);
  const flPaw = new THREE.Mesh(pawGeom, blackMaterial);
  flPaw.position.set(0, -0.16, 0.015);
  flLegGroup.add(flPaw);
  group.add(flLegGroup);

  // Front Right
  const frLegGroup = new THREE.Group();
  frLegGroup.position.set(0.2, 0.18, -0.09);
  const frThigh = new THREE.Mesh(frontLegGeom, orangeMaterial);
  frThigh.position.y = -0.04;
  frLegGroup.add(frThigh);
  const frShin = new THREE.Mesh(frontLegGeom, blackMaterial);
  frShin.position.y = -0.12;
  frLegGroup.add(frShin);
  const frPaw = new THREE.Mesh(pawGeom, blackMaterial);
  frPaw.position.set(0, -0.16, -0.015);
  frLegGroup.add(frPaw);
  group.add(frLegGroup);

  // Rear Left (thicker curved thigh)
  const rlLegGroup = new THREE.Group();
  rlLegGroup.position.set(-0.22, 0.18, 0.09);
  const rlThigh = new THREE.Mesh(rearThighGeom, orangeMaterial);
  rlThigh.rotation.z = 0.15;
  rlThigh.position.y = -0.04;
  rlLegGroup.add(rlThigh);
  const rlShin = new THREE.Mesh(frontLegGeom, blackMaterial);
  rlShin.position.set(-0.02, -0.12, 0);
  rlLegGroup.add(rlShin);
  const rlPaw = new THREE.Mesh(pawGeom, blackMaterial);
  rlPaw.position.set(-0.02, -0.16, 0.015);
  rlLegGroup.add(rlPaw);
  group.add(rlLegGroup);

  // Rear Right
  const rrLegGroup = new THREE.Group();
  rrLegGroup.position.set(-0.22, 0.18, -0.09);
  const rrThigh = new THREE.Mesh(rearThighGeom, orangeMaterial);
  rrThigh.rotation.z = 0.15;
  rrThigh.position.y = -0.04;
  rrLegGroup.add(rrThigh);
  const rrShin = new THREE.Mesh(frontLegGeom, blackMaterial);
  rrShin.position.set(-0.02, -0.12, 0);
  rrLegGroup.add(rrShin);
  const rrPaw = new THREE.Mesh(pawGeom, blackMaterial);
  rrPaw.position.set(-0.02, -0.16, -0.015);
  rrLegGroup.add(rrPaw);
  group.add(rrLegGroup);

  // 4. Head Group (with cheeks, snout, pointed ears, white details)
  const headGroup = new THREE.Group();
  headGroup.position.set(0.35, 0.46, 0);

  // Head block
  const headGeom = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  const head = new THREE.Mesh(headGeom, orangeMaterial);
  head.castShadow = true;
  headGroup.add(head);

  // Cheeks (tapered)
  const cheekGeomLeft = new THREE.BoxGeometry(0.06, 0.11, 0.11);
  const cheekLeft = new THREE.Mesh(cheekGeomLeft, whiteMaterial);
  cheekLeft.position.set(0.04, -0.04, 0.08);
  cheekLeft.rotation.y = 0.15;
  headGroup.add(cheekLeft);

  const cheekRight = new THREE.Mesh(cheekGeomLeft, whiteMaterial);
  cheekRight.position.set(0.04, -0.04, -0.08);
  cheekRight.rotation.y = -0.15;
  headGroup.add(cheekRight);

  // Snout & black nose tip
  const snoutGeom = new THREE.BoxGeometry(0.14, 0.08, 0.09);
  const snout = new THREE.Mesh(snoutGeom, orangeMaterial);
  snout.position.set(0.15, -0.03, 0);
  headGroup.add(snout);

  const whiteMuzzleUnder = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.035, 0.085), whiteMaterial);
  whiteMuzzleUnder.position.set(0.14, -0.08, 0);
  headGroup.add(whiteMuzzleUnder);

  const noseTipGeom = new THREE.BoxGeometry(0.04, 0.045, 0.05);
  const noseTip = new THREE.Mesh(noseTipGeom, blackMaterial);
  noseTip.position.set(0.23, -0.01, 0);
  headGroup.add(noseTip);

  // Pointed Ears (Orange back, white/pink inner)
  const earL = new THREE.Group();
  earL.position.set(-0.04, 0.13, 0.07);
  earL.rotation.z = -0.15;

  const earBackL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.07), orangeMaterial);
  earL.add(earBackL);

  const earInnerL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.10, 0.05), pinkMaterial);
  earInnerL.position.set(0.022, 0.01, 0);
  earL.add(earInnerL);
  headGroup.add(earL);

  const earR = new THREE.Group();
  earR.position.set(-0.04, 0.13, -0.07);
  earR.rotation.z = -0.15;

  const earBackR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.07), orangeMaterial);
  earR.add(earBackR);

  const earInnerR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.10, 0.05), pinkMaterial);
  earInnerR.position.set(0.022, 0.01, 0);
  earR.add(earInnerR);
  headGroup.add(earR);

  // Cute Eyes
  const eyeGeom = new THREE.BoxGeometry(0.03, 0.035, 0.01);
  const leftEye = new THREE.Mesh(eyeGeom, blackMaterial);
  leftEye.position.set(0.09, 0.03, 0.06);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, blackMaterial);
  rightEye.position.set(0.09, 0.03, -0.06);
  headGroup.add(rightEye);

  group.add(headGroup);

  // 5. Curved Articulated Tail (3 tapered segment boxes with white tip)
  const tailGroup = new THREE.Group();
  tailGroup.position.set(-0.32, 0.28, 0);

  const tailSeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.14), orangeMaterial);
  tailSeg1.position.set(-0.08, 0.02, 0);
  tailSeg1.rotation.z = -0.2;
  tailSeg1.castShadow = true;
  tailGroup.add(tailSeg1);

  const tailSeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.16), orangeMaterial);
  tailSeg2.position.set(-0.22, 0.10, 0);
  tailSeg2.rotation.z = -0.4;
  tailSeg2.castShadow = true;
  tailGroup.add(tailSeg2);

  const tailSeg3 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.13, 0.13), whiteMaterial);
  tailSeg3.position.set(-0.34, 0.20, 0);
  tailSeg3.rotation.z = -0.6;
  tailSeg3.castShadow = true;
  tailGroup.add(tailSeg3);

  group.add(tailGroup);

  // Adjust overall fox scale slightly to be smaller than shepherd
  group.scale.set(0.85, 0.85, 0.85);

  return group;
}

/**
 * Creates a fluffy, incredibly detailed sheep with bubbly, textured wool using multiple clustered spheres, jointed legs, and a cute detailed face.
 * @param {number} scaleModifier - scale of the sheep (e.g. 0.85 for lamb)
 * @param {number} rotationOffset - initial rotation offset in radians
 * @returns {THREE.Group}
 */
export function createSheep(scaleModifier = 1.0, rotationOffset = 0.0) {
  const group = new THREE.Group();

  const woolMaterial = new THREE.MeshStandardMaterial({ color: COLORS.SHEEP, flatShading: true, roughness: 0.9 });
  const faceMaterial = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, flatShading: true, roughness: 0.85 });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.5 });
  const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, flatShading: true, roughness: 0.5 });
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, flatShading: true, roughness: 0.9 });
  const hoofMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2715, flatShading: true, roughness: 0.9 });

  // 1. Upgraded Bubbly, Textured Wool Body (comprising 14 intersecting spheres for fluffy clouds texture!)
  const bodyGroup = new THREE.Group();
  const woolSphereGeom = new THREE.DodecahedronGeometry(0.19, 0); // Reduced wool size slightly per user request!

  // Central core box to bind shadows nicely
  const innerCore = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.4), woolMaterial);
  innerCore.position.set(0, 0.35, 0);
  innerCore.castShadow = true;
  innerCore.receiveShadow = true;
  bodyGroup.add(innerCore);

  // Position bubbles of wool symmetrically
  const woolBubbles = [
    { x: 0.0, y: 0.52, z: 0.0, s: 1.2 },    // Top peak
    { x: 0.22, y: 0.50, z: 0.12, s: 1.05 },  // Top-Front-Left
    { x: -0.22, y: 0.50, z: 0.12, s: 1.05 }, // Top-Back-Left
    { x: 0.22, y: 0.50, z: -0.12, s: 1.05 }, // Top-Front-Right
    { x: -0.22, y: 0.50, z: -0.12, s: 1.05 },// Top-Back-Right

    { x: 0.34, y: 0.36, z: 0.0, s: 1.1 },    // Front center
    { x: -0.34, y: 0.36, z: 0.0, s: 1.1 },   // Back center

    { x: 0.0, y: 0.32, z: 0.24, s: 1.1 },    // Mid-Left side
    { x: 0.18, y: 0.34, z: 0.22, s: 1.0 },   // Mid-Front-Left side
    { x: -0.18, y: 0.34, z: 0.22, s: 1.0 },  // Mid-Back-Left side

    { x: 0.0, y: 0.32, z: -0.24, s: 1.1 },   // Mid-Right side
    { x: 0.18, y: 0.34, z: -0.22, s: 1.0 },  // Mid-Front-Right side
    { x: -0.18, y: 0.34, z: -0.22, s: 1.0 }, // Mid-Back-Right side
  ];

  woolBubbles.forEach(bub => {
    const bubble = new THREE.Mesh(woolSphereGeom, woolMaterial);
    bubble.position.set(bub.x, bub.y, bub.z);
    bubble.scale.set(bub.s, bub.s, bub.s);
    bubble.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    bubble.castShadow = true;
    bodyGroup.add(bubble);
  });

  // Fluffy bubbly tail at the back of the body
  const tailGroup = new THREE.Group();
  tailGroup.position.set(-0.38, 0.45, 0);
  const tail1 = new THREE.Mesh(woolSphereGeom, woolMaterial);
  tail1.scale.set(0.7, 0.7, 0.7);
  tailGroup.add(tail1);
  const tail2 = new THREE.Mesh(woolSphereGeom, woolMaterial);
  tail2.position.set(-0.06, -0.05, 0);
  tail2.scale.set(0.55, 0.55, 0.55);
  tailGroup.add(tail2);
  bodyGroup.add(tailGroup);

  group.add(bodyGroup);

  // 2. Head Group (covered in a crown of mini-wool spheres, floppy ears, cute snout, detailed eyes)
  const headGroup = new THREE.Group();
  headGroup.position.set(0.38, 0.44, 0);

  // Dark face head box
  const headGeom = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  const head = new THREE.Mesh(headGeom, faceMaterial);
  head.castShadow = true;
  headGroup.add(head);

  // Cute muzzle snout (protruding forward)
  const muzzleGeom = new THREE.BoxGeometry(0.11, 0.09, 0.12);
  const muzzle = new THREE.Mesh(muzzleGeom, faceMaterial);
  muzzle.position.set(0.11, -0.03, 0);
  muzzle.castShadow = true;
  headGroup.add(muzzle);

  // A small pink nose tip on the front of the muzzle
  const pinkNoseMaterial = new THREE.MeshStandardMaterial({ color: 0xffb3c1, flatShading: true, roughness: 0.8 });
  const noseTipGeom = new THREE.BoxGeometry(0.03, 0.03, 0.05);
  const noseTip = new THREE.Mesh(noseTipGeom, pinkNoseMaterial);
  noseTip.position.set(0.17, 0.0, 0);
  headGroup.add(noseTip);

  // Cute beady eyes with white background spheres & black pupils positioned forward
  const scleraGeom = new THREE.SphereGeometry(0.035, 4, 4);
  const pupilGeom = new THREE.SphereGeometry(0.018, 4, 4);

  // Left eye
  const leftSclera = new THREE.Mesh(scleraGeom, eyeMaterial);
  leftSclera.position.set(0.07, 0.02, 0.075);
  headGroup.add(leftSclera);

  const leftPupil = new THREE.Mesh(pupilGeom, pupilMaterial);
  leftPupil.position.set(0.085, 0.02, 0.08);
  headGroup.add(leftPupil);

  // Right eye
  const rightSclera = new THREE.Mesh(scleraGeom, eyeMaterial);
  rightSclera.position.set(0.07, 0.02, -0.075);
  headGroup.add(rightSclera);

  const rightPupil = new THREE.Mesh(pupilGeom, pupilMaterial);
  rightPupil.position.set(0.085, 0.02, -0.08);
  headGroup.add(rightPupil);

  // Crown of 3 mini wool spheres on top of the head
  const capBubbles = [
    { x: -0.02, y: 0.11, z: 0.0, s: 0.45 },
    { x: -0.05, y: 0.09, z: 0.06, s: 0.35 },
    { x: -0.05, y: 0.09, z: -0.06, s: 0.35 }
  ];
  capBubbles.forEach(cb => {
    const b = new THREE.Mesh(woolSphereGeom, woolMaterial);
    b.position.set(cb.x, cb.y, cb.z);
    b.scale.set(cb.s, cb.s, cb.s);
    headGroup.add(b);
  });

  // Long floppy wool ears (clothed with wool, pink inner tip)
  const earL = new THREE.Group();
  earL.position.set(-0.02, 0.04, 0.1);
  earL.rotation.z = -0.15;
  const earWoolL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.09, 0.065), woolMaterial);
  earL.add(earWoolL);
  const earInnerL = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.05, 0.04), faceMaterial);
  earInnerL.position.set(0.018, -0.01, 0);
  earL.add(earInnerL);
  headGroup.add(earL);

  const earR = new THREE.Group();
  earR.position.set(-0.02, 0.04, -0.1);
  earR.rotation.z = -0.15;
  const earWoolR = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.09, 0.065), woolMaterial);
  earR.add(earWoolR);
  const earInnerR = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.05, 0.04), faceMaterial);
  earInnerR.position.set(0.018, -0.01, 0);
  earR.add(earInnerR);
  headGroup.add(earR);

  group.add(headGroup);

  // 3. Slender jointed legs with distinct wooden brown hooves
  const shinGeom = new THREE.BoxGeometry(0.06, 0.14, 0.06);
  const hoofGeom = new THREE.BoxGeometry(0.07, 0.04, 0.075);

  const legPositions = [
    { x: 0.2, z: 0.15 },
    { x: 0.2, z: -0.15 },
    { x: -0.2, z: 0.15 },
    { x: -0.2, z: -0.15 }
  ];

  legPositions.forEach(pos => {
    const legGroup = new THREE.Group();
    legGroup.position.set(pos.x, 0.18, pos.z);

    // Upper thigh (very thin)
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.07), legMaterial);
    legGroup.add(thigh);

    // Shin
    const shin = new THREE.Mesh(shinGeom, legMaterial);
    shin.position.y = -0.09;
    shin.castShadow = true;
    legGroup.add(shin);

    // Hoof
    const hoof = new THREE.Mesh(hoofGeom, hoofMaterial);
    hoof.position.set(0, -0.17, 0.005);
    legGroup.add(hoof);

    group.add(legGroup);
  });

  // Apply scaling modifier and initial rotation offset
  group.scale.set(scaleModifier, scaleModifier, scaleModifier);
  group.rotation.y = rotationOffset;
  group.userData.rotationOffset = rotationOffset;

  return group;
}
