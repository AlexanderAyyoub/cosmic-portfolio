"use client";
import * as THREE from 'three';
import { useEffect } from 'react';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { TTFLoader } from 'three/examples/jsm/Addons.js';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';

import Stats from 'three/examples/jsm/libs/stats.module';
import getStarfield from './getStarfield.js';

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
        
        // const light = new THREE.AmbientLight(0x404040);
        // light.castShadow = true;
        // light.intensity = 1;
        // scene.add(light);
        

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
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 5;


        //Adding camera controls 
        const controls = new PointerLockControls( camera, document.body);
        controls.pointerSpeed = 0.4;
     
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

        

        //POPULATING SCENE WITH PROJECT STARS 
        const allStarObjects = []

        if (stars && stars.length > 0) {
            stars.forEach(star => {
                const geometry = new THREE.SphereGeometry();
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(0xffffff),
                    emissive: new THREE.Color(0x0927e6),
                    emissiveIntensity: 4,
                });
                const starObject = new THREE.Mesh(geometry, material);
                
                starObject.position.set(star.xPosition, star.yPosition, star.zPosition);
                starObject.scale.set(star.size,star.size,star.size);
                scene.add(starObject);

                starObject.userData.starID = star.starID;
                starObject.userData.size = star.size;
                starObject.userData.xPosition = star.xPosition;
                starObject.userData.yPosition = star.yPosition;
                starObject.userData.zPosition = star.zPosition;
                starObject.userData.name = star.name;




                allStarObjects.push(starObject);
            })
        }

        //Setting up Raycasting 
        const pointer = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        const scaleSpeed = 0.3;

        const textMeshExisting = []

        const onMouseMove = (event) => {
           
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(allStarObjects);

            allStarObjects.forEach(star => {
                const originalSize = star.userData.size;
                star.scale.lerp(new THREE.Vector3(originalSize, originalSize, originalSize), scaleSpeed);
            });

            if (intersects.length === 0) {
                textMeshExisting.forEach(textMesh => scene.remove(textMesh));
                textMeshExisting.length = 0; 
                return;
            }

            if(intersects.length > 0){

                const intersectedStar = intersects[0].object;
                const starId = intersectedStar.userData.starID; 
                const starSize = intersectedStar.userData.size;
                intersectedStar.userData.targetSize = starSize + 1; 

                intersectedStar.scale.lerp(new THREE.Vector3(intersectedStar.userData.targetSize, intersectedStar.userData.targetSize, intersectedStar.userData.targetSize), scaleSpeed);
                
                //Adding Text Above Star on Select 
                const starPostitionX = intersectedStar.userData.xPosition;
                const starPostitionY = intersectedStar.userData.yPosition;
                const starPostitionZ = intersectedStar.userData.zPosition;
                const starName = intersectedStar.userData.name;
                
                const ttfLoader = new TTFLoader();
                const fontLoader = new FontLoader();
                ttfLoader.load('/fonts/Alsina.ttf', (json) => {
                    const authorFont = fontLoader.parse(json);
                    const textGeometry = new TextGeometry(starName, {
                        size: 3,
                        depth: 1,
                        font: authorFont
                    });
                    const textMaterial = new THREE.MeshPhysicalMaterial({
                        color: 0xffffff,
                        roughness: 0.70,
                        ior: 1.5,
                        thickness: 1.5,
                        transparent: true,
                        transmission: 0.95,
                        envMap:scene.background

                    });
                    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                    textMesh.position.set(starPostitionX+1, starPostitionY+1, starPostitionZ+1);
                    textMesh.lookAt(camera.position);
                    scene.add(textMesh);
                    textMeshExisting.push(textMesh)
                })
                
                console.log(`Intersected with star ID: ${starId}`);
                console.log("Star Positions:", { starPostitionX, starPostitionY, starPostitionZ });
                console.log ("Star Name",starName);
            }
            
          };

          window.addEventListener('mousemove', onMouseMove);

        //Making the stars twinkle 
        allStarObjects.forEach(star => {
            let increasing = Math.random() > 0.5; 
            let intensity = THREE.MathUtils.randFloat(3, 5); // Lower intensity range
        
            const twinkle = () => {
                if (!star.material) return; 
        
                if (increasing) {
                    intensity += 0.2; // Faster increase
                    if (intensity >= 5) increasing = false; // Lower max intensity
                } else {
                    intensity -= 0.2; // Faster decrease
                    if (intensity <= 3) increasing = true; // Lower min intensity
                }
        
                star.material.emissiveIntensity = intensity;
        
                setTimeout(twinkle, THREE.MathUtils.randInt(50, 150)); 
            };
        
            twinkle(); 
        });
        
        
        //Adding scene to renderPass 
        const renderPass = new RenderPass(scene,camera);
        const composer = new EffectComposer(renderer);
        composer.addPass(renderPass)

        //Adding Bloom to renderPass
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(windowW,windowH), 1.6,0.1,0.1
        );
        composer.addPass(bloomPass);

         bloomPass.strength = 1.5;
         bloomPass.resolution = true;


          function animate() {
            renderer.render(scene, camera);
            controls.update();
            stats.update();
            composer.render();
            renderer.setAnimationLoop(animate);
            
        }
        animate();
    })

    return (
        <div style={{ width: "100%", height: "100%" }}></div>
      );
};

export default HomeScene;

