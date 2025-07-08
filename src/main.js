import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./styles.css";

// Expose THREE globally for AR.js
window.THREE = THREE;

let camera, renderer, scene, car;
let walls = [];
let wallBoundingBoxes = [];


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

  // create objects in scene
  createBackground();
  createCar();
  detectWalls();

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
  window.addEventListener('keydown', function(event) {
    if (event.code == "ArrowUp") {
      moveCar("up")
    } else if (event.code == "ArrowDown") {
      moveCar("down")
    } else if (event.code == "ArrowLeft") {
      moveCar("left")
    }if (event.code == "ArrowRight") {
      moveCar("right")
    }
  });

  document.getElementById("buttonRight").addEventListener("click", () => {
    moveCar("right");
  });
  document.getElementById("buttonLeft").addEventListener("click", () => {
    moveCar("left");
  });
  document.getElementById("buttonUp").addEventListener("click", () => {
    moveCar("up");
  });
  document.getElementById("buttonDown").addEventListener("click", () => {
    moveCar("down");
  });

}

init().catch(console.error);

function createBackground() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  scene.add(new THREE.GridHelper(800, 20));
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

  car.position.set(-270, 0, 340);

  scene.add(car);
}

function detectWalls() {
  const loader = new THREE.TextureLoader();
  loader.load('/assets/labyrinth_01.jpg', function(texture) {
    // display the image on a plane (for debugging)
    const planeGeometry = new THREE.PlaneGeometry(540, 600); // Adjust size to match aspect ratio
    const planeMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 1; 
    scene.add(plane);

    // Get image data
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = texture.image;
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const wallHeight = 40;
    const material = new THREE.MeshStandardMaterial({ color: 0x73573f });

    const sceneWidth = 540;
    const sceneHeight = 600;

    const visited = new Array(image.width * image.height).fill(false);
    const wallThickness = 10; // Approximate thickness of walls in pixels

    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const index = y * image.width + x;
        if (visited[index] || data[index * 4] > 128) {
          continue;
        }

        // Check for horizontal wall
        let w = 0;
        while (x + w < image.width && data[(y * image.width + x + w) * 4] < 128) {
          w++;
        }

        let h_check = 0;
        while (y + h_check < image.height && data[((y + h_check) * image.width + x) * 4] < 128) {
          h_check++;
        }

        if (w > wallThickness) {
          let h = 0;
          while(y + h < image.height) {
            let isWallRow = true;
            for(let i = 0; i < w; i++) {
              if(data[((y+h) * image.width + x + i) * 4] > 128) {
                isWallRow = false;
                break;
              }
            }
            if(isWallRow) h++;
            else break;
          }

          if (h > 0) {
            const wallWidth = (w / image.width) * sceneWidth;
            const wallDepth = (h / image.height) * sceneHeight;
            const wallX = ((x + w / 2) / image.width) * sceneWidth - sceneWidth / 2;
            const wallZ = ((y + h / 2) / image.height) * sceneHeight - sceneHeight / 2;

            const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
            const wall = new THREE.Mesh(wallGeometry, material);
            wall.position.set(wallX, wallHeight / 2, wallZ);
            scene.add(wall);
            walls.push(wall);

            for (let i = 0; i < h; i++) {
              for (let j = 0; j < w; j++) {
                visited[(y + i) * image.width + (x + j)] = true;
              }
            }
          }
        } else if (h_check > wallThickness) {
            let h = h_check;
            let w = 0;
            while(x + w < image.width) {
                let isWallCol = true;
                for(let i = 0; i < h; i++) {
                    if(data[((y+i) * image.width + x + w) * 4] > 128) {
                        isWallCol = false;
                        break;
                    }
                }
                if(isWallCol) w++;
                else break;
            }

            if (w > 0) {
                const wallWidth = (w / image.width) * sceneWidth;
                const wallDepth = (h / image.height) * sceneHeight;
                const wallX = ((x + w / 2) / image.width) * sceneWidth - sceneWidth / 2;
                const wallZ = ((y + h / 2) / image.height) * sceneHeight - sceneHeight / 2;

                const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
                const wall = new THREE.Mesh(wallGeometry, material);
                wall.position.set(wallX, wallHeight / 2, wallZ);
                scene.add(wall);
                walls.push(wall);

                for (let i = 0; i < h; i++) {
                    for (let j = 0; j < w; j++) {
                        visited[(y + i) * image.width + (x + j)] = true;
                    }
                }
            }
        }
      }
    }

    getWallBoundingBoxes();
  });
}

function checkForIntersection(direction) {
  var new_car = car.clone(true);
  let new_car_boundingBox = new THREE.Box3();

  if (direction == "left") {
    new_car.rotation.set(0, Math.PI / 2, 0)
    new_car.position.x = car.position.x - 10
  } else if (direction == "right") {
    new_car.rotation.set(0, Math.PI / 2, 0)
    new_car.position.x = car.position.x + 10
  } else if (direction == "up") {
    new_car.rotation.set(0, 0, 0)
    new_car.position.z = car.position.z - 10
  } else if (direction == "down") {
    new_car.rotation.set(0, 0, 0)
    new_car.position.z = car.position.z + 10
  }
  
  new_car_boundingBox.setFromObject(new_car);

  for (var i = 0; i < wallBoundingBoxes.length; i++) {
    if (wallBoundingBoxes[i].intersectsBox(new_car_boundingBox)) {
      //walls[i].material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      return true
    }
  }

  return false
}

function getWallBoundingBoxes() {
  wallBoundingBoxes = []; // Clear existing bounding boxes
  for (var i = 0; i < walls.length; i++) {
    let bounding_box = new THREE.Box3();
    bounding_box.setFromObject(walls[i]);
    wallBoundingBoxes.push(bounding_box);
  }
}

function moveCar(direction) {

  // make sure that moving in this direction doesn't cause an intersection
  if (checkForIntersection(direction)) {
    return
  }

  // change the car position
  if (direction == "left") {
    car.rotation.set(0, Math.PI / 2, 0)
    car.position.x = car.position.x - 10
  } else if (direction == "right") {
    car.rotation.set(0, Math.PI / 2, 0)
    car.position.x = car.position.x + 10
  } else if (direction == "up") {
    car.rotation.set(0, 0, 0)
    car.position.z = car.position.z - 10
  } else if (direction == "down") {
    car.rotation.set(0, 0, 0)
    car.position.z = car.position.z + 10
  }
}
