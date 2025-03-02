"use client";
import * as THREE from 'three';
import { useEffect } from 'react';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import getStarfield from './getStarfield.js';

const HomeScene = () => {
    useEffect(() =>{
        const windowW = window.innerWidth
        const windowH = window.innerHeight
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, windowW / windowH, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();


        renderer.setSize(windowW, windowH);
        //This puts it int HTML format 
        document.body.appendChild( renderer.domElement)

        camera.position.set(5, 0, 20);

        //Adding stars 
        const star = getStarfield({numStars: 500});
        scene.add(star);

        

        //Temparary cube 
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        scene.add( cube );

        //Adding camera controls 
        const controls = new PointerLockControls( camera, document.body);
        controls.pointerSpeed = 0.5;
     

        document.addEventListener('mousedown', () => {
            controls.lock();
        });
          
          document.addEventListener('mouseup', () => {
            controls.unlock();
        });

          


        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            controls.update();
            
        }
        renderer.setAnimationLoop(animate);

        animate();

    })
};

export default HomeScene;

