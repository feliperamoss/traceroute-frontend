import * as THREE from 'three';
import './style.css';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls' ;
import gsap from "gsap";
import { Points } from 'three';
// import map from 'ear'

//Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

//Create Sphere
const texture = new THREE.TextureLoader().load( 'earth.jpg' );

const geometry = new THREE.SphereGeometry(1, 64, 64);
const material = new THREE.MeshStandardMaterial({
    // color: "#ffffff",
    roughness: 1,
    metalness: 0.2,
    map: texture
    // flatShading: true,
    // wireframe: true, 
});

const mesh = new THREE.Mesh(geometry, material);
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
const camera = new THREE.PerspectiveCamera(10, sizes.width/sizes.height, 1, 1000);
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
controls.enableZoom = true;
controls.autoRotate = false;
controls.autoRotateSpeed = 2;

//Add pin

function convertCoordtinates(coordinate){
    let phi = (90-coordinate.lat)*(Math.PI/180);
    let theta = (coordinate.lon+180)*(Math.PI/180);
    let x = -((1) * Math.sin(phi)*Math.cos(theta))
    let z = ((1) * Math.sin(phi)*Math.sin(theta))
    let y = ((1) * Math.cos(phi));

    return {x, y, z}
}

function createPin(coordinates) {
    for(let i of coordinates) {
        let meshPin = new THREE.Mesh(
            new THREE.SphereGeometry(0.02,20,20),
            new THREE.MeshBasicMaterial({color:0xff0000})
        )
        let pos = convertCoordtinates(i);

        meshPin.position.set(pos.x,pos.y,pos.z);
        scene.add(meshPin);
    }
}

const coordinates = [
    {lat: -22.970722, lon: -43.182365},
    {lat: 50.110924, lon: 8.682127},
]

createPin(coordinates);

function getCurve(pins) {
    let points = [];

    for(let pin of pins) {
        let pos = convertCoordtinates(pin);
        let vector = new THREE.Vector3(pos.x, pos.y, pos.z);
        console.log(vector)
        for(let i = 0; i <= 20; i++) {
            let p = new THREE.Vector3().lerp(vector, i/20);
            p.normalize();
            p.multiplyScalar(1 + 0.1*Math.sin(Math.PI*i/20));
            points.push(p);
        }
    }
    // console.log(points)

    let path = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(path, 20, 0.01, 8, false);
    const material = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

getCurve(coordinates);

// let meshPin = new THREE.Mesh(
//     new THREE.SphereGeometry(0.02,20,20),
//     new THREE.MeshBasicMaterial({color:0xff0000})
// )

// let lat = -22.970722;
// let lon = -43.182365;


// let phi = (90-lat)*(Math.PI/180);
// let theta = (lon+180)*(Math.PI/180);
// let x = -((1) * Math.sin(phi)*Math.cos(theta))
// let z = ((1) * Math.sin(phi)*Math.sin(theta))
// let y = ((1) * Math.cos(phi));

// meshPin.position.set(x,y,z);
// scene.add(meshPin);

// const createPointers = (size, position) => {
//     const geo = new THREE.SphereGeometry(size, 1, 1);
//     const mat = new THREE.MeshStandardMaterial({
//         color: "#34ebd8"
//     });
//     const mesh = new THREE.Mesh(geo, mat);
//     const obj = new THREE.Object3D();
//     obj.add(mesh);
    
//     scene.add(obj);
//     mesh.position.x = position;
//     return {mesh, obj}
// }

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
// let mouseDown = false;
// let rgb = [];

// window.addEventListener('mousedown', () => (mouseDown = true));
// window.addEventListener('mouseup', () => (mouseDown = false));

// window.addEventListener('mousemove', (e) => {
//     if(mouseDown) {
//         rgb = [
//             Math.round((e.pageX / sizes.width) * 255),
//             Math.round((e.pageY / sizes.height) * 255),
//             150
//         ]

//         //Animate
//         let newColor = new THREE.Color(`rgb(${rgb.join(",")})`);
//         gsap.to(mesh.material.color, {r: newColor.r, g: newColor.g, b: newColor.b})
//     }
// });