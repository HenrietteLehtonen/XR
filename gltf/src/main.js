import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
// VR
import {VRButton} from 'three/addons/webxr/VRButton.js';
import {XRControllerModelFactory} from 'three/addons/webxr/XRControllerModelFactory.js';

let scene,
  camera,
  renderer,
  controls,
  cube,
  controller1,
  controller2,
  controllerGrip1,
  controllerGrip2,
  raycaster;

// raycasterin löytämät objektit
const intersected = [];
const tempMatrix = new THREE.Matrix4();

let group;

const loader = new GLTFLoader();

const startVR = () => {
  document.body.appendChild(VRButton.createButton(renderer));
  // mahollistaa XRrän
  renderer.xr.enabled = true;

  // VR ohjaimet
  //VR controllers
  controller1 = renderer.xr.getController(0);
  controller1.addEventListener('selectstart', onSelectStart);
  controller1.addEventListener('selectend', onSelectEnd);
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener('selectstart', onSelectStart);
  controller2.addEventListener('selectend', onSelectEnd);
  scene.add(controller2);
  const controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1),
  );
  scene.add(controllerGrip1);

  // controllerGrip2 = renderer.xr.getControllerGrip(1);
  // controllerGrip2.add(
  //   controllerModelFactory.createControllerModel(controllerGrip2),
  // );
  // scene.add(controllerGrip2);

  // oma malli ohjaimeks demo
  controllerGrip2 = renderer.xr.getControllerGrip(1);
  const loader = new GLTFLoader().setPath('./');
  loader.load('gundy/scene.gltf', async function (gltf) {
    gltf.scene.scale.set(0.0003, 0.0003, 0.0003);
    let mymodel = gltf.scene;
    mymodel.rotation.y = THREE.MathUtils.degToRad(180);
    mymodel.rotation.x = THREE.MathUtils.degToRad(-36.5);
    mymodel.position.set(0, 0.01, 0);
    controllerGrip2.add(mymodel);
  });
  scene.add(controllerGrip2);

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);

  const line = new THREE.Line(geometry);
  line.name = 'line';
  line.scale.z = 5;

  controller1.add(line.clone());
  controller2.add(line.clone());

  raycaster = new THREE.Raycaster();
};

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
  //scene.background = new THREE.Color(0x11151c);
  const taustaloader = new THREE.TextureLoader();
  const texture = taustaloader.load('/tausta.jpg', () => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
  });

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
    // model.scale.set(0.1, 0.1, 0.1);
    scene.add(model);
  });
  //*************  */

  camera.position.z = 5;

  // start vr
  startVR();
};
init();

const animate = () => {
  cube.rotation.x += 0.1;
  cube.rotation.y += 0.01;
};

renderer.setAnimationLoop(function () {
  renderer.render(scene, camera);
});

window.addEventListener('resize', resize);
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
resize();
