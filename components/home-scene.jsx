"use client";
import * as THREE from 'three';
import { useEffect } from 'react';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { TTFLoader } from 'three/examples/jsm/Addons.js';
import { FontLoader } from 'three/examples/jsm/Addons.js';
import { TextGeometry } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import { EXRLoader } from 'three/examples/jsm/Addons.js';
import { useRouter } from 'next/navigation';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { Text } from 'troika-three-text'; 
import { EffectComposer, EffectPass, RenderPass, ShockWaveEffect, BloomEffect } from 'postprocessing';

import Stats from 'three/examples/jsm/libs/stats.module';
import getStarfield from './getStarfield.js';


const HomeScene = ({stars}) => {
    const router = useRouter();

    useEffect(() => {

        //Loading Manger
        const loadingManager = new THREE.LoadingManager();

        loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const percent = Math.round((itemsLoaded / itemsTotal) * 100);
            const bar = document.getElementById('global-progress-bar');
            const label = document.getElementById('global-progress-label');
            if (bar) bar.value = percent;
            if (label) label.textContent = `${percent}%`;
        };

        loadingManager.onLoad = () => {
            const loader = document.getElementById('global-loader');
            if (loader) {
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
                setTimeout(() => {
                loader.style.visibility = 'hidden';
                }, 800); 
            }
        };

        const windowW = window.innerWidth
        const windowH = window.innerHeight
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, windowW / windowH, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        const textureLoader = new THREE.TextureLoader(loadingManager);

        renderer.setSize(windowW, windowH);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        //This puts it int HTML format 
        document.body.appendChild(renderer.domElement)

        //Makes sure theres no scroll bars and fully fits screen(using css canvas) 
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        camera.position.set(0, 0, 0);

        
        //Light
        const light = new THREE.DirectionalLight(0x404040,5);
        light.castShadow = true;
        light.position.set(-3,3,-10);
        scene.add(light);

        const alight = new THREE.PointLight(0x404040,100000);
        alight.position.set(-30, 30, -210);
        scene.add(alight);

        const lightHelper = new THREE.PointLightHelper(alight);
        scene.add(lightHelper)
        const dlightHelper = new THREE.DirectionalLightHelper(light);
        scene.add(dlightHelper)


        //Fixing the line issue
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;

        //FPS counter
        const stats = Stats()
        // document.body.appendChild(stats.dom)

        //Adding stars 
        const starArray = getStarfield({numStars: 500});
        scene.add(starArray);

        //Adding camera controls 
        const controls = new PointerLockControls(camera, document.body);
        controls.pointerSpeed = 0.4;
     
        document.addEventListener('mousedown', () => {
            controls.lock();
        });
          
        document.addEventListener('mouseup', () => {
            controls.unlock();
        });

        // Trying hdri 
        const hdriLoader = new RGBELoader(loadingManager)
        hdriLoader.load('/textures/homeScene.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.background = texture;
        scene.environment = texture;
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 2;

        //Adding gltf File 
        const loader = new GLTFLoader(loadingManager);
        const dracoLoader = new DRACOLoader(loadingManager);
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        loader.setDRACOLoader(dracoLoader);

        loader.load('/models/grassPlatform.glb', (gltf) => {
            const mesh = gltf.scene;
            scene.add(mesh);
            mesh.position.copy(camera.position);
            mesh.position.y += -1.4;
            mesh.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;   
                    node.receiveShadow = true; 
                }
            });
        });

        //Adding moon 
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        loader.setDRACOLoader(dracoLoader);
        
        loader.load('/models/Moon.glb', (gltf) => {
            const saternMesh = gltf.scene;
            saternMesh.position.set(-50, 70, -220);
            saternMesh.scale.set(10, 10, 10); 
            scene.add(saternMesh);
        });

        //Funciton that lightent Hex color (for the stars and text)
        function lightenHexColor(hex, percent) {
            const color = new THREE.Color(hex);
            const r = color.r + (1 - color.r) * percent;
            const g = color.g + (1 - color.g) * percent;
            const b = color.b + (1 - color.b) * percent;
            return new THREE.Color(r, g, b);
        }
        

        //POPULATING SCENE WITH PROJECT STARS 
        const allStarObjects = [];
        const textMeshes = new Map(); // Map to store text meshes by star ID

        if (stars && stars.length > 0) {
            stars.forEach(star => {

                const geometry = new THREE.SphereGeometry();
                const lightenedColor = lightenHexColor(star.color2, 0.6);
                
                const material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(star.color2),
                    emissive: lightenedColor,
                    emissiveIntensity: 4,
                });
                
                const starObject = new THREE.Mesh(geometry, material);
                
                starObject.position.set(star.xPosition, star.yPosition, star.zPosition);
                starObject.scale.set(star.size, star.size, star.size);
                scene.add(starObject);

                starObject.userData.starID = star.starID;
                starObject.userData.size = star.size;
                starObject.userData.xPosition = star.xPosition;
                starObject.userData.yPosition = star.yPosition;
                starObject.userData.zPosition = star.zPosition;
                starObject.userData.name = star.name;

                allStarObjects.push(starObject);

                // Add lens flare 
                const starLight = new THREE.PointLight(0xffffff, 1);
                starLight.position.set(star.xPosition, star.yPosition, star.zPosition);

                const textureFlares = Array.from({ length: 10 }, (_, i) => 
                    textureLoader.load(`/textures/lens-flare/${i + 1}.png`)
                );

                const randomTexture = textureFlares[Math.floor(Math.random() * textureFlares.length)];
                const randomScale = 1 + Math.random() * .2; 

                const lensFlare = new Lensflare();
                const lensElement = new LensflareElement(randomTexture, star.size * 125 * randomScale, 0, starLight.color);
                lensElement.size *= Math.random() > 1 ? 1 : -1; 
                lensFlare.addElement(lensElement);

                scene.add(starLight);
                starLight.add(lensFlare);
                
                // Create always-visible text 
                const textLighterColor = lightenHexColor(star.color1,.4)
                const textMesh = new Text();
                textMesh.material = new THREE.MeshStandardMaterial({
                    color: textLighterColor,  
                    roughness: 0.5,   
                    emissive: new THREE.Color(textLighterColor),  
                    emissiveIntensity: 1, 
                    transparent: true,  
                    depthWrite: false,  
                });
                textMesh.text = star.name; 
                textMesh.font = '/fonts/AlbertusMTStd.otf'; 
                textMesh.fontSize = 3; 
                textMesh.position.set(star.xPosition + 3, star.yPosition + 5, star.zPosition + 3);
                textMesh.material.opacity = 0.1; 
                textMesh.userData.isHovered = false;
                textMesh.userData.starID = star.starID;
                textMesh.userData.defaultOpacity = 0.1;
                textMesh.userData.hoveredOpacity = 1.0;
                textMeshes.set(star.starID, textMesh);
                scene.add(textMesh);    
            });
        }

        //Setting up Raycasting 
        const pointer = new THREE.Vector2();
        const raycaster = new THREE.Raycaster();
        const scaleSpeed = 0.3;
        const fadeSpeedOpacity = 0.06;

        const onMouseMove = (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(allStarObjects);
        
            // Reset all stars to their original size
            allStarObjects.forEach(star => {
                const originalSize = star.userData.size;
                star.scale.lerp(new THREE.Vector3(originalSize, originalSize, originalSize), scaleSpeed);
                
                // Reset text opacity to default if not hovered
                const textMesh = textMeshes.get(star.userData.starID);
                if (textMesh) {
                    textMesh.userData.isHovered = false;
                }
            });
        
            // If hovering over a star, increase its size and text opacity
            if (intersects.length > 0) {
                const intersectedStar = intersects[0].object;
                const starId = intersectedStar.userData.starID;
                const starSize = intersectedStar.userData.size;
                intersectedStar.userData.targetSize = starSize + 1;
                
                intersectedStar.scale.lerp(
                    new THREE.Vector3(
                        intersectedStar.userData.targetSize, 
                        intersectedStar.userData.targetSize, 
                        intersectedStar.userData.targetSize
                    ), 
                    scaleSpeed
                );
                
                // Set hovered state for text
                const textMesh = textMeshes.get(starId);
                if (textMesh) {
                    textMesh.userData.isHovered = true;
                }
                
                controls.unlock();
            }
        };

        window.addEventListener('mousemove', onMouseMove);

        //onMouseClick event 
        const onMouseClick = (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(allStarObjects);
            

            if (intersects.length > 0) {
                //Setting possition then activating shock wave
                shockWaveEffect.position.copy(intersects[0].point); 
                shockWaveEffect.explode();

                const { starID } = intersects[0].object.userData;
            if (starID) {
                router.push(`/starPage/${starID}`);
                window.location.href = `/starPage/${starID}`;
                }
            }
        };

        window.addEventListener("click", onMouseClick);

        //Making the stars twinkle 
        allStarObjects.forEach(star => {
            let increasing = Math.random() > 0.5; 
            let intensity = THREE.MathUtils.randFloat(2, 7); // Lower intensity range
        
            const twinkle = () => {
                if (!star.material) return; 
        
                if (increasing) {
                    intensity += 0.2; // Faster increase
                    if (intensity >= 7) increasing = false; // Lower max intensity
                } else {
                    intensity -= 0.2; // Faster decrease
                    if (intensity <= 2) increasing = true; // Lower min intensity
                }
        
                star.material.emissiveIntensity = intensity;
        
                setTimeout(twinkle, THREE.MathUtils.randInt(50, 150)); 
            };
        
            twinkle(); 
        });
        
        //Adding scene to renderPass 
        const composer = new EffectComposer(renderer, {frameBufferType: THREE.HalfFloatType});
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        //Addign shock wave 
        const shockWaveEffect = new ShockWaveEffect(camera, new THREE.Vector3(1, 1, 1),{
                speed: 12,
                maxRadius: 100,
                extend: 30,
                waveSize: 50,
                amplitude: 1
            });

        //Adding Bloom 
        const bloomEffect = new BloomEffect({
        intensity: .5,
        luminanceThreshold: 1,
        
        });

        //effect pass 
        const bloomPass = new EffectPass(camera, bloomEffect, shockWaveEffect);
        bloomPass.renderToScreen = true;
        composer.addPass(bloomPass);

        //Constaliation titles 
        const codingMesh = new Text();
        codingMesh.material = new THREE.MeshStandardMaterial({
            color: "#FFFFFF",  
            roughness: 0.5,   
            emissive: new THREE.Color("#FFFFFF"),  
            emissiveIntensity: 1, 
            depthWrite: false,  
        });
        codingMesh.text = "Coding Projects"; 
        codingMesh.font = '/fonts/AlbertusMTStd.otf'; 
        codingMesh.fontSize = 5; 
        codingMesh.position.set(30,30,-40)
        codingMesh.rotation.set(9.7, 10.5, 9.7);
        scene.add(codingMesh)
        


        function animate() {
            renderer.render(scene, camera);
            controls.update();
            stats.update();
            composer.render();
            
            // codingMesh.quaternion.copy(camera.quaternion);



            // Update text meshes every frame to make them face camera and adjust opacity
            textMeshes.forEach((textMesh) => {
                // Make text always face camera
                textMesh.lookAt(camera.position);
                
                // Smooth transition between opacity states
                const targetOpacity = textMesh.userData.isHovered 
                    ? textMesh.userData.hoveredOpacity 
                    : textMesh.userData.defaultOpacity;
                    
                if (textMesh.material) {
                    textMesh.material.opacity += (targetOpacity - textMesh.material.opacity) * fadeSpeedOpacity;
                }
            });
            
            renderer.setAnimationLoop(animate);
        }
        
        animate();
        
        // Clean up event listeners when component unmounts
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onMouseClick);
            renderer.dispose();
        };
    }, [router, stars]);

    return (
        <>
            <div
                id="global-loader"
                style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                pointerEvents: 'auto',
                transition: 'opacity 0.8s ease-in-out',
                }}
            >
                <video
                autoPlay
                muted
                loop
                playsInline
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                }}
                >
                <source src="/videos/loading-bg.mp4" type="video/mp4" />
                Your browser does not support this file format
                </video>
                <div
                style={{
                    fontFamily: 'AlbertusMTStd, sans-serif',
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    padding: '1rem',
                }}
                >
                <style jsx global>{`
                    @font-face {
                    font-family: 'AlbertusMTStd';
                    src: url('/fonts/AlbertusMTStd.otf') format('opentype');
                    font-display: swap;
                    }
                `}</style>

                <h1 className="text-2xl mb-4 tracking-wide">Loading the Cosmos</h1>
                <div className="w-1/2 max-w-md">
                <progress
                    id="global-progress-bar"
                    value="0"
                    max="100"
                    className="w-full h-3 appearance-none overflow-hidden rounded bg-white/10 [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-white [&::-moz-progress-bar]:bg-white"
                />
                </div>
                <p id="global-progress-label" className="mt-4 text-sm text-gray-300">
                    0%
                </p>
                </div>
            </div>

            <div style={{ width: '100%', height: '100%' }} />
            </>

    ); 
     

     
};

export default HomeScene;