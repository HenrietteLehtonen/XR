import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TTFLoader} from 'three/examples/jsm/loaders/TTFLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';

let scene, camera, renderer, controls;
const header = document.querySelector('header');

const init = () => {
  console.log('Three.js initialized');

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x121212);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    header.clientWidth / header.clientHeight,
    0.1,
    1000,
  );
  camera.position.z = 3; // Lisätty kamera eteenpäin, jotta scene näkyy

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2);
  keyLight.position.set(3, 3, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const pinkFill = new THREE.PointLight(0xff4df2, 1.5, 10);
  pinkFill.position.set(-3, 1, 2);
  scene.add(pinkFill);

  const purpleRim = new THREE.DirectionalLight(0x9b4dff, 2);
  purpleRim.position.set(0, 3, -4);
  scene.add(purpleRim);

  const bounceLight = new THREE.PointLight(0xffffff, 0.7, 10);
  bounceLight.position.set(0, -2, 1);
  scene.add(bounceLight);

  // Renderer
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  header.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 5;
  controls.maxPolarAngle = Math.PI / 2;

  // Renderer size päivitys
  function updateRendererSize() {
    const width = header.clientWidth;
    const height = header.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  updateRendererSize();

  // Text geometry
  const ttfLoader = new TTFLoader();
  const fontLoader = new FontLoader();

  ttfLoader.load('./BagelFatOne-Regular.ttf', (jsonData) => {
    const font = fontLoader.parse(jsonData);

    const textGeo = new TextGeometry('WEB XR', {
      font: font,
      size: 1.5,
      depth: 0.2,
    });

    const textMaterial = new THREE.MeshPhongMaterial({
      color: 0x495057,
      shininess: 100,
      specular: 0xffffff,
    });

    textGeo.computeBoundingBox();
    textGeo.center();

    const textMesh = new THREE.Mesh(textGeo, textMaterial);
    scene.add(textMesh);
  });

  window.addEventListener('resize', resize);
  function resize() {
    updateRendererSize();
  }

  // Render loop
  function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
  }
  render();
};

window.addEventListener('load', init);
