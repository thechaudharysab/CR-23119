import * as THREE from "three";

let scene, camera, renderer, earthSphere;
let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let locationObjects = [];

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load(
    "2k_earth_daymap.jpg",
    function (texture) {
      //   texture.offset.set(-0.01, 0);
      texture.wrapS = THREE.RepeatWrapping;
    }
  );

  //   earthTexture.offset.x = 0;
  //   earthTexture.offset.y = 0.18;

  const earthGeometry = new THREE.SphereGeometry(5, 32, 32);
  const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
  earthSphere = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earthSphere);

  //   earthSphere.rotation.y += 4.4;
  //   earthSphere.rotation.x += 0.5;

  camera.position.z = 12;

  document.addEventListener("mousedown", (event) => {
    isMouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  });
  document.addEventListener("mouseup", () => {
    isMouseDown = false;
  });
  document.addEventListener("mousemove", (event) => {
    if (isMouseDown) {
      const deltaX = event.clientX - lastMouseX;
      const deltaY = event.clientY - lastMouseY;
      earthSphere.rotation.y += deltaX * 0.01;
      earthSphere.rotation.x += deltaY * 0.01;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }
  });

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  earthSphere.rotation.y += 0.001;
  renderer.render(scene, camera);
}

init();
initMarkers();

document.addEventListener("mousemove", onMouseMove, false);
document.addEventListener("mouseout", onMouseOut, false);
// document.addEventListener("click", onSphereClick, false);

function onMouseMove(event) {
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects(locationObjects);

  if (intersects.length > 0) {
    const name = intersects[0].object.name;
    const tooltipId = "tooltip-" + name.toLowerCase().replace(/\s/g, "");
    const tooltip = document.getElementById(tooltipId);

    // Position the tooltip (adjust as needed):
    tooltip.style.left = event.clientX + "px";
    tooltip.style.top = event.clientY + "px";

    tooltip.style.display = "block";
  } else {
    // Hide all tooltips if no intersection
    const tooltips = document.querySelectorAll(".tooltip");
    tooltips.forEach((tooltip) => (tooltip.style.display = "none"));
  }
}

function onMouseOut() {
  // Hide all tooltips when mouse leaves the scene
  const tooltips = document.querySelectorAll(".tooltip");
  tooltips.forEach((tooltip) => (tooltip.style.display = "none"));
}

function initMarkers() {
  const locations = [
    {
      x: 3.0920418837425374,
      y: 3.902617410202719,
      z: -0.2972209100530854,
      name: "Netherlands",
    },
    {
      x: 3.1570156052503844,
      y: 3.9516155540454476,
      z: -0.23979039537555705,
      name: "Belgium",
    },
    {
      x: 3.1752644073644634,
      y: 3.8891364729300144,
      z: -0.6055983601924425,
      name: "Germany",
    },
    {
      x: 3.2277913289036015,
      y: 3.715985855756652,
      z: -0.7977213025405394,
      name: "Austria",
    },
    {
      x: 1.9985182281231437,
      y: 4.528733522711878,
      z: -0.6287313233429016,
      name: "Sweden",
    },
    {
      x: 2.0568783007775697,
      y: 4.434540412457778,
      z: -1.0164788363761375,
      name: "Finland",
    },
    {
      x: 2.3803672175093613,
      y: 4.375234030233985,
      z: -0.34483585343103845,
      name: "Norway",
    },
    {
      x: 2.724600211016447,
      y: 4.162567451771226,
      z: -0.4522541928030891,
      name: "Denmark",
    },
    {
      x: 2.917303523970227,
      y: 4.046798144477285,
      z: 0.09754104706891217,
      name: "UK",
    },
  ];

  locations.forEach((location) => {
    const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    const localPoint = earthSphere.worldToLocal(
      new THREE.Vector3(location.x, location.y, location.z).clone()
    );
    marker.position.set(localPoint.x, localPoint.y, localPoint.z);
    marker.name = location.name;
    earthSphere.add(marker);

    // Create tooltip element
    var tooltip = document.createElement("div");
    tooltip.id = "tooltip-" + location.name.toLowerCase().replace(/\s/g, "");
    tooltip.className = "tooltip";
    tooltip.innerText = location.name;
    document.body.appendChild(tooltip);

    // Store the tooltip reference in the marker for easy access
    marker.userData.tooltip = tooltip;
    locationObjects.push(marker); // Add the marker to the locationObjects array
  });
}

// Debug / Dev code below. I used onSphereClick to find the coordinates of each county on the map.

// function onSphereClick(event) {
//   event.preventDefault();

//   mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
//   mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

//   raycaster.setFromCamera(mouse, camera);
//   let intersects = raycaster.intersectObject(earthSphere);

//   if (intersects.length > 0) {
//     const globalPoint = intersects[0].point;

//     // Convert the global coordinates to local coordinates relative to the earthSphere
//     const localPoint = earthSphere.worldToLocal(globalPoint.clone());

//     // Create the marker and position it at the localPoint
//     const markerGeometry = new THREE.SphereGeometry(0.1, 32, 32);
//     const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//     const marker = new THREE.Mesh(markerGeometry, markerMaterial);
//     console.log(localPoint);
//     marker.position.set(localPoint.x, localPoint.y, localPoint.z);

//     // Add the marker as a child of the earthSphere
//     earthSphere.add(marker);
//   }
// }

// function latLongToVector3(lat, lon, radius) {
//   var phi = (lat * Math.PI) / 180;
//   var theta = ((lon - 180) * Math.PI) / 180;

//   var x = -(radius * Math.sin(phi) * Math.cos(theta));
//   var y = radius * Math.cos(phi);
//   var z = radius * Math.sin(phi) * Math.sin(theta);

//   return new THREE.Vector3(x, y, z);
// }

// function addLocation(lat, lon, name) {
//   const geometry = new THREE.SphereGeometry(0.1, 32, 32);
//   const material = new THREE.MeshBasicMaterial({ color: 0xffff });
//   const sphere = new THREE.Mesh(geometry, material);

//   const position = latLongToVector3(lat, lon, 5);
//   sphere.position.set(position.x, position.y, position.z);
//   earthSphere.add(sphere);
//   sphere.name = name;
//   locationObjects.push(sphere);
//   var tooltip = document.createElement("div");
//   tooltip.id = "tooltip-" + name.toLowerCase().replace(/\s/g, "");
//   tooltip.className = "tooltip";
//   tooltip.innerText = name;
//   document.body.appendChild(tooltip);
// }

// addLocation(12.2472, 89.253, "Netherlands");
// addLocation(50.8503, 4.3517, "Belgium");
// addLocation(52.52, 13.405, "Germany");
// addLocation(48.2082, 16.3738, "Austria");
// addLocation(59.3293, 18.0686, "Sweden");
// addLocation(60.1699, 24.9384, "Finland");
// addLocation(59.9139, 10.7522, "Norway");
// addLocation(55.6761, 12.5683, "Denmark");
// addLocation(51.5074, -0.1278, "UK");
