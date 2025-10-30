import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, cube, cone, torus;
const loader = new GLTFLoader();

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
  scene.background = new THREE.Color(0x11151c);

  // Lights
  const ambientlight = new THREE.AmbientLight(0xffffff, 1);
  ambientlight.position.set(0, 2, 0);
  scene.add(ambientlight);

  const orange = new THREE.DirectionalLight(0xff7f11, 1);
  orange.position.set(2, 2, 4);
  scene.add(orange);

  // const green = new THREE.PointLight(0x00ff66, 1.2, 2);
  // green.position.set(-1, 0.5, -2);
  // scene.add(green);

  // Axes helper
  const axesH = new THREE.AxesHelper(5);
  scene.add(axesH);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer?.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  controls.screenSpacePanning = false;

  controls.minDistance = 1;
  controls.maxDistance = 5;

  controls.maxPolarAngle = Math.PI / 2;

  // Geometry
  // const geometry = new THREE.BoxGeometry(1, 1, 1);
  // const material = new THREE.MeshPhongMaterial({color: 0x135443ff});
  // cube = new THREE.Mesh(geometry, material);

  // // Add geometry toscene
  // scene.add(cube);

  // GLTF MODEL *********
  loader.load('./hauttis.glb', function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.1, 0.1, 0.1);
    scene.add(model);
  });
  //*************  */

  camera.position.z = 5;
};
init();

const animate = () => {
  cube.rotation.x += 0.1;
  cube.rotation.y += 0.01;
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
