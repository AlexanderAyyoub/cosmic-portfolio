"use client";
import * as THREE from 'three';
import { useEffect } from 'react';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Stats from 'three/examples/jsm/libs/stats.module';
import getStarfield from './getStarfield.js';
import projectStars from './project-stars.jsx';

const HomeScene = ({stars}) => {
    useEffect(() =>{
        const windowW = window.innerWidth
        const windowH = window.innerHeight
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, windowW / windowH, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();


        renderer.setSize(windowW, windowH);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;

        //This puts it int HTML format 
        document.body.appendChild( renderer.domElement)
        camera.position.set(0, 0, 0);
        
        const light = new THREE.AmbientLight(0x404040);
        // light.castShadow = true;
        light.intensity = 10;
        scene.add(light);
        

        //FPS counter
        const stats = Stats()
        document.body.appendChild(stats.dom)

        //Adding stars 
        const starArray = getStarfield({numStars: 500});
        scene.add(starArray);

        //Trying hdri 
        const hdriLoader = new RGBELoader()
        hdriLoader.load('/textures/spaceHDRI.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
        });


        //Adding camera controls 
        const controls = new PointerLockControls( camera, document.body);
        controls.pointerSpeed = 0.5;
     
        document.addEventListener('mousedown', () => {
            controls.lock();
        });
          
          document.addEventListener('mouseup', () => {
            controls.unlock();
        });

          


        //Adding gltf File 
        // const loader = new GLTFLoader();
        // loader.load('/models/test.glb', (gltf) => {
        //     const mesh = gltf.scene;
        //     scene.add(mesh);
        //     mesh.position.set(1,0,-2);
            
        // });

        function animate() {
            renderer.render(scene, camera);
            controls.update();
            stats.update();

            
        }
        renderer.setAnimationLoop(animate);
        animate();

        

        //POPULATING SCENE WITH PROJECT STARS 
        if (stars && stars.length > 0) {
            stars.forEach(star => {
                const geometry = new THREE.SphereGeometry();
                // const material = new THREE.MeshBasicMaterial({ color: star.color }); Add color paramater at some point 
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0xFFFFFF),
                    emissive: new THREE.Color(0xFFFFFF),
                    emissiveIntensity: 0.8,
                });
                const starObject = new THREE.Mesh(geometry, material);
                
                starObject.position.set(star.xPosition, star.yPosition, star.zPosition);
                console.log(star.xPosition);
                scene.add(starObject);
            })
        }
    })

    return (
        <div style={{ width: "100%", height: "100%" }}></div>
      );
};

export default HomeScene;

