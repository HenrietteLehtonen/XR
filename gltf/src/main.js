import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
// HDR loader
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';
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
  raycaster,
  group;

// estetään ne objektit joita ei voi poimia -> kato blenderistä miten nimetty
const arr = ['ground', 'maa'];
// raycasterin löytämät objektit taulukkoon
const intersected = [];
const tempMatrix = new THREE.Matrix4();

const startVR = () => {
  document.body.appendChild(VRButton.createButton(renderer));
  // mahollistaa XRrän
  renderer.xr.enabled = true;

  // VR ohjaimet
  //VR controller
  controller1 = renderer.xr.getController(0);
  controller1.addEventListener('selectstart', onSelectStart);
  controller1.addEventListener('selectend', onSelectEnd);
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener('selectstart', onSelectStart);
  controller2.addEventListener('selectend', onSelectEnd);
  scene.add(controller2);

  // ohjaimien malli
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

  const loadergun = new GLTFLoader().setPath('./');
  loadergun.load('gundy/scene.gltf', async function (gltf) {
    gltf.scene.scale.set(0.0003, 0.0003, 0.0003);
    let mymodel = gltf.scene;
    mymodel.rotation.y = THREE.MathUtils.degToRad(180);
    mymodel.rotation.x = THREE.MathUtils.degToRad(-36.5);
    mymodel.position.set(0, 0.01, 0);
    controllerGrip2.add(mymodel);
  });
  scene.add(controllerGrip2);

  // ------

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

////
/* THREE JS */

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
  // Renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // HDR
  new HDRLoader().setPath('./').load('tausta.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;

    // gltf mallui
    const loader = new GLTFLoader().setPath('./');

    // maa
    loader.load('ground.glb', async function (gltf) {
      const ground = gltf.scene;
      // ground.scale.set(0.1, 0.1, 0.1);
      //scene.add(ground);
      await renderer.compileAsync(ground, camera, scene);
      group.add(ground);
    });

    // haudat, puut jne
    loader.load('objects.glb', async function (gltf) {
      const objects = gltf.scene;
      await renderer.compileAsync(objects, camera, scene);
      group.add(objects);
    });
  });

  group = new THREE.Group();
  scene.add(group);

  // Axes helper
  const axesHelper = new THREE.AxesHelper(5);
  //scene.add(axesH);

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

  // // Controls
  controls = new OrbitControls(camera, renderer?.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 5;
  controls.maxPolarAngle = Math.PI / 2;

  camera.position.z = 5;
  camera.lookAt(axesHelper.position);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // start vr
  startVR();
};
init();

function onSelectStart(event) {
  const controller = event.target;

  const intersections = getIntersections(controller);

  if (intersections.length > 0) {
    const intersection = intersections[0];

    const object = intersection.object;
    if (!arr.includes(object.name)) {
      //console.log('picked an object');
      object.material.emissive.b = 1;
      controller.attach(object);
    }

    controller.userData.selected = object;
  }

  controller.userData.targetRayMode = event.data.targetRayMode;
}

function onSelectEnd(event) {
  const controller = event.target;

  if (controller.userData.selected !== undefined) {
    const object = controller.userData.selected;
    object.material.emissive.b = 0;
    group.attach(object);

    controller.userData.selected = undefined;
  }
}

function getIntersections(controller) {
  controller.updateMatrixWorld();

  raycaster.setFromXRController(controller);

  return raycaster.intersectObjects(group.children, true);
}

function intersectObjects(controller) {
  // Do not highlight in mobile-ar

  if (controller.userData.targetRayMode === 'screen') return;

  // Do not highlight when already selected

  if (controller.userData.selected !== undefined) return;

  const line = controller.getObjectByName('line');
  const intersections = getIntersections(controller);

  if (intersections.length > 0) {
    const intersection = intersections[0];

    const object = intersection.object;
    if (!arr.includes(object.name)) {
      //console.log('picked an object');
      object.material.emissive.r = 1;
      intersected.push(object);
    }

    line.scale.z = intersection.distance;
  } else {
    line.scale.z = 5;
  }
}

function cleanIntersected() {
  while (intersected.length) {
    const object = intersected.pop();
    object.material.emissive.r = 0;
  }
}

renderer.setAnimationLoop(function () {
  cleanIntersected();
  intersectObjects(controller1);
  intersectObjects(controller2);
  controls.update();
  renderer.render(scene, camera);
});

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize, false);
