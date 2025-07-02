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

  // for testing: addWalls();

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

  // implement keyborad controls
  window.addEventListener("keydown", function (event) {
    if (event.code == "ArrowUp") {
      moveUp();
    } else if (event.code == "ArrowDown") {
      moveDown();
    } else if (event.code == "ArrowLeft") {
      moveLeft();
    }
    if (event.code == "ArrowRight") {
      moveRight();
    }
  });

  document.getElementById("buttonRight").addEventListener("click", () => {
    moveRight();
  });
  document.getElementById("buttonLeft").addEventListener("click", () => {
    moveLeft();
  });
  document.getElementById("buttonUp").addEventListener("click", () => {
    moveUp();
  });
  document.getElementById("buttonDown").addEventListener("click", () => {
    moveDown();
  });
}

init().catch(console.error);

function createBackground() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  scene.add(new THREE.GridHelper(600, 10));
  scene.add(new THREE.AxesHelper(20));

  const ambientLight = new THREE.AmbientLight(0xffffff, 1); // color, intensity
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 5); // color, intensity
  directionalLight.position.set(-400, 1000, -500); // position it above the box
  scene.add(directionalLight);
}

let car_boundingBox = new THREE.Box3();

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
  car.position.set(-270, 0, 340);

  scene.add(car);
}

function createWalls() {
  const geometryWallHorizontal = new THREE.BoxGeometry(64, 40, 4);
  const geometryWallVertical = new THREE.BoxGeometry(4, 40, 64);
  const material = new THREE.MeshStandardMaterial({ color: 0x73573f });

  const exampleGridHorizontal = [
    [1, 0, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 0, 1, 1, 0, 0, 0],
    [0, 1, 0, 1, 1, 1, 0, 1, 1],
    [0, 0, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 0, 0, 0],
  ];
  const exampleGridVertical = [
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [0, 1, 1, 0, 0, 1, 0, 1, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 1, 1, 0, 1],
  ];

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 9; j++) {
      if (exampleGridHorizontal[i][j]) {
        const wallHorizontal = new THREE.Mesh(geometryWallHorizontal, material);
        wallHorizontal.position.set((i - 4) * 60 - 30, 20, (j - 4) * 60);
        scene.add(wallHorizontal);
      }
    }
  }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 10; j++) {
      if (exampleGridVertical[i][j]) {
        const wallVertical = new THREE.Mesh(geometryWallVertical, material);
        wallVertical.position.set((i - 4) * 60, 20, (j - 4) * 60 - 30);
        scene.add(wallVertical);
      }
    }
  }
}

function createBorderWall() {
  const geometryWallHorizontal = new THREE.BoxGeometry(544, 40, 4);
  const geometryWallVertical = new THREE.BoxGeometry(4, 40, 604);
  const material = new THREE.MeshStandardMaterial({ color: 0x73573f });

  const wallHorizontal1 = new THREE.Mesh(geometryWallHorizontal, material);
  wallHorizontal1.position.set(-30, 20, -300);
  scene.add(wallHorizontal1);
  const wallHorizontal2 = new THREE.Mesh(geometryWallHorizontal, material);
  wallHorizontal2.position.set(30, 20, 300);
  scene.add(wallHorizontal2);

  const wallVertical1 = new THREE.Mesh(geometryWallVertical, material);
  wallVertical1.position.set(-300, 20, 0);
  scene.add(wallVertical1);
  const wallVertical2 = new THREE.Mesh(geometryWallVertical, material);
  wallVertical2.position.set(300, 20, 0);
  scene.add(wallVertical2);
}

//TODO: add better collision handling with different walls

let walls = [];

//TODO: function used to test/devolp collision logic. Remove before submitting
function addWalls() {
  const geometryBase = new THREE.BoxGeometry(450, 100, 10);
  const material = new THREE.MeshStandardMaterial({ color: 0x0fff00 });

  const wall1 = new THREE.Mesh(geometryBase, material);
  wall1.position.set(-150, 50, 0);

  const wall2 = new THREE.Mesh(geometryBase, material);
  wall2.position.set(150, 50, -150);

  const wall3 = new THREE.Mesh(geometryBase, material);
  wall3.position.set(150, 50, 150);

  const vert_geometryBase = new THREE.BoxGeometry(10, 100, 150);
  const wall4 = new THREE.Mesh(vert_geometryBase, material);
  wall4.position.set(0, 50, 350);

  scene.add(wall1);
  scene.add(wall2);
  scene.add(wall3);
  scene.add(wall4);

  walls = [wall1, wall2, wall3, wall4];
}

function checkForIntersection() {
  car_boundingBox.setFromObject(car);

  for (var i = 0; i < walls.length; i++) {
    // get bounding box of wall
    let bounding_box = new THREE.Box3();
    bounding_box.setFromObject(walls[i]);

    if (bounding_box.intersectsBox(car_boundingBox)) {
      // ---- for debugging
      //walls[i].material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      // ----

      return true;
    }
  }
  return false;
}

function moveLeft() {
  if (car.rotation != (0, Math.PI / 2, 0)) {
    car.rotation.set(0, Math.PI / 2, 0);
  }

  // check wall boundaries
  if (car.position.x < -350) {
    return;
  }

  car.position.x = car.position.x - 10;

  if (checkForIntersection()) {
    moveRight();
  }
}

function moveRight() {
  if (car.rotation != (0, Math.PI / 2, 0)) {
    car.rotation.set(0, Math.PI / 2, 0);
  }

  // check wall boundaries
  if (car.position.x > 350) {
    return;
  }

  car.position.x = car.position.x + 10;

  if (checkForIntersection()) {
    moveLeft();
  }
}

function moveUp() {
  if (car.rotation != (0, 0, 0)) {
    car.rotation.set(0, 0, 0);
  }

  // check wall boundaries
  if (car.position.z < -350) {
    return;
  }
  car.position.z = car.position.z - 10;
  if (checkForIntersection()) {
    moveDown();
  }
}

function moveDown() {
  if (car.rotation != (0, 0, 0)) {
    car.rotation.set(0, 0, 0);
  }

  // check wall boundaries
  if (car.position.z > 350) {
    return;
  }
  car.position.z = car.position.z + 10;
  if (checkForIntersection()) {
    moveUp();
  }
}
