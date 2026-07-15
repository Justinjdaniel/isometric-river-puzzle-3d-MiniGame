import * as THREE from 'three';

// 1. Scene Setup
const scene = new THREE.Scene();
// Set background to a deep, dark atmospheric color
scene.background = new THREE.Color('#0b0e14');

// 2. Camera Setup (Orthographic Camera for Isometric Projection)
const aspect = window.innerWidth / window.innerHeight;
const d = 5; // View size factor
const camera = new THREE.OrthographicCamera(
  -d * aspect, d * aspect,
  d, -d,
  1, 1000
);

// Position camera for Isometric View
// Angle: 30 degrees down (Y), 45 degrees rotation (X/Z)
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

// 3. Renderer Setup
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// 4. Lighting Setup (Low-Poly Flat-Shaded Rig)
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5);
directionalLight.position.set(15, 20, 10);
directionalLight.castShadow = true;
// Shadow Map resolution configuration
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// 5. Add a Low-Poly Spinning Cube (Faceted MeshStandardMaterial)
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({
  color: 0x00ffcc,
  flatShading: true,
  roughness: 0.5,
  metalness: 0.1
});

const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

// Add a simple ground plane to display shadows
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0x1b2330,
  flatShading: true,
  roughness: 0.8
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1.5;
plane.receiveShadow = true;
scene.add(plane);

// 6. Window Resize Handler
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const newAspect = width / height;

  // Update Orthographic Camera bounds
  camera.left = -d * newAspect;
  camera.right = d * newAspect;
  camera.top = d;
  camera.bottom = -d;
  camera.updateProjectionMatrix();

  // Update Renderer size
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 7. Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the cube on multiple axes for a full flat-shaded 3D look
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.015;
  cube.rotation.z += 0.005;

  renderer.render(scene, camera);
}

// Start animation loop
animate();

console.log('Three.js Isometric low-poly boilerplate successfully initialized!');
