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
  color: 0x3d2715,
  flatShading: false,
  roughness: 0.8,
  metalness: 0.1
});

const sharedDeciduousTrunkMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a2e1b,
  flatShading: false,
  roughness: 0.85
});

const sharedPineConeMaterial = new THREE.MeshStandardMaterial({
  color: 0x2b1a0d,
  flatShading: false,
  roughness: 0.9
});

// Highly detailed realistic primitives
const sharedTrunkGeom = new THREE.CylinderGeometry(0.08, 0.18, 1.2, 24);
const sharedStumpGeom = new THREE.CylinderGeometry(0.035, 0.05, 0.3, 12);
const sharedPineConeGeom = new THREE.DodecahedronGeometry(0.08, 2); // Highly smooth sphere

// Foliage level geometries for Conifer trees - high resolution cones
const levelGeometries = [
  new THREE.ConeGeometry(0.9, 1.0, 32, 16),
  new THREE.ConeGeometry(0.75, 0.9, 32, 16),
  new THREE.ConeGeometry(0.6, 0.75, 32, 16),
  new THREE.ConeGeometry(0.45, 0.6, 32, 16)
];

// Deciduous Tree Shared Assets - highly smooth cylinders and spheres
const sharedDeciduousTrunkGeom = new THREE.CylinderGeometry(0.12, 0.18, 1.3, 24);
const sharedBranchGeom = new THREE.CylinderGeometry(0.05, 0.08, 0.65, 16);
const sharedCanopyGeom = new THREE.SphereGeometry(0.46, 32, 32);

// Shrub Shared Geometry - smooth sphere
const sharedShrubGeom = new THREE.SphereGeometry(0.32, 24, 24);

// Shared Foliage Materials - highly detailed realistic foliage with subtle shine
const sharedFoliageMaterials = TREE_GREENS.map(color => new THREE.MeshStandardMaterial({
  color,
  flatShading: false,
  roughness: 0.7,
  metalness: 0.1
}));

/**
 * Creates a highly detailed organic conifer pine tree with custom green shades and smooth shaded silhouette.
 * @param {number} scale - Scale multiplier for the tree
 * @param {number} shadeIndex - Optional index to pick a specific green shade
 * @returns {THREE.Group}
 */
export function createTree(scale = 1.0, shadeIndex = 0) {
  const treeGroup = new THREE.Group();

  // 1. Trunk
  const trunk = new THREE.Mesh(sharedTrunkGeom, sharedTrunkMaterial);
  trunk.position.y = 0.6;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  // Tiny branch stumps
  const stump1 = new THREE.Mesh(sharedStumpGeom, sharedTrunkMaterial);
  stump1.position.set(0.12, 0.45, -0.06);
  stump1.rotation.z = Math.PI / 3.5;
  stump1.rotation.y = 0.6;
  treeGroup.add(stump1);

  const stump2 = new THREE.Mesh(sharedStumpGeom, sharedTrunkMaterial);
  stump2.position.set(-0.1, 0.7, 0.1);
  stump2.rotation.z = -Math.PI / 4;
  stump2.rotation.y = -0.8;
  treeGroup.add(stump2);

  // Pick a shared green foliage material
  const foliageMaterial = sharedFoliageMaterials[shadeIndex % sharedFoliageMaterials.length];

  // 2. Foliage (Stacked smooth cones)
  const levels = [
    { geom: levelGeometries[0], y: 1.1 },
    { geom: levelGeometries[1], y: 1.7 },
    { geom: levelGeometries[2], y: 2.25 },
    { geom: levelGeometries[3], y: 2.7 }
  ];

  levels.forEach((lvl, idx) => {
    const cone = new THREE.Mesh(lvl.geom, foliageMaterial);
    cone.position.y = lvl.y;
    cone.rotation.y = idx * 0.45 + (shadeIndex * 0.15);
    cone.castShadow = true;
    cone.receiveShadow = true;
    treeGroup.add(cone);
  });

  // 3. Add small pine cones
  const coneOffsets = [
    { x: 0.48, y: 0.8, z: 0.22 },
    { x: -0.38, y: 1.35, z: -0.32 },
    { x: 0.28, y: 1.85, z: -0.38 }
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
 * Creates a deciduous tree with branchings and a multi-spherical organic lush canopy.
 * @param {number} scale
 * @param {number} shadeIndex
 * @returns {THREE.Group}
 */
export function createDeciduousTree(scale = 1.0, shadeIndex = 0) {
  const treeGroup = new THREE.Group();

  // 1. Trunk
  const trunk = new THREE.Mesh(sharedDeciduousTrunkGeom, sharedDeciduousTrunkMaterial);
  trunk.position.y = 0.65;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  // Branches
  const branch1 = new THREE.Mesh(sharedBranchGeom, sharedDeciduousTrunkMaterial);
  branch1.position.set(0.2, 0.85, 0.12);
  branch1.rotation.z = Math.PI / 3.5;
  branch1.rotation.y = 0.4;
  branch1.castShadow = true;
  treeGroup.add(branch1);

  const branch2 = new THREE.Mesh(sharedBranchGeom, sharedDeciduousTrunkMaterial);
  branch2.position.set(-0.18, 0.95, -0.18);
  branch2.rotation.z = -Math.PI / 4;
  branch2.rotation.y = -0.5;
  branch2.castShadow = true;
  treeGroup.add(branch2);

  // Pick a green shade
  const foliageMaterial = sharedFoliageMaterials[(shadeIndex + 1) % sharedFoliageMaterials.length];

  const spheres = [
    { x: 0.0, y: 1.4, z: 0.0, s: 1.35 },
    { x: -0.3, y: 1.6, z: 0.22, s: 0.95 },
    { x: 0.35, y: 1.55, z: -0.24, s: 1.0 },
    { x: 0.28, y: 1.2, z: 0.35, s: 0.9 },
    { x: -0.32, y: 1.25, z: -0.3, s: 0.85 },
    { x: 0.0, y: 1.8, z: 0.06, s: 0.9 }
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
 * Creates an elegant, realistic wooden-grain sculpted kayak.
 * Beautifully curved planks, tapered nose segments, seat cushions, and wooden rib trim.
 * @returns {THREE.Group}
 */
export function createKayak() {
  const kayakGroup = new THREE.Group();

  // Polished mahogany wooden hull material
  const woodHullMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.BOAT,
    flatShading: false,
    roughness: 0.15,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  // Cedar trim details
  const cedarMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3d24,
    flatShading: false,
    roughness: 0.6,
    metalness: 0.05
  });

  const goldTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    flatShading: false,
    roughness: 0.1,
    metalness: 0.9
  });

  // Soft leather seat cushions
  const cushionMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a3e1b,
    flatShading: false,
    roughness: 0.8,
    metalness: 0.1
  });

  // 1. Boat Floor (Cedar planks)
  const floorGeom = new THREE.BoxGeometry(1.6, 0.04, 0.44);
  const floor = new THREE.Mesh(floorGeom, cedarMaterial);
  floor.position.set(0, 0.02, 0);
  floor.receiveShadow = true;
  kayakGroup.add(floor);

  // 2. Curved Side Walls (meet at sharp points at bow & stern)
  // Left wall
  const leftWallGeom = new THREE.BoxGeometry(1.5, 0.26, 0.04);
  const leftWall = new THREE.Mesh(leftWallGeom, woodHullMaterial);
  leftWall.position.set(0, 0.15, 0.24);
  leftWall.rotation.y = 0.04;
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  kayakGroup.add(leftWall);

  // Right wall
  const rightWall = new THREE.Mesh(leftWallGeom, woodHullMaterial);
  rightWall.position.set(0, 0.15, -0.24);
  rightWall.rotation.y = -0.04;
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  kayakGroup.add(rightWall);

  // 3. Sharp wedge bow & stern caps (defining perfect realistic kayak silhouette)
  const bowGeom = new THREE.ConeGeometry(0.24, 0.5, 4);

  // Front bow
  const bow = new THREE.Mesh(bowGeom, woodHullMaterial);
  bow.rotation.z = -Math.PI / 2;
  bow.rotation.x = Math.PI / 4;
  bow.position.set(1.0, 0.15, 0);
  bow.scale.set(0.9, 1.0, 0.5);
  bow.castShadow = true;
  kayakGroup.add(bow);

  // Back stern
  const stern = new THREE.Mesh(bowGeom, woodHullMaterial);
  stern.rotation.z = Math.PI / 2;
  stern.rotation.x = Math.PI / 4;
  stern.position.set(-1.0, 0.15, 0);
  stern.scale.set(0.9, 1.0, 0.5);
  stern.castShadow = true;
  kayakGroup.add(stern);

  // Beautiful brass bow/stern cap extensions
  const brassCapGeom = new THREE.SphereGeometry(0.045, 12, 12);
  const bowCap = new THREE.Mesh(brassCapGeom, goldTrimMaterial);
  bowCap.position.set(1.26, 0.15, 0);
  kayakGroup.add(bowCap);

  const sternCap = new THREE.Mesh(brassCapGeom, goldTrimMaterial);
  sternCap.position.set(-1.26, 0.15, 0);
  kayakGroup.add(sternCap);

  // Interior reinforcing ribs for realistic canoe feel
  const ribGeom = new THREE.BoxGeometry(0.03, 0.22, 0.44);
  const ribsOffsets = [-0.6, -0.2, 0.2, 0.6];
  ribsOffsets.forEach(x => {
    const rib = new THREE.Mesh(ribGeom, cedarMaterial);
    rib.position.set(x, 0.12, 0);
    rib.castShadow = true;
    kayakGroup.add(rib);
  });

  // Beautiful deck rails
  const leftRail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 0.04), cedarMaterial);
  leftRail.position.set(0, 0.26, 0.25);
  kayakGroup.add(leftRail);

  const rightRail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 0.04), cedarMaterial);
  rightRail.position.set(0, 0.26, -0.25);
  kayakGroup.add(rightRail);

  // 4. Seating (Raised seats with soft leather cushions)
  const seatGeom = new THREE.BoxGeometry(0.28, 0.04, 0.42);
  const backrestGeom = new THREE.BoxGeometry(0.03, 0.2, 0.38);

  // Front seat (Seat 1)
  const seat1Group = new THREE.Group();
  const seatBase1 = new THREE.Mesh(seatGeom, cedarMaterial);
  seatBase1.position.y = 0.06;
  seatBase1.castShadow = true;
  seat1Group.add(seatBase1);

  // Cushion
  const cushion1 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.4), cushionMaterial);
  cushion1.position.set(0, 0.08, 0);
  seat1Group.add(cushion1);

  const backrest1 = new THREE.Mesh(backrestGeom, cedarMaterial);
  backrest1.position.set(-0.13, 0.16, 0);
  backrest1.rotation.z = -0.15;
  backrest1.castShadow = true;
  seat1Group.add(backrest1);

  seat1Group.position.set(-0.35, 0, 0);
  kayakGroup.add(seat1Group);

  // Back seat (Seat 2)
  const seat2Group = new THREE.Group();
  const seatBase2 = new THREE.Mesh(seatGeom, cedarMaterial);
  seatBase2.position.y = 0.06;
  seatBase2.castShadow = true;
  seat2Group.add(seatBase2);

  // Cushion
  const cushion2 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.4), cushionMaterial);
  cushion2.position.set(0, 0.08, 0);
  seat2Group.add(cushion2);

  const backrest2 = new THREE.Mesh(backrestGeom, cedarMaterial);
  backrest2.position.set(-0.13, 0.16, 0);
  backrest2.rotation.z = -0.15;
  backrest2.castShadow = true;
  seat2Group.add(backrest2);

  seat2Group.position.set(0.35, 0, 0);
  kayakGroup.add(seat2Group);

  // 5. Wooden Paddle
  const paddleGroup = new THREE.Group();
  paddleGroup.name = 'paddle';

  const shaftGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.45, 12);
  const shaft = new THREE.Mesh(shaftGeom, cedarMaterial);
  shaft.rotation.z = Math.PI / 2;
  shaft.castShadow = true;
  paddleGroup.add(shaft);

  // Wraps
  const gripMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, flatShading: false, roughness: 0.8 });
  const gripGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 12);
  const leftGrip = new THREE.Mesh(gripGeom, gripMaterial);
  leftGrip.rotation.z = Math.PI / 2;
  leftGrip.position.set(-0.25, 0, 0);
  paddleGroup.add(leftGrip);

  const rightGrip = new THREE.Mesh(gripGeom, gripMaterial);
  rightGrip.rotation.z = Math.PI / 2;
  rightGrip.position.set(0.25, 0, 0);
  paddleGroup.add(rightGrip);

  // Blades
  const bladeGeom = new THREE.BoxGeometry(0.3, 0.02, 0.14);
  const leftBlade = new THREE.Mesh(bladeGeom, woodHullMaterial);
  leftBlade.position.set(-0.72, 0, 0);
  leftBlade.castShadow = true;
  paddleGroup.add(leftBlade);

  const rightBlade = new THREE.Mesh(bladeGeom, woodHullMaterial);
  rightBlade.position.set(0.72, 0, 0);
  rightBlade.rotation.x = Math.PI / 2;
  rightBlade.castShadow = true;
  paddleGroup.add(rightBlade);

  paddleGroup.position.set(0, 0.32, 0);
  paddleGroup.rotation.y = 0.15;
  kayakGroup.add(paddleGroup);

  // Set default rotation
  kayakGroup.rotation.y = ROTATIONS.DOCKED_KAYAK.y;

  return kayakGroup;
}

/**
 * Creates the Shepherd (Man) - highly detailed organic character with smooth limbs and vinyl/toy finish.
 * @returns {THREE.Group}
 */
export function createShepherd() {
  const group = new THREE.Group();

  const shirtMaterial = new THREE.MeshStandardMaterial({ color: COLORS.MAN, flatShading: false, roughness: 0.35, metalness: 0.1 });
  const shirtCuffMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: false, roughness: 0.4 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffd1a4, flatShading: false, roughness: 0.5 });
  const pantsMaterial = new THREE.MeshStandardMaterial({ color: 0x1c2833, flatShading: false, roughness: 0.6 });
  const bootsMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2715, flatShading: false, roughness: 0.5 });
  const hatMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, flatShading: false, roughness: 0.4 });
  const leatherMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, flatShading: false, roughness: 0.6 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, flatShading: false, roughness: 0.2, metalness: 0.9 });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, flatShading: false, roughness: 0.3 });
  const beardMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3d24, flatShading: false, roughness: 0.7 });

  const bootGeom = new THREE.CapsuleGeometry(0.07, 0.1, 8, 12);

  // 1. Boots
  const leftBootGroup = new THREE.Group();
  leftBootGroup.position.set(-0.08, 0.0, 0.03);
  const leftBootMesh = new THREE.Mesh(bootGeom, bootsMaterial);
  leftBootMesh.position.y = 0.08;
  leftBootMesh.rotation.x = Math.PI / 10;
  leftBootMesh.castShadow = true;
  leftBootGroup.add(leftBootMesh);
  group.add(leftBootGroup);

  const rightBootGroup = new THREE.Group();
  rightBootGroup.position.set(0.08, 0.0, 0.03);
  const rightBootMesh = new THREE.Mesh(bootGeom, bootsMaterial);
  rightBootMesh.position.y = 0.08;
  rightBootMesh.rotation.x = Math.PI / 10;
  rightBootMesh.castShadow = true;
  rightBootGroup.add(rightBootMesh);
  group.add(rightBootGroup);

  // 2. Legs
  const thighGeom = new THREE.CylinderGeometry(0.06, 0.05, 0.18, 12);
  const shinGeom = new THREE.CylinderGeometry(0.05, 0.04, 0.18, 12);
  const kneeGeom = new THREE.SphereGeometry(0.055, 12, 12);

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

  // 3. Torso
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0.44, 0);

  const coatGeom = new THREE.CylinderGeometry(0.16, 0.15, 0.45, 16);
  const coat = new THREE.Mesh(coatGeom, shirtMaterial);
  coat.position.y = 0.225;
  coat.scale.set(1.1, 1, 0.85);
  coat.castShadow = true;
  coat.receiveShadow = true;
  torsoGroup.add(coat);

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

  // Belt
  const beltGeom = new THREE.CylinderGeometry(0.17, 0.17, 0.06, 16);
  const belt = new THREE.Mesh(beltGeom, leatherMaterial);
  belt.position.y = 0.05;
  belt.scale.set(1.11, 1.0, 0.86);
  belt.castShadow = true;
  torsoGroup.add(belt);

  // Buckle
  const buckleGeom = new THREE.BoxGeometry(0.1, 0.08, 0.04);
  const buckle = new THREE.Mesh(buckleGeom, goldMaterial);
  buckle.position.set(0, 0.05, 0.12);
  buckle.castShadow = true;
  torsoGroup.add(buckle);

  group.add(torsoGroup);

  // 4. Arms
  const upperArmGeom = new THREE.CylinderGeometry(0.045, 0.04, 0.18, 12);
  const lowerArmGeom = new THREE.CylinderGeometry(0.04, 0.035, 0.16, 12);
  const handGeom = new THREE.SphereGeometry(0.045, 12, 12);

  // Left Arm Group (holds walking staff)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.21, 0.8, 0.02);

  const leftUpperArm = new THREE.Mesh(upperArmGeom, shirtMaterial);
  leftUpperArm.position.y = -0.09;
  leftUpperArm.castShadow = true;
  leftArmGroup.add(leftUpperArm);

  const leftLowerArm = new THREE.Mesh(lowerArmGeom, shirtMaterial);
  leftLowerArm.position.set(0, -0.24, 0.04);
  leftLowerArm.rotation.x = 0.4;
  leftLowerArm.castShadow = true;
  leftArmGroup.add(leftLowerArm);

  const leftHand = new THREE.Mesh(handGeom, skinMaterial);
  leftHand.position.set(0, -0.34, 0.08);
  leftHand.castShadow = true;
  leftArmGroup.add(leftHand);

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
  rightLowerArm.rotation.x = -0.2;
  rightLowerArm.castShadow = true;
  rightArmGroup.add(rightLowerArm);

  const rightHand = new THREE.Mesh(handGeom, skinMaterial);
  rightHand.position.set(0, -0.34, -0.04);
  rightHand.castShadow = true;
  rightArmGroup.add(rightHand);

  group.add(rightArmGroup);

  // Walking Staff
  const staffMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3d24, flatShading: false, roughness: 0.8 });
  const staffGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.85, 12);
  const staff = new THREE.Mesh(staffGeom, staffMaterial);
  staff.position.set(-0.21, 0.45, 0.14);
  staff.rotation.x = 0.2;
  staff.castShadow = true;
  group.add(staff);

  // Gold knob
  const knobGeom = new THREE.SphereGeometry(0.045, 16, 16);
  const staffKnob = new THREE.Mesh(knobGeom, goldMaterial);
  staffKnob.position.set(-0.21, 0.88, 0.23);
  group.add(staffKnob);

  // 5. Head & Face
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.9, 0);

  const headGeom = new THREE.SphereGeometry(0.12, 24, 24);
  const head = new THREE.Mesh(headGeom, skinMaterial);
  head.scale.set(1, 1.1, 1);
  head.castShadow = true;
  headGroup.add(head);

  // Nose
  const noseGeom = new THREE.SphereGeometry(0.03, 12, 12);
  const nose = new THREE.Mesh(noseGeom, skinMaterial);
  nose.position.set(0, 0.01, 0.12);
  nose.castShadow = true;
  headGroup.add(nose);

  // Beard
  const beardGeom = new THREE.SphereGeometry(0.125, 16, 16);
  const beard = new THREE.Mesh(beardGeom, beardMaterial);
  beard.position.set(0, -0.05, 0.05);
  beard.scale.set(1.02, 1, 1.05);
  beard.castShadow = true;
  headGroup.add(beard);

  // Eyes
  const eyeGeom = new THREE.SphereGeometry(0.022, 12, 12);
  const leftEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  leftEye.position.set(-0.05, 0.03, 0.10);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  rightEye.position.set(0.05, 0.03, 0.10);
  headGroup.add(rightEye);

  // 6. Brimmed Hat
  const brimGeom = new THREE.CylinderGeometry(0.19, 0.19, 0.025, 24);
  const brim = new THREE.Mesh(brimGeom, hatMaterial);
  brim.position.set(0, 0.12, 0);
  brim.rotation.x = 0.04;
  brim.castShadow = true;
  headGroup.add(brim);

  // Hat Band
  const bandGeom = new THREE.CylinderGeometry(0.115, 0.115, 0.03, 24);
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
  const capGeom = new THREE.CylinderGeometry(0.11, 0.10, 0.12, 24);
  const cap = new THREE.Mesh(capGeom, hatMaterial);
  cap.position.set(0, 0.19, -0.015);
  cap.rotation.x = 0.04;
  cap.castShadow = true;
  headGroup.add(cap);

  group.add(headGroup);

  group.scale.set(0.8, 0.8, 0.8);

  return group;
}

/**
 * Creates a beautiful organic cloud asset using a cluster of smooth spheres.
 * @returns {THREE.Group}
 */
export function createCloud() {
  const cloudGroup = new THREE.Group();

  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xF0F4F8,
    flatShading: false,
    roughness: 0.9,
    metalness: 0.1
  });

  const cloudSphereGeom = new THREE.SphereGeometry(0.5, 24, 24);

  const numSpheres = 5;

  for (let i = 0; i < numSpheres; i++) {
    const sphere = new THREE.Mesh(cloudSphereGeom, cloudMaterial);

    let sx, sy, sz;
    let ox, oy, oz;

    if (i === 0) {
      sx = 1.5;
      sy = 1.1;
      sz = 1.2;
      ox = oy = oz = 0;
    } else {
      sx = 0.8 + Math.random() * 0.5;
      sy = 0.7 + Math.random() * 0.4;
      sz = 0.8 + Math.random() * 0.4;

      ox = (Math.random() - 0.5) * 1.5;
      oy = (Math.random() - 0.5) * 0.3;
      oz = (Math.random() - 0.5) * 0.9;
    }

    sphere.scale.set(sx, sy, sz);
    sphere.position.set(ox, oy, oz);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    cloudGroup.add(sphere);
  }

  return cloudGroup;
}

/**
 * Creates a stylized cute organic shrub/bush.
 * @param {number} scale - Scale multiplier for the shrub
 * @param {number} shadeIndex - Pick a stable green shade from the TREE_GREENS array
 * @returns {THREE.Group}
 */
export function createShrub(scale = 1.0, shadeIndex = 0) {
  const shrubGroup = new THREE.Group();

  const leafColor = TREE_GREENS[(shadeIndex + 2) % TREE_GREENS.length];
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: leafColor,
    flatShading: false,
    roughness: 0.8
  });

  const twigMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3d24,
    flatShading: false,
    roughness: 0.9
  });
  const twigGeom = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 10);
  const twig = new THREE.Mesh(twigGeom, twigMaterial);
  twig.position.y = 0.15;
  shrubGroup.add(twig);

  const sphereGeom = sharedShrubGeom;

  const c1 = new THREE.Mesh(sphereGeom, leafMaterial);
  c1.position.set(0, 0.35, 0);
  c1.scale.set(1.1, 1.1, 1.1);
  c1.castShadow = true;
  c1.receiveShadow = true;
  shrubGroup.add(c1);

  const c2 = new THREE.Mesh(sphereGeom, leafMaterial);
  c2.position.set(-0.18, 0.28, 0.1);
  c2.scale.set(0.85, 0.8, 0.85);
  c2.castShadow = true;
  c2.receiveShadow = true;
  shrubGroup.add(c2);

  const c3 = new THREE.Mesh(sphereGeom, leafMaterial);
  c3.position.set(0.18, 0.26, -0.1);
  c3.scale.set(0.8, 0.85, 0.8);
  c3.castShadow = true;
  c3.receiveShadow = true;
  shrubGroup.add(c3);

  shrubGroup.scale.set(scale, scale, scale);
  return shrubGroup;
}

/**
 * Creates the Fox.
 * @returns {THREE.Group}
 */
export function createFox() {
  const group = new THREE.Group();

  const orangeMaterial = new THREE.MeshStandardMaterial({ color: COLORS.FOX, flatShading: false, roughness: 0.4, metalness: 0.1 });
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xfafafa, flatShading: false, roughness: 0.5 });
  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, flatShading: false, roughness: 0.6 });

  const bodyGeom = new THREE.CapsuleGeometry(0.13, 0.38, 8, 16);
  const bodyMesh = new THREE.Mesh(bodyGeom, orangeMaterial);
  bodyMesh.rotation.z = Math.PI / 2;
  bodyMesh.position.set(-0.05, 0.26, 0);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  const chestFurGeom = new THREE.SphereGeometry(0.12, 16, 16);
  const chestFur = new THREE.Mesh(chestFurGeom, whiteMaterial);
  chestFur.position.set(0.14, 0.28, 0);
  chestFur.scale.set(1.1, 1, 1.1);
  chestFur.castShadow = true;
  group.add(chestFur);

  const neckGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.16, 12);
  const neck = new THREE.Mesh(neckGeom, orangeMaterial);
  neck.position.set(0.17, 0.38, 0);
  neck.rotation.z = -Math.PI / 4;
  neck.castShadow = true;
  group.add(neck);

  const frontLegGeom = new THREE.CylinderGeometry(0.03, 0.025, 0.2, 12);
  const rearThighGeom = new THREE.SphereGeometry(0.065, 12, 12);
  const rearShinGeom = new THREE.CylinderGeometry(0.03, 0.025, 0.16, 12);

  // Front Left
  const flLegGroup = new THREE.Group();
  flLegGroup.position.set(0.12, 0.16, 0.07);
  const flThigh = new THREE.Mesh(frontLegGeom, orangeMaterial);
  flThigh.position.y = -0.05;
  flLegGroup.add(flThigh);
  const flShin = new THREE.Mesh(frontLegGeom, blackMaterial);
  flShin.position.y = -0.12;
  flShin.scale.set(1, 0.6, 1);
  flLegGroup.add(flShin);
  group.add(flLegGroup);

  // Front Right
  const frLegGroup = new THREE.Group();
  frLegGroup.position.set(0.12, 0.16, -0.07);
  const frThigh = new THREE.Mesh(frontLegGeom, orangeMaterial);
  frThigh.position.y = -0.05;
  frLegGroup.add(frThigh);
  const frShin = new THREE.Mesh(frontLegGeom, blackMaterial);
  frShin.position.y = -0.12;
  frShin.scale.set(1, 0.6, 1);
  frLegGroup.add(frShin);
  group.add(frLegGroup);

  // Rear Left
  const rlLegGroup = new THREE.Group();
  rlLegGroup.position.set(-0.2, 0.16, 0.08);
  const rlThigh = new THREE.Mesh(rearThighGeom, orangeMaterial);
  rlThigh.position.y = -0.02;
  rlLegGroup.add(rlThigh);
  const rlShin = new THREE.Mesh(rearShinGeom, blackMaterial);
  rlShin.position.y = -0.11;
  rlLegGroup.add(rlShin);
  group.add(rlLegGroup);

  // Rear Right
  const rrLegGroup = new THREE.Group();
  rrLegGroup.position.set(-0.2, 0.16, -0.08);
  const rrThigh = new THREE.Mesh(rearThighGeom, orangeMaterial);
  rrThigh.position.y = -0.02;
  rrLegGroup.add(rrThigh);
  const rrShin = new THREE.Mesh(rearShinGeom, blackMaterial);
  rrShin.position.y = -0.11;
  rrLegGroup.add(rrShin);
  group.add(rrLegGroup);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0.24, 0.44, 0);

  const headGeom = new THREE.SphereGeometry(0.1, 24, 24);
  const head = new THREE.Mesh(headGeom, orangeMaterial);
  head.castShadow = true;
  headGroup.add(head);

  // Snout
  const snoutGeom = new THREE.CylinderGeometry(0.025, 0.045, 0.11, 16);
  const snout = new THREE.Mesh(snoutGeom, orangeMaterial);
  snout.position.set(0.1, -0.02, 0);
  snout.rotation.z = -Math.PI / 2;
  headGroup.add(snout);

  // Nose tip
  const noseTipGeom = new THREE.SphereGeometry(0.025, 12, 12);
  const noseTip = new THREE.Mesh(noseTipGeom, blackMaterial);
  noseTip.position.set(0.16, -0.02, 0);
  headGroup.add(noseTip);

  // Ears
  const earL = new THREE.Group();
  earL.position.set(-0.03, 0.09, 0.05);
  earL.rotation.z = -0.1;
  const earBackL = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 12), orangeMaterial);
  earBackL.position.y = 0.05;
  earL.add(earBackL);
  headGroup.add(earL);

  const earR = new THREE.Group();
  earR.position.set(-0.03, 0.09, -0.05);
  earR.rotation.z = -0.1;
  const earBackR = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 12), orangeMaterial);
  earBackR.position.y = 0.05;
  earR.add(earBackR);
  headGroup.add(earR);

  // Eyes
  const eyeGeom = new THREE.SphereGeometry(0.015, 12, 12);
  const leftEye = new THREE.Mesh(eyeGeom, blackMaterial);
  leftEye.position.set(0.06, 0.02, 0.05);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, blackMaterial);
  rightEye.position.set(0.06, 0.02, -0.05);
  headGroup.add(rightEye);

  group.add(headGroup);

  // Fluffy Tail
  const tailGroup = new THREE.Group();
  tailGroup.position.set(-0.25, 0.28, 0);

  const tailGeom = new THREE.CapsuleGeometry(0.08, 0.24, 12, 24);
  const tail = new THREE.Mesh(tailGeom, orangeMaterial);
  tail.position.set(-0.12, 0.05, 0);
  tail.rotation.z = -Math.PI / 4;
  tail.castShadow = true;
  tailGroup.add(tail);

  const tailTipGeom = new THREE.SphereGeometry(0.085, 16, 16);
  const tailTip = new THREE.Mesh(tailTipGeom, whiteMaterial);
  tailTip.position.set(-0.22, 0.15, 0);
  tailTip.castShadow = true;
  tailGroup.add(tailTip);

  group.add(tailGroup);

  group.scale.set(0.85, 0.85, 0.85);

  return group;
}

/**
 * Creates a fluffy, organic, beautifully smooth shaded sheep.
 * @param {number} scaleModifier - scale of the sheep (e.g. 0.85 for lamb)
 * @param {number} rotationOffset - initial rotation offset in radians
 * @returns {THREE.Group}
 */
export function createSheep(scaleModifier = 1.0, rotationOffset = 0.0) {
  const group = new THREE.Group();

  const woolMaterial = new THREE.MeshStandardMaterial({ color: COLORS.SHEEP, flatShading: false, roughness: 0.9, metalness: 0.05 });
  const faceMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, flatShading: false, roughness: 0.8 });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: false, roughness: 0.4 });
  const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, flatShading: false, roughness: 0.4 });
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, flatShading: false, roughness: 0.8 });
  const hoofMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2715, flatShading: false, roughness: 0.8 });

  const bodyGroup = new THREE.Group();
  const woolSphereGeom = new THREE.SphereGeometry(0.18, 16, 16);

  const innerCoreGeom = new THREE.CapsuleGeometry(0.16, 0.38, 12, 24);
  const innerCore = new THREE.Mesh(innerCoreGeom, woolMaterial);
  innerCore.rotation.z = Math.PI / 2;
  innerCore.position.set(0, 0.35, 0);
  innerCore.castShadow = true;
  innerCore.receiveShadow = true;
  bodyGroup.add(innerCore);

  const woolBubbles = [
    { x: 0.0, y: 0.52, z: 0.0, s: 1.2 },
    { x: 0.22, y: 0.50, z: 0.12, s: 1.05 },
    { x: -0.22, y: 0.50, z: 0.12, s: 1.05 },
    { x: 0.22, y: 0.50, z: -0.12, s: 1.05 },
    { x: -0.22, y: 0.50, z: -0.12, s: 1.05 },
    { x: 0.32, y: 0.36, z: 0.0, s: 1.1 },
    { x: -0.32, y: 0.36, z: 0.0, s: 1.1 },
    { x: 0.0, y: 0.32, z: 0.24, s: 1.1 },
    { x: 0.0, y: 0.32, z: -0.24, s: 1.1 }
  ];

  woolBubbles.forEach(bub => {
    const bubble = new THREE.Mesh(woolSphereGeom, woolMaterial);
    bubble.position.set(bub.x, bub.y, bub.z);
    bubble.scale.set(bub.s, bub.s, bub.s);
    bubble.castShadow = true;
    bodyGroup.add(bubble);
  });

  group.add(bodyGroup);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0.35, 0.44, 0);

  const headGeom = new THREE.SphereGeometry(0.1, 24, 24);
  const head = new THREE.Mesh(headGeom, faceMaterial);
  head.castShadow = true;
  headGroup.add(head);

  // Snout
  const muzzleGeom = new THREE.SphereGeometry(0.065, 16, 16);
  const muzzle = new THREE.Mesh(muzzleGeom, faceMaterial);
  muzzle.position.set(0.08, -0.02, 0);
  muzzle.scale.set(1.2, 1, 1);
  muzzle.castShadow = true;
  headGroup.add(muzzle);

  // Nose tip
  const pinkNoseMaterial = new THREE.MeshStandardMaterial({ color: 0xffb3c1, flatShading: false, roughness: 0.7 });
  const noseTipGeom = new THREE.SphereGeometry(0.016, 12, 12);
  const noseTip = new THREE.Mesh(noseTipGeom, pinkNoseMaterial);
  noseTip.position.set(0.14, 0.0, 0);
  headGroup.add(noseTip);

  // Eyes
  const scleraGeom = new THREE.SphereGeometry(0.03, 12, 12);
  const pupilGeom = new THREE.SphereGeometry(0.015, 12, 12);

  // Left Eye
  const leftSclera = new THREE.Mesh(scleraGeom, eyeMaterial);
  leftSclera.position.set(0.05, 0.02, 0.065);
  headGroup.add(leftSclera);
  const leftPupil = new THREE.Mesh(pupilGeom, pupilMaterial);
  leftPupil.position.set(0.065, 0.02, 0.07);
  headGroup.add(leftPupil);

  // Right Eye
  const rightSclera = new THREE.Mesh(scleraGeom, eyeMaterial);
  rightSclera.position.set(0.05, 0.02, -0.065);
  headGroup.add(rightSclera);
  const rightPupil = new THREE.Mesh(pupilGeom, pupilMaterial);
  rightPupil.position.set(0.065, 0.02, -0.07);
  headGroup.add(rightPupil);

  // Ears
  const earGeom = new THREE.CapsuleGeometry(0.02, 0.07, 8, 16);
  const earL = new THREE.Mesh(earGeom, faceMaterial);
  earL.position.set(-0.02, 0.03, 0.08);
  earL.rotation.z = -0.2;
  earL.rotation.x = 0.5;
  headGroup.add(earL);

  const earR = new THREE.Mesh(earGeom, faceMaterial);
  earR.position.set(-0.02, 0.03, -0.08);
  earR.rotation.z = -0.2;
  earR.rotation.x = -0.5;
  headGroup.add(earR);

  // Wool cap
  const cap = new THREE.Mesh(woolSphereGeom, woolMaterial);
  cap.position.set(-0.02, 0.08, 0);
  cap.scale.set(0.5, 0.5, 0.5);
  headGroup.add(cap);

  group.add(headGroup);

  // Legs
  const legGeom = new THREE.CylinderGeometry(0.022, 0.02, 0.22, 12);
  const legPositions = [
    { x: 0.16, z: 0.11 },
    { x: 0.16, z: -0.11 },
    { x: -0.16, z: 0.11 },
    { x: -0.16, z: -0.11 }
  ];

  legPositions.forEach(pos => {
    const legGroup = new THREE.Group();
    legGroup.position.set(pos.x, 0.15, pos.z);

    const leg = new THREE.Mesh(legGeom, legMaterial);
    leg.position.y = -0.05;
    leg.castShadow = true;
    legGroup.add(leg);

    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 12), hoofMaterial);
    hoof.position.y = -0.16;
    legGroup.add(hoof);

    group.add(legGroup);
  });

  group.scale.set(scaleModifier, scaleModifier, scaleModifier);
  group.rotation.y = rotationOffset;
  group.userData.rotationOffset = rotationOffset;

  return group;
}
