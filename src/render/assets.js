import * as THREE from 'three';
import { COLORS, ROTATIONS } from '../core/constants.js';

// Three distinct shades of forest green for natural organic conifer trees
const TREE_GREENS = [
  COLORS.PINE_LIGHT,
  COLORS.PINE_CLASSIC,
  COLORS.PINE_DEEP
];

/**
 * Creates a stylized conifer pine tree with custom/random green shades and smoother flat-shaded silhouette.
 * @param {number} scale - Scale multiplier for the tree
 * @param {number} shadeIndex - Optional index to pick a specific green shade
 * @returns {THREE.Group}
 */
export function createTree(scale = 1.0, shadeIndex = 0) {
  const treeGroup = new THREE.Group();

  // 1. Trunk (Brown cylinder) - 8 radial segments for a smoother cylinder silhouette
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3d24,
    flatShading: true,
    roughness: 0.9
  });
  const trunkGeom = new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8);
  const trunk = new THREE.Mesh(trunkGeom, trunkMaterial);
  trunk.position.y = 0.4;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treeGroup.add(trunk);

  // Pick a green shade deterministically
  const leafColor = TREE_GREENS[shadeIndex % TREE_GREENS.length];

  // 2. Foliage (Stacked green cones)
  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: leafColor,
    flatShading: true,
    roughness: 0.85
  });

  // Stack 3 conifer levels
  const levels = [
    { bottomRadius: 0.8, height: 1.0, y: 1.1 },
    { bottomRadius: 0.62, height: 0.82, y: 1.7 },
    { bottomRadius: 0.45, height: 0.65, y: 2.2 }
  ];

  levels.forEach(lvl => {
    // 8 radial segments for smooth round faceted silhouette while retaining flatShading
    const coneGeom = new THREE.ConeGeometry(lvl.bottomRadius, lvl.height, 8);
    const cone = new THREE.Mesh(coneGeom, foliageMaterial);
    cone.position.y = lvl.y;
    cone.rotation.y = Math.random() * Math.PI; // Random rotation for organic feel
    cone.castShadow = true;
    cone.receiveShadow = true;
    treeGroup.add(cone);
  });

  treeGroup.scale.set(scale, scale, scale);
  return treeGroup;
}

/**
 * Creates a stylized orange kayak/canoe with a wooden paddle.
 * @returns {THREE.Group}
 */
export function createKayak() {
  const kayakGroup = new THREE.Group();

  const orangeMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.BOAT,
    flatShading: true,
    roughness: 0.4,
    metalness: 0.2
  });

  const darkWoodMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3d24,
    flatShading: true,
    roughness: 0.8
  });

  // 1. Main Bottom Hull
  const hullGeom = new THREE.BoxGeometry(1.6, 0.15, 0.55);
  const hull = new THREE.Mesh(hullGeom, orangeMaterial);
  hull.position.y = 0.075;
  hull.castShadow = true;
  hull.receiveShadow = true;
  kayakGroup.add(hull);

  // 2. Side walls (Left & Right)
  const wallGeom = new THREE.BoxGeometry(1.6, 0.28, 0.06);
  const leftWall = new THREE.Mesh(wallGeom, orangeMaterial);
  leftWall.position.set(0, 0.15, 0.25);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  kayakGroup.add(leftWall);

  const rightWall = new THREE.Mesh(wallGeom, orangeMaterial);
  rightWall.position.set(0, 0.15, -0.25);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  kayakGroup.add(rightWall);

  // 3. Tapered Front & Back Noses - 8 segments for a much smoother pointed hull/cone profile
  const noseGeom = new THREE.ConeGeometry(0.3, 0.8, 8);

  // Front Nose (pointy)
  const frontNose = new THREE.Mesh(noseGeom, orangeMaterial);
  frontNose.rotation.z = -Math.PI / 2; // Point forward along X
  frontNose.rotation.x = Math.PI / 8;  // Align smooth faceted sides nicely
  frontNose.position.set(1.2, 0.14, 0);
  frontNose.scale.set(1, 1, 0.75);     // Flatten slightly
  frontNose.castShadow = true;
  frontNose.receiveShadow = true;
  kayakGroup.add(frontNose);

  // Back Nose
  const backNose = new THREE.Mesh(noseGeom, orangeMaterial);
  backNose.rotation.z = Math.PI / 2;  // Point backward along X
  backNose.rotation.x = Math.PI / 8;  // Align smooth faceted sides nicely
  backNose.position.set(-1.2, 0.14, 0);
  backNose.scale.set(1, 1, 0.75);
  backNose.castShadow = true;
  backNose.receiveShadow = true;
  kayakGroup.add(backNose);

  // 4. Wooden Seats
  const seatGeom = new THREE.BoxGeometry(0.3, 0.06, 0.44);
  const seat1 = new THREE.Mesh(seatGeom, darkWoodMaterial);
  seat1.position.set(-0.35, 0.12, 0);
  seat1.castShadow = true;
  kayakGroup.add(seat1);

  const seat2 = new THREE.Mesh(seatGeom, darkWoodMaterial);
  seat2.position.set(0.35, 0.12, 0);
  seat2.castShadow = true;
  kayakGroup.add(seat2);

  // 5. Wooden Paddle
  const paddleGroup = new THREE.Group();
  // Paddle Shaft (Long cylinder/thin box) - 8 segments for a smoother cylindrical shaft
  const shaftGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.4, 8);
  const shaft = new THREE.Mesh(shaftGeom, darkWoodMaterial);
  shaft.rotation.z = Math.PI / 2; // Lie horizontal
  shaft.castShadow = true;
  paddleGroup.add(shaft);

  // Paddle Blades (Two flat orange/wooden plates at ends)
  const bladeGeom = new THREE.BoxGeometry(0.25, 0.02, 0.12);
  const leftBlade = new THREE.Mesh(bladeGeom, orangeMaterial);
  leftBlade.position.set(-0.7, 0, 0);
  leftBlade.castShadow = true;
  paddleGroup.add(leftBlade);

  const rightBlade = new THREE.Mesh(bladeGeom, orangeMaterial);
  rightBlade.position.set(0.7, 0, 0);
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
 * Creates the Shepherd (Man) - a detailed, polished blocky character.
 * @returns {THREE.Group}
 */
export function createShepherd() {
  const group = new THREE.Group();

  // Materials
  const shirtMaterial = new THREE.MeshStandardMaterial({ color: COLORS.MAN, flatShading: true, roughness: 0.7 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffd1a4, flatShading: true, roughness: 0.8 });
  const pantsMaterial = new THREE.MeshStandardMaterial({ color: 0x223344, flatShading: true, roughness: 0.8 });
  const bootsMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2715, flatShading: true, roughness: 0.9 });
  const hatMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, flatShading: true, roughness: 0.8 }); // Dark grey/black brimmed hat
  const leatherMaterial = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, flatShading: true, roughness: 0.9 });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, flatShading: true, roughness: 0.3, metalness: 0.8 });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, flatShading: true, roughness: 0.5 });

  // 1. Boots/Feet
  const footGeom = new THREE.BoxGeometry(0.12, 0.1, 0.16);
  const leftFoot = new THREE.Mesh(footGeom, bootsMaterial);
  leftFoot.position.set(-0.08, 0.05, 0.03);
  leftFoot.castShadow = true;
  group.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeom, bootsMaterial);
  rightFoot.position.set(0.08, 0.05, 0.03);
  rightFoot.castShadow = true;
  group.add(rightFoot);

  // 2. Legs (Pants)
  const legGeom = new THREE.BoxGeometry(0.1, 0.32, 0.1);
  const leftLeg = new THREE.Mesh(legGeom, pantsMaterial);
  leftLeg.position.set(-0.08, 0.22, 0);
  leftLeg.castShadow = true;
  leftLeg.receiveShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeom, pantsMaterial);
  rightLeg.position.set(0.08, 0.22, 0);
  rightLeg.castShadow = true;
  rightLeg.receiveShadow = true;
  group.add(rightLeg);

  // 3. Torso (Blue Shirt)
  const torsoGeom = new THREE.BoxGeometry(0.32, 0.45, 0.22);
  const torso = new THREE.Mesh(torsoGeom, shirtMaterial);
  torso.position.set(0, 0.58, 0);
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);

  // Leather Belt around the waist
  const beltGeom = new THREE.BoxGeometry(0.33, 0.06, 0.23);
  const belt = new THREE.Mesh(beltGeom, leatherMaterial);
  belt.position.set(0, 0.41, 0);
  belt.castShadow = true;
  group.add(belt);

  // Golden Buckle on the belt
  const buckleGeom = new THREE.BoxGeometry(0.1, 0.08, 0.04);
  const buckle = new THREE.Mesh(buckleGeom, goldMaterial);
  buckle.position.set(0, 0.41, 0.115);
  buckle.castShadow = true;
  group.add(buckle);

  // 4. Arms (Detailed Shirt Sleeves + Skin Hands)
  const armGeom = new THREE.BoxGeometry(0.09, 0.36, 0.09);
  const leftArm = new THREE.Mesh(armGeom, shirtMaterial);
  leftArm.position.set(-0.21, 0.54, 0.02);
  leftArm.rotation.x = 0.2; // Slightly forward
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeom, shirtMaterial);
  rightArm.position.set(0.21, 0.54, 0.02);
  rightArm.rotation.x = -0.1;
  rightArm.castShadow = true;
  group.add(rightArm);

  // Hands (Detailed Blocky Skin color)
  const handGeom = new THREE.BoxGeometry(0.085, 0.085, 0.085);
  const leftHand = new THREE.Mesh(handGeom, skinMaterial);
  leftHand.position.set(-0.21, 0.34, 0.06);
  leftHand.castShadow = true;
  group.add(leftHand);

  const rightHand = new THREE.Mesh(handGeom, skinMaterial);
  rightHand.position.set(0.21, 0.34, -0.01);
  rightHand.castShadow = true;
  group.add(rightHand);

  // Simple brown cylinder walking staff held in his left hand
  const staffMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3d24, flatShading: true, roughness: 0.95 });
  const staffGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 5);
  const staff = new THREE.Mesh(staffGeom, staffMaterial);
  staff.position.set(-0.21, 0.45, 0.11);
  staff.rotation.x = 0.15; // slightly tilted forward
  staff.castShadow = true;
  group.add(staff);

  // 5. Head
  const headGeom = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  const head = new THREE.Mesh(headGeom, skinMaterial);
  head.position.set(0, 0.9, 0);
  head.castShadow = true;
  group.add(head);

  // Cute beady dark eyes (facing forward +Z)
  const eyeGeom = new THREE.BoxGeometry(0.04, 0.04, 0.02);
  const leftEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  leftEye.position.set(-0.06, 0.93, 0.111);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeom, eyeMaterial);
  rightEye.position.set(0.06, 0.93, 0.111);
  group.add(rightEye);

  // Hair (Brown back/sides + cute sideburns)
  const hairGeom = new THREE.BoxGeometry(0.24, 0.12, 0.12);
  const hair = new THREE.Mesh(hairGeom, bootsMaterial);
  hair.position.set(0, 0.92, -0.07);
  hair.castShadow = true;
  group.add(hair);

  const sideburnGeom = new THREE.BoxGeometry(0.03, 0.08, 0.06);
  const leftSideburn = new THREE.Mesh(sideburnGeom, bootsMaterial);
  leftSideburn.position.set(-0.115, 0.88, 0.02);
  group.add(leftSideburn);

  const rightSideburn = new THREE.Mesh(sideburnGeom, bootsMaterial);
  rightSideburn.position.set(0.115, 0.88, 0.02);
  group.add(rightSideburn);

  // Nose (Polished block)
  const noseGeom = new THREE.BoxGeometry(0.05, 0.05, 0.05);
  const nose = new THREE.Mesh(noseGeom, skinMaterial);
  nose.position.set(0, 0.9, 0.12);
  nose.castShadow = true;
  group.add(nose);

  // 6. Brimmed Hat (Blue/Dark with leather hatband)
  // Brim (flat thin box)
  const brimGeom = new THREE.BoxGeometry(0.38, 0.03, 0.38);
  const brim = new THREE.Mesh(brimGeom, hatMaterial);
  brim.position.set(0, 1.01, 0);
  brim.rotation.x = 0.05; // Slightly cocked forward
  brim.castShadow = true;
  group.add(brim);

  // Leather hat band directly above the brim
  const bandGeom = new THREE.BoxGeometry(0.23, 0.03, 0.23);
  const hatBand = new THREE.Mesh(bandGeom, leatherMaterial);
  hatBand.position.set(0, 1.035, -0.01);
  hatBand.rotation.x = 0.05;
  hatBand.castShadow = true;
  group.add(hatBand);

  // Hat Cap (raised block on top of brim)
  const capGeom = new THREE.BoxGeometry(0.22, 0.12, 0.22);
  const cap = new THREE.Mesh(capGeom, hatMaterial);
  cap.position.set(0, 1.08, -0.02);
  cap.rotation.x = 0.05;
  cap.castShadow = true;
  group.add(cap);

  // Pivot centering: Scale down character slightly to look beautifully sized
  group.scale.set(0.8, 0.8, 0.8);

  return group;
}

/**
 * Creates a stylized cute low-poly shrub/bush.
 * @param {number} scale - Scale multiplier for the shrub
 * @param {number} shadeIndex - Pick a stable green shade from the TREE_GREENS array
 * @returns {THREE.Group}
 */
export function createShrub(scale = 1.0, shadeIndex = 0) {
  const shrubGroup = new THREE.Group();

  const leafColor = TREE_GREENS[(shadeIndex + 2) % TREE_GREENS.length]; // Offset shade index so it differs from neighboring trees!
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

  // 3 overlapping faceted dodecahedrons representing organic foliage
  const sphereGeom = new THREE.DodecahedronGeometry(0.3, 0); // faceted low-poly sphere

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

  shrubGroup.scale.set(scale, scale, scale);
  return shrubGroup;
}

/**
 * Creates the Fox - an orange red low-poly model with white chest & tail tip.
 * @returns {THREE.Group}
 */
export function createFox() {
  const group = new THREE.Group();

  const orangeMaterial = new THREE.MeshStandardMaterial({ color: COLORS.FOX, flatShading: true, roughness: 0.6 });
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xfafafa, flatShading: true, roughness: 0.7 });
  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, flatShading: true, roughness: 0.8 });

  // 1. Torso/Body (Orange box)
  const bodyGeom = new THREE.BoxGeometry(0.62, 0.28, 0.28);
  const body = new THREE.Mesh(bodyGeom, orangeMaterial);
  body.position.set(0, 0.28, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 2. White Chest (thin slab on front torso)
  const chestGeom = new THREE.BoxGeometry(0.18, 0.22, 0.26);
  const chest = new THREE.Mesh(chestGeom, whiteMaterial);
  chest.position.set(0.23, 0.28, 0);
  chest.castShadow = true;
  group.add(chest);

  // 3. Legs (4 thin orange boxes with black paws/cuffs)
  const legGeom = new THREE.BoxGeometry(0.07, 0.16, 0.07);
  const pawGeom = new THREE.BoxGeometry(0.08, 0.08, 0.08);

  const legPositions = [
    { x: 0.22, z: 0.1 },  // Front Left
    { x: 0.22, z: -0.1 }, // Front Right
    { x: -0.22, z: 0.1 }, // Back Left
    { x: -0.22, z: -0.1 } // Back Right
  ];

  legPositions.forEach(pos => {
    // Orange upper leg
    const leg = new THREE.Mesh(legGeom, orangeMaterial);
    leg.position.set(pos.x, 0.16, pos.z);
    leg.castShadow = true;
    group.add(leg);

    // Black lower leg cuff / paw
    const paw = new THREE.Mesh(pawGeom, blackMaterial);
    paw.position.set(pos.x, 0.04, pos.z);
    paw.castShadow = true;
    group.add(paw);
  });

  // 4. Head Group (Rotated for cuteness, looking forward/slightly sideways)
  const headGroup = new THREE.Group();
  headGroup.position.set(0.35, 0.44, 0);

  // Main Head Block (Orange)
  const headGeom = new THREE.BoxGeometry(0.24, 0.24, 0.24);
  const head = new THREE.Mesh(headGeom, orangeMaterial);
  head.castShadow = true;
  headGroup.add(head);

  // White Cheeks / Muzzle base
  const cheekGeom = new THREE.BoxGeometry(0.08, 0.12, 0.26);
  const cheek = new THREE.Mesh(cheekGeom, whiteMaterial);
  cheek.position.set(0.04, -0.04, 0);
  cheek.castShadow = true;
  headGroup.add(cheek);

  // Nose/Snout (Orange with black nose tip)
  const snoutGeom = new THREE.BoxGeometry(0.12, 0.08, 0.1);
  const snout = new THREE.Mesh(snoutGeom, orangeMaterial);
  snout.position.set(0.14, -0.04, 0);
  snout.castShadow = true;
  headGroup.add(snout);

  const noseTipGeom = new THREE.BoxGeometry(0.04, 0.04, 0.06);
  const noseTip = new THREE.Mesh(noseTipGeom, blackMaterial);
  noseTip.position.set(0.21, -0.02, 0);
  noseTip.castShadow = true;
  headGroup.add(noseTip);

  // Ears (Two orange triangles/boxes on top with black/white inner)
  const earGeom = new THREE.BoxGeometry(0.06, 0.14, 0.08);
  const leftEar = new THREE.Mesh(earGeom, orangeMaterial);
  leftEar.position.set(-0.04, 0.16, 0.07);
  leftEar.rotation.z = -0.1;
  leftEar.castShadow = true;
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeom, orangeMaterial);
  rightEar.position.set(-0.04, 0.16, -0.07);
  rightEar.rotation.z = -0.1;
  rightEar.castShadow = true;
  headGroup.add(rightEar);

  group.add(headGroup);

  // 5. Tail (Thick orange box with white tip, pointing angled up/backwards)
  const tailGroup = new THREE.Group();
  tailGroup.position.set(-0.28, 0.28, 0);

  // Orange tail segment
  const tailBaseGeom = new THREE.BoxGeometry(0.3, 0.14, 0.14);
  const tailBase = new THREE.Mesh(tailBaseGeom, orangeMaterial);
  tailBase.position.set(-0.12, 0.06, 0);
  tailBase.rotation.z = -0.3; // Angle upwards
  tailBase.castShadow = true;
  tailGroup.add(tailBase);

  // White tail tip
  const tailTipGeom = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  const tailTip = new THREE.Mesh(tailTipGeom, whiteMaterial);
  tailTip.position.set(-0.29, 0.12, 0);
  tailTip.rotation.z = -0.3;
  tailTip.castShadow = true;
  tailGroup.add(tailTip);

  group.add(tailGroup);

  // Adjust overall fox scale slightly to be smaller than shepherd
  group.scale.set(0.85, 0.85, 0.85);

  return group;
}

/**
 * Creates a fluffy, cloud-like white sheep with blocky legs and cute face details.
 * @param {number} scaleModifier - scale of the sheep (e.g. 0.85 for lamb)
 * @param {number} rotationOffset - initial rotation offset in radians
 * @returns {THREE.Group}
 */
export function createSheep(scaleModifier = 1.0, rotationOffset = 0.0) {
  const group = new THREE.Group();

  const woolMaterial = new THREE.MeshStandardMaterial({ color: COLORS.SHEEP, flatShading: true, roughness: 0.9 });
  const faceMaterial = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, flatShading: true, roughness: 0.85 }); // Dark grey/black face
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 0.5 });
  const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, flatShading: true, roughness: 0.5 });
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, flatShading: true, roughness: 0.9 });

  // 1. Cloud-like Fluffy Body (composed of several overlapping boxes of varying sizes)
  const bodyGroup = new THREE.Group();

  // Main Central Box
  const bodyGeom1 = new THREE.BoxGeometry(0.65, 0.44, 0.46);
  const b1 = new THREE.Mesh(bodyGeom1, woolMaterial);
  b1.position.set(0, 0.35, 0);
  b1.castShadow = true;
  b1.receiveShadow = true;
  bodyGroup.add(b1);

  // Top Fluff
  const bodyGeom2 = new THREE.BoxGeometry(0.48, 0.12, 0.38);
  const b2 = new THREE.Mesh(bodyGeom2, woolMaterial);
  b2.position.set(0, 0.58, 0);
  b2.castShadow = true;
  bodyGroup.add(b2);

  // Front Fluff
  const bodyGeom3 = new THREE.BoxGeometry(0.14, 0.34, 0.38);
  const b3 = new THREE.Mesh(bodyGeom3, woolMaterial);
  b3.position.set(0.35, 0.35, 0);
  b3.castShadow = true;
  bodyGroup.add(b3);

  // Back Fluff
  const bodyGeom4 = new THREE.BoxGeometry(0.14, 0.34, 0.38);
  const b4 = new THREE.Mesh(bodyGeom4, woolMaterial);
  b4.position.set(-0.35, 0.35, 0);
  b4.castShadow = true;
  bodyGroup.add(b4);

  // Left/Right side bumps
  const bodyGeom5 = new THREE.BoxGeometry(0.48, 0.34, 0.1);
  const b5 = new THREE.Mesh(bodyGeom5, woolMaterial);
  b5.position.set(0, 0.35, 0.24);
  b5.castShadow = true;
  bodyGroup.add(b5);

  const b6 = new THREE.Mesh(bodyGeom5, woolMaterial);
  b6.position.set(0, 0.35, -0.24);
  b6.castShadow = true;
  bodyGroup.add(b6);

  // Cute fluffy tail at the back of the body
  const tailGeom = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  const tail = new THREE.Mesh(tailGeom, woolMaterial);
  tail.position.set(-0.43, 0.45, 0);
  tail.rotation.z = -0.25; // angled up/out slightly
  tail.castShadow = true;
  bodyGroup.add(tail);

  group.add(bodyGroup);

  // 2. Dark Face / Snout (sticks out the front)
  const headGroup = new THREE.Group();
  headGroup.position.set(0.38, 0.42, 0);

  // Dark head box
  const headGeom = new THREE.BoxGeometry(0.18, 0.18, 0.18);
  const head = new THREE.Mesh(headGeom, faceMaterial);
  head.castShadow = true;
  headGroup.add(head);

  // Cute minimalist black spheres for eyes on the dark face, using white background spheres with black pupil spheres
  const scleraGeom = new THREE.SphereGeometry(0.035, 4, 4);
  const pupilGeom = new THREE.SphereGeometry(0.018, 4, 4);

  // Left side eye
  const leftSclera = new THREE.Mesh(scleraGeom, eyeMaterial);
  leftSclera.position.set(0.05, 0.02, 0.08);
  headGroup.add(leftSclera);

  const leftPupil = new THREE.Mesh(pupilGeom, pupilMaterial);
  leftPupil.position.set(0.065, 0.02, 0.085);
  headGroup.add(leftPupil);

  // Right side eye
  const rightSclera = new THREE.Mesh(scleraGeom, eyeMaterial);
  rightSclera.position.set(0.05, 0.02, -0.08);
  headGroup.add(rightSclera);

  const rightPupil = new THREE.Mesh(pupilGeom, pupilMaterial);
  rightPupil.position.set(0.065, 0.02, -0.085);
  headGroup.add(rightPupil);

  // White Wool cap on top of head
  const headCapGeom = new THREE.BoxGeometry(0.12, 0.08, 0.14);
  const headCap = new THREE.Mesh(headCapGeom, woolMaterial);
  headCap.position.set(-0.02, 0.11, 0);
  headCap.castShadow = true;
  headGroup.add(headCap);

  // Small white floppy, blocky ears (simple white boxes) hanging on the sides
  const earGeom = new THREE.BoxGeometry(0.04, 0.08, 0.06);
  const leftEar = new THREE.Mesh(earGeom, woolMaterial);
  leftEar.position.set(-0.02, 0.04, 0.1);
  leftEar.rotation.z = -0.15; // Floppy angle
  leftEar.castShadow = true;
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeom, woolMaterial);
  rightEar.position.set(-0.02, 0.04, -0.1);
  rightEar.rotation.z = -0.15; // Floppy angle
  rightEar.castShadow = true;
  headGroup.add(rightEar);

  group.add(headGroup);

  // 3. Dark blocky legs (4 thin dark cylinders or boxes)
  const legGeom = new THREE.BoxGeometry(0.08, 0.22, 0.08);
  const legPositions = [
    { x: 0.2, z: 0.15 },
    { x: 0.2, z: -0.15 },
    { x: -0.2, z: 0.15 },
    { x: -0.2, z: -0.15 }
  ];

  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeom, legMaterial);
    leg.position.set(pos.x, 0.11, pos.z);
    leg.castShadow = true;
    group.add(leg);
  });

  // Apply scaling modifier and initial rotation offset
  group.scale.set(scaleModifier, scaleModifier, scaleModifier);
  group.rotation.y = rotationOffset;
  group.userData.rotationOffset = rotationOffset;

  return group;
}
