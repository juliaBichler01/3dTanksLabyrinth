import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./styles.css";

// Expose THREE globally for AR.js
window.THREE = THREE;

let camera, renderer, scene, car;

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
    40,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.set(0, 1000, 1000);

  createBackground();
  createCar();
  createWalls();
  createBorderWall();

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 300;
  controls.maxDistance = 1500;

  window.addEventListener("resize", onWindowResize);
}

init().catch(console.error);

function createBackground() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  scene.add(new THREE.GridHelper(400, 10));
  scene.add(new THREE.AxesHelper(20));

  const ambientLight = new THREE.AmbientLight(0xffffff, 1); // color, intensity
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 5); // color, intensity
  directionalLight.position.set(-400, 1000, -500); // position it above the box
  scene.add(directionalLight);
}

function createCar() {
  const geometryBase = new THREE.BoxGeometry(28, 14, 60);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const boxBase = new THREE.Mesh(geometryBase, material);
  boxBase.position.set(0, 12, 0);

  const geometryTop = new THREE.BoxGeometry(28, 10, 30);
  const boxTop = new THREE.Mesh(geometryTop, material);
  boxTop.position.set(0, 24, 0);

  const geometryWheel = new THREE.CylinderGeometry(6, 6, 6, 32);
  const materialWheel = new THREE.MeshBasicMaterial({ color: 0x303030 });

  const wheel1 = new THREE.Mesh(geometryWheel, materialWheel);
  wheel1.rotation.set(0, 0, Math.PI / 2);
  wheel1.position.set(-12, 6, -16);

  const wheel2 = new THREE.Mesh(geometryWheel, materialWheel);
  wheel2.rotation.set(0, 0, Math.PI / 2);
  wheel2.position.set(-12, 6, 16);

  const wheel3 = new THREE.Mesh(geometryWheel, materialWheel);
  wheel3.rotation.set(0, 0, Math.PI / 2);
  wheel3.position.set(12, 6, -16);

  const wheel4 = new THREE.Mesh(geometryWheel, materialWheel);
  wheel4.rotation.set(0, 0, Math.PI / 2);
  wheel4.position.set(12, 6, 16);

  car = new THREE.Group();
  car.add(boxBase);
  car.add(boxTop);
  car.add(wheel1);
  car.add(wheel2);
  car.add(wheel3);
  car.add(wheel4);
  car.position.set(-180, 0, 240);

  scene.add(car);
}

function createWalls() {
  const geometryWallHorizontal = new THREE.BoxGeometry(44, 40, 4);
  const geometryWallVertical = new THREE.BoxGeometry(4, 40, 44);
  const material = new THREE.MeshStandardMaterial({ color: 0x73573f });

  const exampleGridVertical = [
    [1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 1, 0, 0, 1, 0, 1, 0, 1, 1],
    [0, 1, 0, 0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 1, 1, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 0, 1, 0, 0, 1, 1, 1, 0],
    [1, 1, 0, 1, 0, 1, 0, 0, 1, 1],
  ];
  const exampleGridHorizontal = [
    [1, 0, 0, 1, 1, 0, 1, 0, 1],
    [0, 1, 1, 0, 0, 1, 0, 1, 0],
    [1, 1, 0, 0, 1, 1, 0, 1, 1],
    [0, 0, 1, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 1, 1, 0, 1],
    [0, 1, 0, 1, 0, 0, 0, 1, 0],
    [1, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1],
  ];

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 9; j++) {
      if (exampleGridHorizontal[i][j]) {
        const wallHorizontal = new THREE.Mesh(geometryWallHorizontal, material);
        wallHorizontal.position.set((i - 4) * 40 - 20, 20, (j - 4) * 40);
        scene.add(wallHorizontal);
      }
    }
  }

  // for (let i = 0; i < 9; i++) {
  //   for (let j = 0; j < 10; j++) {
  //     if (exampleGridVertical[i][j]) {
  //       const wallVertical = new THREE.Mesh(geometryWallVertical, material);
  //       wallVertical.position.set((i - 4) * 40, 20, (j - 4) * 40 - 20);
  //       scene.add(wallVertical);
  //     }
  //   }
  // }
}

function createBorderWall() {
  const geometryWallHorizontal = new THREE.BoxGeometry(364, 40, 4);
  const geometryWallVertical = new THREE.BoxGeometry(4, 40, 404);
  const material = new THREE.MeshStandardMaterial({ color: 0x73573f });

  const wallHorizontal1 = new THREE.Mesh(geometryWallHorizontal, material);
  wallHorizontal1.position.set(-20, 20, -200);
  scene.add(wallHorizontal1);
  const wallHorizontal2 = new THREE.Mesh(geometryWallHorizontal, material);
  wallHorizontal2.position.set(20, 20, 200);
  scene.add(wallHorizontal2);

  const wallVertical1 = new THREE.Mesh(geometryWallVertical, material);
  wallVertical1.position.set(-200, 20, 0);
  scene.add(wallVertical1);
  const wallVertical2 = new THREE.Mesh(geometryWallVertical, material);
  wallVertical2.position.set(200, 20, 0);
  scene.add(wallVertical2);
}
