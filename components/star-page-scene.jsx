"use client";
import { useEffect } from 'react';
import { EXRLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';


import Stats from 'three/examples/jsm/libs/stats.module';
import getStarfield from './getStarfield.js';
import { Text } from 'troika-three-text'; 
import { geometry } from 'drizzle-orm/pg-core';
import { transmission } from 'three/tsl';



const StarPageScene = ({star}) => {
    const router = useRouter();
    
    useEffect(() => {

        // Setting up scene 
        const windowW = window.innerWidth
        const windowH = window.innerHeight
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, windowW / windowH, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        const textureLoader = new THREE.TextureLoader();

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.setSize(windowW, windowH);

        document.body.appendChild( renderer.domElement);
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';

        camera.position.set(0, 0, 0);


        //Text holder object 
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        loader.setDRACOLoader(dracoLoader);

        //Body bottom 
        loader.load('/models/textHolderB.glb', (gltf) => {
            const geometry = gltf.scene.children[0].geometry;
            const material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xFFFFFF), //Change for custom color 
                transmission: 1,
                ior: 1.3,
                transmission: true,
                roughness: .8, 

            });
            const holderObject = new THREE.Mesh(geometry, material)
            holderObject.rotation.set(-Math.PI / 1.9, -Math.PI / 1, -Math.PI / 1.02); 
            holderObject.scale.set(1.8,1,1.8)
            holderObject.position.set(.5,-.2,1.2)

            scene.add(holderObject);
        });
        
        //Title top 
        loader.load('/models/textHolderB.glb', (gltf) => {
            const geometry = gltf.scene.children[0].geometry;
            const material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0xFFFFFF), //Change for custom color 
                transmission: 1,
                ior: 1.3,
                transmission: true,
                roughness: .8, 

            });
            const holderObject = new THREE.Mesh(geometry, material)
            holderObject.rotation.set(-Math.PI / 1.9, -Math.PI / 1, -Math.PI / 1.02); 
            holderObject.scale.set(1.73,.6,.2)
            holderObject.position.set(.48,1.8,1.2)
    

            scene.add(holderObject);
        });
        
        //Adding project name to top (Remember to add an outline if not visable with specific color pallets)
        const projectName = new Text();
        projectName.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,  
            roughness: 0.5,   
            emissive: new THREE.Color(0xFFFFFF),  //Change for custom color 
            emissiveIntensity: 1, 
        });
        projectName.text = star.name;
        projectName.font = '/fonts/Alsina.ttf';
        projectName.fontSize = .3;
        projectName.anchorX = 1;
        projectName.anchorY = -1.85;
        projectName.position.set(0,0,1.6)
        projectName.rotation.set(Math.PI / 1.02, -Math.PI / 1.02, -Math.PI / 1)

        scene.add(projectName);

        //Adding text description 
        const projectDescription = new Text();
        projectDescription.material = new THREE.MeshStandardMaterial({
            color: 0xffffff,  
            roughness: 0.5,   
            emissive: new THREE.Color(0xFFFFFF),  //Change for custom color 
            emissiveIntensity: 1, 
        });
        projectDescription.text = star.description;
        projectDescription.font = '/fonts/Alsina.ttf';
        projectDescription.fontSize = .15;
        projectDescription.anchorX = 1.25;
        projectDescription.anchorY = -1.5;
        projectDescription.position.set(0,0,1.1)
        projectDescription.rotation.set(Math.PI / 1.02, -Math.PI / 1.02, -Math.PI / 1)
        projectDescription.overflowWrap = "break-word";
        projectDescription.maxWidth = 3.5;  
        projectDescription.clipRect = [-1.25, -2, 4, 1.5];

        scene.add(projectDescription);


        //Back button 
        const goBack = new Text();
        goBack.color = new THREE.Color(0xffffff);
        goBack.fillOpacity = 0.4;
        goBack.emissive = new THREE.Color(0xffffff);
        goBack.emissiveIntensity = 1;
        goBack.text = "Go Back >";
        goBack.position.set(0,0,1.1)
        goBack.anchorX = -3;
        goBack.anchorY = 1.9;
        goBack.fontSize = .25;
        goBack.fillOpacity = .4;
        goBack.outlineWidth = .01;
        goBack.outlineColor = new THREE.Color(0x000000);
        scene.add(goBack);

        //On MouseClick (Add function to to go back button)
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        
        
        const onMouseClick = (event)=> {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects([goBack]);

            if(intersects.length > 0){
                router.push(`/`);
                console.log("clicked")
            }
        }
        window.addEventListener("click", onMouseClick);

        
        //On Mousemove (light up go back button)
        let targetOpacity = 1;
        let currentOpacity = 0.4;

        let targetLocation = -3.2; 
        let currentLocation = -3;

        const onMouseMove = (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects([goBack]);


            if (intersects.length > 0) {
                targetOpacity = 1; 
                targetLocation = -3.2; 

            } else {
                targetOpacity = 0.4; 
                targetLocation = -3;

            }
        }
        window.addEventListener("mousemove", onMouseMove);


        //Basic lighting 
        const light = new THREE.DirectionalLight(0x404040,70);
        light.target = projectName
        light.position.set(0,0,-1);
        scene.add(light);

        //Adding color replacement shader 
        // const colorReplacementShader = {
        //     uniforms: {
        //         "tDiffuse": { value: null },  // Input HDRI texture
        //         "greenColor": { value: new THREE.Color("#0C2B09") },  // Original green color to replace
        //         "blueColor": { value: new THREE.Color("#7C8FFF") },  // Original blue color to replace
        //         "newGreenColor": { value: new THREE.Color("#f20505") },  // New color to replace green 
        //         "newBlueColor": { value: new THREE.Color("#0511f2") },  // New color to replace blue
        //         "greenColorRange": { value: 1 },     // Tolerance for green colors
        //         "blueColorRange": { value: 1 },      // Tolerance for blue colors
        //         "greenHueRange": { value: .5 },      // Hue range for detecting greens
        //         "blueHueRange": { value: .5 }        // Hue range for detecting blues
        //     },
        //     vertexShader: `
        //         varying vec2 vUv;
        //         void main() {
        //             vUv = uv;
        //             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        //         }
        //     `,
        //     fragmentShader: `
        //         uniform sampler2D tDiffuse;
        //         uniform vec3 greenColor;
        //         uniform vec3 blueColor;
        //         uniform vec3 newGreenColor;
        //         uniform vec3 newBlueColor;
        //         uniform float greenColorRange;
        //         uniform float blueColorRange;
        //         uniform float greenHueRange;
        //         uniform float blueHueRange;
        //         varying vec2 vUv;
                
        //         // Convert RGB to HSV for better color identification
        //         vec3 rgb2hsv(vec3 c) {
        //             vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        //             vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        //             vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
                
        //             float d = q.x - min(q.w, q.y);
        //             float e = 1.0e-10;
        //             return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        //         }
                
        //         // Convert HSV to RGB
        //         vec3 hsv2rgb(vec3 c) {
        //             vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        //             vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        //             return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        //         }
                
        //         // Calculate the hue difference considering the circular nature of hue
        //         float hueDistance(float h1, float h2) {
        //             float diff = abs(h1 - h2);
        //             return min(diff, 1.0 - diff);
        //         }
                
        //         void main() {
        //             vec4 texel = texture2D(tDiffuse, vUv);
        //             vec3 color = texel.rgb;
                    
        //             // Convert the pixel color to HSV
        //             vec3 pixelHSV = rgb2hsv(color);
                    
        //             // Convert target colors to HSV
        //             vec3 greenHSV = rgb2hsv(greenColor);
        //             vec3 blueHSV = rgb2hsv(blueColor);
        //             vec3 newGreenHSV = rgb2hsv(newGreenColor);
        //             vec3 newBlueHSV = rgb2hsv(newBlueColor);
                    
        //             // Check if the pixel is in the green range (using hue as the primary identifier)
        //             float greenHueDist = hueDistance(pixelHSV.x, greenHSV.x);
        //             if (greenHueDist < greenHueRange && pixelHSV.y > 0.15) {  // Only consider saturated colors
        //                 // Calculate how close it is to the target green hue
        //                 float blendFactor = 1.0 - (greenHueDist / greenHueRange);
        //                 blendFactor = smoothstep(0.0, 1.0, blendFactor);
                        
        //                 // Create a new color with the target hue and saturation but preserve brightness
        //                 vec3 newColorHSV = vec3(
        //                     newGreenHSV.x,       // New hue
        //                     mix(pixelHSV.y, newGreenHSV.y, 0.7),  // Blend saturation (70% new, 30% original)
        //                     pixelHSV.z           // Preserve original brightness
        //                 );
                        
        //                 // Convert back to RGB
        //                 vec3 newColorRGB = hsv2rgb(newColorHSV);
                        
        //                 // Apply the color change with the calculated blend factor
        //                 color = mix(color, newColorRGB, blendFactor);
        //             }
                    
        //             // Check if the pixel is in the blue range (using hue as the primary identifier)
        //             float blueHueDist = hueDistance(pixelHSV.x, blueHSV.x);
        //             if (blueHueDist < blueHueRange && pixelHSV.y > 0.15) {  // Only consider saturated colors
        //                 // Calculate how close it is to the target blue hue
        //                 float blendFactor = 1.0 - (blueHueDist / blueHueRange);
        //                 blendFactor = smoothstep(0.0, 1.0, blendFactor);
                        
        //                 // Create a new color with the target hue and saturation but preserve brightness
        //                 vec3 newColorHSV = vec3(
        //                     newBlueHSV.x,        // New hue
        //                     mix(pixelHSV.y, newBlueHSV.y, 0.7),   // Blend saturation (70% new, 30% original)
        //                     pixelHSV.z           // Preserve original brightness
        //                 );
                        
        //                 // Convert back to RGB
        //                 vec3 newColorRGB = hsv2rgb(newColorHSV);
                        
        //                 // Apply the color change with the calculated blend factor
        //                 color = mix(color, newColorRGB, blendFactor);
        //             }
                    
        //             gl_FragColor = vec4(color, texel.a);
        //         }
        //     `
        // };
        
        
        
        
        
        
        // const randomIndex = Math.floor(Math.random() * 10) + 1;
        // const randomNebulaePath = `/textures/nebulae/${randomIndex}.exr`;

        // // HDRI Loader and Shader Application
        // const pmremGenerator = new THREE.PMREMGenerator(renderer);
        // pmremGenerator.compileEquirectangularShader();
        
        // new EXRLoader().load(randomNebulaePath, function (texture) {
        //     texture.mapping = THREE.EquirectangularReflectionMapping;
        //     texture.colorSpace = THREE.LinearSRGBColorSpace;
        
   
        //     const hdriProcessingScene = new THREE.Scene();
        //     const hdriProcessingCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); 
            
 
        //     const hdriQuad = new THREE.Mesh(
        //         new THREE.PlaneGeometry(2, 2),
        //         new THREE.ShaderMaterial({
        //             uniforms: THREE.UniformsUtils.clone(colorReplacementShader.uniforms),
        //             vertexShader: colorReplacementShader.vertexShader,
        //             fragmentShader: colorReplacementShader.fragmentShader,
        //         })
        //     );
            
        //     // Set diffrent colors 
        //     hdriQuad.material.uniforms["tDiffuse"].value = texture;
        //     hdriQuad.material.uniforms["newGreenColor"].value = new THREE.Color("#261603");
        //     hdriQuad.material.uniforms["newBlueColor"].value = new THREE.Color("#3a87ba");
            
        //     hdriProcessingScene.add(hdriQuad);
            
        //     const width = texture.image.width;
        //     const height = texture.image.height;
        //     const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        //         format: THREE.RGBAFormat,
        //         type: THREE.FloatType
        //     });
            
        //     renderer.setRenderTarget(renderTarget);
        //     renderer.render(hdriProcessingScene, hdriProcessingCamera);
        //     renderer.setRenderTarget(null);
            
        //     const processedHDRI = renderTarget.texture;
        //     processedHDRI.mapping = THREE.EquirectangularReflectionMapping;
            
        //     const envMap = pmremGenerator.fromEquirectangular(processedHDRI).texture;
            
        //     scene.environment = envMap;
        //     scene.background = envMap;
        //     texture.dispose();
        //     renderTarget.dispose();
        //     pmremGenerator.dispose();
        // });


       
        
        

        //Path Geometry 
        const points = [
            new THREE.Vector3(7.5, 3.5, -3),    // Top 
            new THREE.Vector3(4, 2,  .5),    // Upper front 
            new THREE.Vector3(4, -2, .5),   // Lower front 
            new THREE.Vector3(7.5, -3.5, -3),   // Bottom 
            new THREE.Vector3(10, -2, -5.2),   // Lower back
            new THREE.Vector3(10, 2, -5.2)     // Upper back
        ];
        
        
        
        
        const path = new THREE.CatmullRomCurve3(points, true);
        
        const pathGeometry = new THREE.BufferGeometry().setFromPoints(
            path.getPoints(50)
        );
        const pathMaterial = new THREE.LineBasicMaterial({color: 0xff0000, transparent: true, opacity: 0  });
        const pathObject = new THREE.Line(pathGeometry, pathMaterial);
        scene.add(pathObject);
       
        //Getting and making images 
        const allImagePlanes = [];
        star.imageURL.forEach((url) => {

            const URL = `/images/${url}`; 
         
            const geometry = new THREE.PlaneGeometry(16, 9);
            const texture = new THREE.TextureLoader().load(URL);
            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        
            const plane = new THREE.Mesh(geometry, material);
            plane.scale.set(.14,.14,.14)
        
           
            scene.add(plane); 
            allImagePlanes.push(plane);
        });


        //Adding stars 
        const starArray = getStarfield({numStars: 500});
        scene.add(starArray);

        //FPS Counter 
        const stats = Stats()
        document.body.appendChild(stats.dom)

        //Mousemovent camera rotation 
        let mouseX = 0, mouseY = 0;
        const sensitivity = .01;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1; // Normalize [-1, 1]
            mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        });
          
        //MouseScroll event for images (stores it as a value between 1-0 to be applied to animate function)

        let scrollProgress = 0; 
        let scrollProgressText = 0;
        const scrollSpeed = 0.0005; 

        window.addEventListener("wheel", (event) => {
            scrollProgress += event.deltaY * scrollSpeed;
            scrollProgress = (scrollProgress % 1 + 1) % 1;

            //Scrolling text (maybe add dynamic min max based on the length of the string in star.description later on)
            scrollProgressText -= event.deltaY * scrollSpeed; 
            projectDescription.anchorY = -1.5 + scrollProgressText * 3; 
            projectDescription.position.set(projectDescription.position.x, projectDescription.position.y, 1.1);
        

            animate(); 
        });

        
        function animate() {
            

            //Camera movement 
            const targetX = mouseX * sensitivity;
            const targetY = mouseY * sensitivity;

            camera.position.x = Math.sin(targetX) * 5; // 5 = distance from object
            camera.position.z = Math.cos(targetX) * 5;
            camera.position.y = targetY * 2; 

            camera.lookAt(new THREE.Vector3(0, 0, 0)); 

            //Go Back Opacity transition 
            const speedO = 0.1; 
            currentOpacity += (targetOpacity - currentOpacity) * speedO;
            
            goBack.fillOpacity = currentOpacity;

            const speedL = .05
            currentLocation += (targetLocation - currentLocation) * speedL;

            goBack.anchorX = currentLocation;

            //Animating bassed on Scroll Event (scrollProgress is the main factor comes from scroll event )
            const timeOffset = .1 / allImagePlanes.length; 

            allImagePlanes.forEach((plane, index) => {
                const t = (scrollProgress + .25 + index * timeOffset) % 1; 
                const position = path.getPointAt(t);
                plane.position.copy(position);
            });
            

            renderer.render(scene, camera);
            renderer.setAnimationLoop(animate);
            stats.update();


            
        }
        animate()
    })
    return (
        <div style={{ width: "100%", height: "100%" }}></div>
      );
};

export default StarPageScene;