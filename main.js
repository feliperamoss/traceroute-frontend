import * as THREE from 'three';
import './style.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from "gsap";
import { Points } from 'three';
import { get } from 'svelte/store';
import {reference} from "three/nodes";

//Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('black');

const textureFileName = "8k_earth.jpeg";

//Create Sphere
const texture = new THREE.TextureLoader().load(textureFileName);

const geometry = new THREE.SphereGeometry(1, 64, 64);
const material = new THREE.MeshStandardMaterial({
    map: texture
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
const camera = new THREE.PerspectiveCamera(10, sizes.width / sizes.height, 1, 1000);
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
controls.autoRotate = true;
controls.autoRotateSpeed = 0.2;

//Add Stars

function addStar() {
    const geometry = new THREE.SphereGeometry(0.01, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: 0xffffff})
    const star = new THREE.Mesh(geometry, material);
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

    star.position.set(x, y, z);
    scene.add(star)
}

Array(20000).fill().forEach(addStar);

//Add pin
function convertCoordinates(coordinate) {
    let phi = (90 - coordinate.lat) * (Math.PI / 180);
    let theta = (coordinate.lon + 180) * (Math.PI / 180);
    let x = -((1) * Math.sin(phi) * Math.cos(theta))
    let z = ((1) * Math.sin(phi) * Math.sin(theta))
    let y = ((1) * Math.cos(phi));

    return { x, y, z }
}

let points = [];

function createPin(coordinates) {
    let meshPin;
    mesh.name = "pin";

    for (let i of coordinates) {
        // console.log(i)
        meshPin = new THREE.Mesh(
            new THREE.SphereGeometry(0.01, 20, 20),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        )
        let pos = convertCoordinates(i);

        meshPin.position.set(pos.x, pos.y, pos.z);
        scene.add(meshPin);
        points.push(meshPin);
    }
}

let lines = [];
function getCurve(p1, p2) {
    let points = [];
    let pos = convertCoordinates(p1);
    let pos2 = convertCoordinates(p2);
    let vector = new THREE.Vector3(pos.x, pos.y, pos.z);
    let vector2 = new THREE.Vector3(pos2.x, pos2.y, pos2.z);

    for (let i = 0; i <= 20; i++) {
        let p = new THREE.Vector3().lerpVectors(vector, vector2, i / 20);
        p.normalize();
        // p.name = 'line';
        p.multiplyScalar(1 + 0.025 * Math.sin(Math.PI * i / 20));
        points.push(p);
    }

    let path = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(path, 20, 0.002, 8, false);
    const material = new THREE.MeshBasicMaterial({
        color: 0x8ffcff,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'line'
    lines.push(mesh)
    scene.add(mesh);
}

const connectIps = (coordinates) => {
     coordinates.forEach((e,i,src)=> {
        if(src.length !== i + 1) {
            console.log(e)
            getCurve(e, src[i+1])
        }
    })
}

const btn = document.querySelector('.btnSearch');

btn.addEventListener('click', (e) => {
    // window.location.reload();
    refresh()
})

function refresh(){
    console.log('reload function')

    points.forEach((e,i,src)=> {
            console.log(e)
            scene.remove(e);
    })

    lines.forEach((e) => {
        scene.remove(e)
    })
}

const getCoordinates = async () => {
    const input = document.querySelector('#domain')
    const form = document.querySelector('form')

    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        btn.style.display = 'block'
        const url = 'http://localhost:3000/traceroute?domain=' + input.value; //A local page

        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
        //     if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
        //         console.log("from main js"+xmlHttp.responseText);
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200){
                let json = JSON.parse(xmlHttp.responseText);

                const locations = json.filter((e)=>{
                    if(e !== null) {
                        return [{'lat': e.lat, 'lon': e.lon}]
                    }
                })

                createPin(locations)
                connectIps(locations)

                controls.autoRotate = false;
            }
        }
        xmlHttp.open("GET", url, true); // true for asynchronous
        xmlHttp.send(null);
        controls.autoRotate = true;
    });
}

getCoordinates()

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
const tl = gsap.timeline({ defaults: { duration: 1 } });
tl.fromTo(mesh.scale, { z: 0, x: 0, y: 0 }, { z: 1, x: 1, y: 1 });
tl.fromTo("nav", { y: "-100%" }, { y: "0%" })
tl.fromTo(".title", { opacity: 0 }, { opacity: 1 })

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