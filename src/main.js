import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./styles.css";

// Expose THREE globally for AR.js
window.THREE = THREE;

let camera, renderer, scene;

// Dynamically load ar-threex.min.js AFTER setting window.THREE
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.render(scene, camera);
}

async function init() {
  await loadScript("/libs/ar-threex.min.js");

  // Now THREEx is available on window.THREEx
  const THREEx = window.THREEx;

  THREEx.ArToolkitContext.baseURL = "../";

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(0, 200, 300);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  scene.add(new THREE.GridHelper(400, 10));

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 300;
  controls.maxDistance = 700;

  window.addEventListener("resize", onWindowResize);
}

init().catch(console.error);
