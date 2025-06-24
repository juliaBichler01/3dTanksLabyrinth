import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Expose THREE globally for AR.js
window.THREE = THREE;

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

async function init() {
  await loadScript("/libs/ar-threex.min.js");

  // Now THREEx is available on window.THREEx
  const THREEx = window.THREEx;

  THREEx.ArToolkitContext.baseURL = "../";

  //////////////////////////////////////////////////////////////////////////////////
  //		Init
  //////////////////////////////////////////////////////////////////////////////////

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    precision: "mediump",
    premultipliedAlpha: true,
    stencil: true,
    depth: true,
    logarithmicDepthBuffer: true,
  });

  const clock = new THREE.Clock();

  const mixers = [];

  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  document.body.appendChild(renderer.domElement);

  // init scene and camera
  var scene = new THREE.Scene();

  //////////////////////////////////////////////////////////////////////////////////
  //		Initialize a basic camera
  //////////////////////////////////////////////////////////////////////////////////

  // Create a camera
  let fov = (0.8 * 180) / Math.PI;
  let ratio = 640 / 480;
  const camera = new THREE.PerspectiveCamera(fov, ratio);
  scene.add(camera);

  const light = new THREE.AmbientLight(0xffffff);
  scene.add(light);

  let directionalLight = new THREE.DirectionalLight("#fff", 0.4);
  directionalLight.position.set(0.5, 0, 0.866);
  scene.add(directionalLight);

  ////////////////////////////////////////////////////////////////////////////////
  //          handle arToolkitSource
  ////////////////////////////////////////////////////////////////////////////////

  const arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",
    sourceWidth: 480,
    sourceHeight: 640,
  });

  arToolkitSource.init(function onReady() {
    // use a resize to fullscreen mobile devices
    setTimeout(function () {
      onResize();
    }, 1000);
  });

  // handle resize
  window.addEventListener("resize", function () {
    onResize();
  });

  // listener for end loading of NFT marker
  window.addEventListener("arjs-nft-loaded", function (ev) {
    console.log(ev);
  });

  function onResize() {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null) {
      arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  //          initialize arToolkitContext
  ////////////////////////////////////////////////////////////////////////////////

  // create atToolkitContext
  const arToolkitContext = new THREEx.ArToolkitContext(
    {
      detectionMode: "mono",
      canvasWidth: 480,
      canvasHeight: 640,
    },
    {
      sourceWidth: 480,
      sourceHeight: 640,
    }
  );

  // initialize it
  arToolkitContext.init(function onCompleted() {
    // copy projection matrix to camera
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  ////////////////////////////////////////////////////////////////////////////////
  //          Create a ArMarkerControls
  ////////////////////////////////////////////////////////////////////////////////

  // init controls for camera
  const markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type: "nft",
    descriptorsUrl: "data/dataNFT/pinball",
    changeMatrixMode: "cameraTransformMatrix",
  });

  scene.visible = false;

  const root = new THREE.Object3D();
  scene.add(root);

  //////////////////////////////////////////////////////////////////////////////////
  //		add an object in the scene
  //////////////////////////////////////////////////////////////////////////////////

  const threeGLTFLoader = new GLTFLoader();
  let model;

  threeGLTFLoader.load("./resources/Flamingo.glb", function (gltf) {
    model = gltf.scene.children[0];
    //model.name = 'Flamingo';
    //const clips = gltf.animations;

    const animation = gltf.animations[0];

    const mixer = new THREE.AnimationMixer(model);
    mixers.push(mixer);

    const action = mixer.clipAction(animation);
    action.play();

    root.add(model);
    root.matrixAutoUpdate = false;
    model.position.z = -100;

    window.addEventListener("arjs-nft-init-data", function (nft) {
      const msg = nft.detail;
      model.position.y = ((msg.height / msg.dpi) * 2.54 * 10) / 2.0; //y axis?
      model.position.x = ((msg.width / msg.dpi) * 2.54 * 10) / 2.0; //x axis?
    });

    //////////////////////////////////////////////////////////////////////////////////
    //		render the whole thing on the page
    //////////////////////////////////////////////////////////////////////////////////

    var animate = function () {
      requestAnimationFrame(animate);

      if (mixers.length > 0) {
        for (let i = 0; i < mixers.length; i++) {
          mixers[i].update(clock.getDelta());
        }
      }

      if (!arToolkitSource.ready) {
        return;
      }

      arToolkitContext.update(arToolkitSource.domElement);

      // update scene.visible if the marker is seen
      scene.visible = camera.visible;

      renderer.render(scene, camera);
    };

    requestAnimationFrame(animate);
  });
}

init().catch(console.error);
