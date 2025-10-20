import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, cube, cone, torus;

const init = () => {
  console.log('Three.js initialized');

  // Scene
  scene = new THREE.Scene();
  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  scene.background = new THREE.Color(0x87ceeb);

  // Lights
  const light = new THREE.DirectionalLight(0xffffff, 5);
  light.position.set(-1, 2, 4);
  scene.add(light);
  const ambientlight = new THREE.AmbientLight(0x11ffff, 1);
  ambientlight.position.set(0, 2, 0);
  scene.add(ambientlight);
  const redlight = new THREE.DirectionalLight(0xff0000, 5);
  redlight.position.set(-2, 1, 0);
  scene.add(redlight);

  // Axes helper
  const axesH = new THREE.AxesHelper(5);
  scene.add(axesH);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer?.domElement);
  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 1;
  controls.maxDistance = 5;

  controls.maxPolarAngle = Math.PI / 2;

  // Geometry
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({color: 0x135443ff});
  cube = new THREE.Mesh(geometry, material);

  const ConeGeometry = new THREE.ConeGeometry(1, 2, 8);
  const conemat = new THREE.MeshPhongMaterial({color: 0x439479});
  cone = new THREE.Mesh(ConeGeometry, conemat);
  cone.position.set(-2, 1, 1);

  const torusGeometry = new THREE.TorusKnotGeometry(1, 0.4, 16, 100);
  const torusMaterial = new THREE.MeshToonMaterial({color: 0xff6347});
  torus = new THREE.Mesh(torusGeometry, torusMaterial);
  torus.position.set(2, 1, 1);
  torus.scale.set(0.5, 0.5, 0.5);
  scene.add(torus);

  // Add geometry toscene
  scene.add(cube);
  scene.add(cone);
  scene.add(torus);
  camera.position.z = 5;
};
init();

const animate = () => {
  cube.rotation.x += 0.1;
  cube.rotation.y += 0.01;
  cone.rotation.x += 0.01;
  torus.rotation.x += 0.01;
};

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
  animate();
}
render();

window.addEventListener('resize', resize);
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
resize();
