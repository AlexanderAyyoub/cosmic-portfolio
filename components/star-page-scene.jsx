"use client";
import { useEffect } from 'react';
import * as THREE from 'three';


import Stats from 'three/examples/jsm/libs/stats.module';
import getStarfield from './getStarfield.js';



const StarPageScene = ({star}) => {
    useEffect(() => {

        // Setting up scene 
        const windowW = window.innerWidth
        const windowH = window.innerHeight
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, windowW / windowH, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        const textureLoader = new THREE.TextureLoader();

        renderer.setSize(windowW, windowH);

        document.body.appendChild( renderer.domElement);
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';

        camera.position.set(0, 0, 0);

        const light = new THREE.AmbientLight(0xffffff,1);
        scene.add(light);

        //Adding stars 
        const starArray = getStarfield({numStars: 500});
        scene.add(starArray);

        //FPS Counter 
        const stats = Stats()
        document.body.appendChild(stats.dom)

        //Mousemovent camera rotation 
        let mouseX = 0, mouseY = 0;
        const sensitivity = 0.008;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1; // Normalize [-1, 1]
            mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        });
          

        function animate() {
            renderer.render(scene, camera);
            renderer.setAnimationLoop(animate);
            stats.update();

            // Calculate target rotation based on mouse position
            const targetX = mouseX * sensitivity;
            const targetY = mouseY * sensitivity;

            // Rotate the camera around the object slightly
            camera.position.x = Math.sin(targetX) * 5; // 5 = distance from object
            camera.position.z = Math.cos(targetX) * 5;
            camera.position.y = targetY * 2; // Adjust vertical rotation

            camera.lookAt(new THREE.Vector3(0, 0, 0)); // Keep looking at center

            
        }
        animate()
    })
    return (
        <div style={{ width: "100%", height: "100%" }}></div>
      );
};

export default StarPageScene;