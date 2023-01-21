import * as THREE from 'three';
import './style.css';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls' ;
import gsap from "gsap";

//Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

//Create Sphere
const geometry = new THREE.SphereGeometry(3, 64, 64);
const material = new THREE.MeshStandardMaterial({
    color: "#fff",
    roughness: 1,
    metalness: 0.2,
    // flatShading: true,
    // wireframe: true, 
});

const mesh = new THREE.Mesh(geometry, material);
// scene.background = CubeTexture
scene.add(mesh);

//Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//Light
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 50, -50);
// light.decay=1.6;
// light.intensity = 1.25;
scene.add(light);

//Camera
const camera = new THREE.PerspectiveCamera(40, sizes.width/sizes.height, 1, 1000);
camera.position.z = 20;
scene.add(camera);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

//Renderer
const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);
renderer.render(scene, camera);

// tone mapping
renderer.toneMapping = THREE.NoToneMapping;

renderer.outputEncoding = THREE.sRGBEncoding;

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false; //disable drag object
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 5;

const createPointers = (size, position) => {
    const geo = new THREE.SphereGeometry(size, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
        color: "#34ebd8"
    });
    const mesh = new THREE.Mesh(geo, mat);
    const obj = new THREE.Object3D();
    obj.add(mesh);
    
    scene.add(obj);
    mesh.position.x = position;
    return {mesh, obj}
}

THREE.GeometryUtils.merge
// const singleGeometry = new THREE.Geometry();
// mesh.updateMatrix();
// singleGeometry.merge(mesh.geometry, mesh.matrix);
// createPointers.updateMatrix();
// singleGeometry.merge(createPointers.geometry, createPointers.matrix);
// var light1 = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
//     light1.position.set(0.75, 1, 0.25);
//     scene.add(light);

// const singleGeometryMaterial = new THREE.MeshPhongMaterial({color: 0xFF0000});
// const singleGeometryMesh = new THREE.Mesh(singleGeometry, singleGeometryMaterial);
// scene.add(singleGeometryMesh);

//Resize
window.addEventListener('resize', () => {
    //Update Sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //Update Camera
    camera.updateProjectionMatrix();
    camera.aspect = sizes.width / sizes.height;
    renderer.setSize(sizes.width, sizes.height);
})

const loop = () => {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(loop);
}

loop();

//Timeline magic
const tl = gsap.timeline({defaults: {duration: 1}});
tl.fromTo(mesh.scale, {z: 0, x: 0, y: 0}, {z: 1, x: 1, y: 1});
tl.fromTo("nav", {y: "-100%"}, {y: "0%"})
tl.fromTo(".title", {opacity: 0}, {opacity: 1})

//Mouse Animation Color
let mouseDown = false;
let rgb = [];

window.addEventListener('mousedown', () => (mouseDown = true));
window.addEventListener('mouseup', () => (mouseDown = false));

window.addEventListener('mousemove', (e) => {
    if(mouseDown) {
        rgb = [
            Math.round((e.pageX / sizes.width) * 255),
            Math.round((e.pageY / sizes.height) * 255),
            150
        ]

        //Animate
        let newColor = new THREE.Color(`rgb(${rgb.join(",")})`);
        gsap.to(mesh.material.color, {r: newColor.r, g: newColor.g, b: newColor.b})
    }
});