"use client";
import { useEffect } from 'react';
import { EXRLoader } from 'three/examples/jsm/Addons.js';
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



        //Adding color replacement shader 
        const colorReplacementShader = {
            uniforms: {
                "tDiffuse": { value: null },  // Input HDRI texture
                "greenColor": { value: new THREE.Color("#0C2B09") },  // Original green color to replace
                "blueColor": { value: new THREE.Color("#7C8FFF") },  // Original blue color to replace
                "newGreenColor": { value: new THREE.Color("#f20505") },  // New color to replace green 
                "newBlueColor": { value: new THREE.Color("#0511f2") },  // New color to replace blue
                "greenColorRange": { value: 1 },     // Tolerance for green colors
                "blueColorRange": { value: 1 },      // Tolerance for blue colors
                "greenHueRange": { value: .5 },      // Hue range for detecting greens
                "blueHueRange": { value: .5 }        // Hue range for detecting blues
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform vec3 greenColor;
                uniform vec3 blueColor;
                uniform vec3 newGreenColor;
                uniform vec3 newBlueColor;
                uniform float greenColorRange;
                uniform float blueColorRange;
                uniform float greenHueRange;
                uniform float blueHueRange;
                varying vec2 vUv;
                
                // Convert RGB to HSV for better color identification
                vec3 rgb2hsv(vec3 c) {
                    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
                    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
                    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
                
                    float d = q.x - min(q.w, q.y);
                    float e = 1.0e-10;
                    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
                }
                
                // Convert HSV to RGB
                vec3 hsv2rgb(vec3 c) {
                    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
                }
                
                // Calculate the hue difference considering the circular nature of hue
                float hueDistance(float h1, float h2) {
                    float diff = abs(h1 - h2);
                    return min(diff, 1.0 - diff);
                }
                
                void main() {
                    vec4 texel = texture2D(tDiffuse, vUv);
                    vec3 color = texel.rgb;
                    
                    // Convert the pixel color to HSV
                    vec3 pixelHSV = rgb2hsv(color);
                    
                    // Convert target colors to HSV
                    vec3 greenHSV = rgb2hsv(greenColor);
                    vec3 blueHSV = rgb2hsv(blueColor);
                    vec3 newGreenHSV = rgb2hsv(newGreenColor);
                    vec3 newBlueHSV = rgb2hsv(newBlueColor);
                    
                    // Check if the pixel is in the green range (using hue as the primary identifier)
                    float greenHueDist = hueDistance(pixelHSV.x, greenHSV.x);
                    if (greenHueDist < greenHueRange && pixelHSV.y > 0.15) {  // Only consider saturated colors
                        // Calculate how close it is to the target green hue
                        float blendFactor = 1.0 - (greenHueDist / greenHueRange);
                        blendFactor = smoothstep(0.0, 1.0, blendFactor);
                        
                        // Create a new color with the target hue and saturation but preserve brightness
                        vec3 newColorHSV = vec3(
                            newGreenHSV.x,       // New hue
                            mix(pixelHSV.y, newGreenHSV.y, 0.7),  // Blend saturation (70% new, 30% original)
                            pixelHSV.z           // Preserve original brightness
                        );
                        
                        // Convert back to RGB
                        vec3 newColorRGB = hsv2rgb(newColorHSV);
                        
                        // Apply the color change with the calculated blend factor
                        color = mix(color, newColorRGB, blendFactor);
                    }
                    
                    // Check if the pixel is in the blue range (using hue as the primary identifier)
                    float blueHueDist = hueDistance(pixelHSV.x, blueHSV.x);
                    if (blueHueDist < blueHueRange && pixelHSV.y > 0.15) {  // Only consider saturated colors
                        // Calculate how close it is to the target blue hue
                        float blendFactor = 1.0 - (blueHueDist / blueHueRange);
                        blendFactor = smoothstep(0.0, 1.0, blendFactor);
                        
                        // Create a new color with the target hue and saturation but preserve brightness
                        vec3 newColorHSV = vec3(
                            newBlueHSV.x,        // New hue
                            mix(pixelHSV.y, newBlueHSV.y, 0.7),   // Blend saturation (70% new, 30% original)
                            pixelHSV.z           // Preserve original brightness
                        );
                        
                        // Convert back to RGB
                        vec3 newColorRGB = hsv2rgb(newColorHSV);
                        
                        // Apply the color change with the calculated blend factor
                        color = mix(color, newColorRGB, blendFactor);
                    }
                    
                    gl_FragColor = vec4(color, texel.a);
                }
            `
        };
        
        
        
        
        
        
        const randomIndex = Math.floor(Math.random() * 10) + 1;
        const randomNebulaePath = `/textures/nebulae/${randomIndex}.exr`;

        // HDRI Loader and Shader Application
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        
        new EXRLoader().load(randomNebulaePath, function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.LinearSRGBColorSpace;
        
   
            const hdriProcessingScene = new THREE.Scene();
            const hdriProcessingCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); 
            
 
            const hdriQuad = new THREE.Mesh(
                new THREE.PlaneGeometry(2, 2),
                new THREE.ShaderMaterial({
                    uniforms: THREE.UniformsUtils.clone(colorReplacementShader.uniforms),
                    vertexShader: colorReplacementShader.vertexShader,
                    fragmentShader: colorReplacementShader.fragmentShader,
                })
            );
            
            // Set diffrent colors 
            hdriQuad.material.uniforms["tDiffuse"].value = texture;
            hdriQuad.material.uniforms["newGreenColor"].value = new THREE.Color("#fc3e28");
            hdriQuad.material.uniforms["newBlueColor"].value = new THREE.Color("#1f56ed");
            
            hdriProcessingScene.add(hdriQuad);
            
            const width = texture.image.width;
            const height = texture.image.height;
            const renderTarget = new THREE.WebGLRenderTarget(width, height, {
                format: THREE.RGBAFormat,
                type: THREE.FloatType
            });
            
            renderer.setRenderTarget(renderTarget);
            renderer.render(hdriProcessingScene, hdriProcessingCamera);
            renderer.setRenderTarget(null);
            
            const processedHDRI = renderTarget.texture;
            processedHDRI.mapping = THREE.EquirectangularReflectionMapping;
            
            const envMap = pmremGenerator.fromEquirectangular(processedHDRI).texture;
            
            scene.environment = envMap;
            scene.background = envMap;
            texture.dispose();
            renderTarget.dispose();
            pmremGenerator.dispose();
        });


       
        
        


       


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
            // composer.render();
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