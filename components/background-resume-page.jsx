'use client';
import { useEffect } from 'react';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';

import * as THREE from 'three';
import getStarfield from './getStarfield.js';

const ResumePageBackground = () => {
  
  useEffect(() => {
    // Scene setup
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(95, windowW / windowH, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(windowW, windowH);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    scene.fog = new THREE.FogExp2( 0x0e402a, .025 );

    // Create container and append renderer
    const container = document.getElementById('threejs-background');
    if (container) {
      container.appendChild(renderer.domElement);
    }

    // test sphere
    const sphereGeometry = new THREE.SphereGeometry(15, 64, 64);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
    });
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-15, -5, -15);
    // scene.add(sphere);
    //test lights 
    const light = new THREE.AmbientLight(0x404040,5);
    light.position.set(-3,3,-10);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    //loading satern 
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
    
    loader.load('/models/star_models/sun.glb', (gltf) => {
        const saternMesh = gltf.scene;
        saternMesh.position.set(-30, -20, -48);
        saternMesh.scale.set(50+13, 50+13, 50+13); 
        scene.add(saternMesh);
    });
   

    //Starfield
    const starfield = getStarfield({ numStars: 500 });
    scene.add(starfield);

    camera.position.set(0, 0, 0);

    let mouseX = 0;
    let mouseY = 0;
    const sensitivity = 0.01;

    // Handling camera move for mouse
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);


    //Adding video plane
    const video = document.createElement('video');
    video.src = '/textures/sun_flare/outputv2.webm';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    video.addEventListener('loadeddata', () => {
    video.play();
    });

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    videoTexture.generateMipmaps = false;

    const material = new THREE.ShaderMaterial({
    uniforms: {
        map: { value: videoTexture },
        threshold: { value: 0.000000000001 }, // more or less black area
        darkColor: { value: new THREE.Color(0xffffff) },  // Default black
        lightColor: { value: new THREE.Color(0xffffff) }  // Default white
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D map;
        uniform float threshold;
        uniform vec3 darkColor;
        uniform vec3 lightColor;
        varying vec2 vUv;

        void main() {
        vec4 texColor = texture2D(map, vUv);
        float brightness = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
        float mixFactor = smoothstep(threshold, 1.0, brightness);
        vec3 resultColor = mix(darkColor, lightColor, mixFactor);

        // Make alpha depend on brightness
        float alpha = smoothstep(threshold, 1.0, brightness); // fade in based on threshold
        gl_FragColor = vec4(resultColor, alpha);
        }
    `,
    transparent: true,
    side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(-2.8, -2.1, -4);
    plane.scale.set(36, 31, 10);  

    plane.lookAt(camera.position);

    material.uniforms.darkColor.value.set(0x1fad70);
    material.uniforms.lightColor.value.set(0xd5f2e6); 


    scene.add(plane);

    function animate() {
      // Camera movement
      const targetX = mouseX * sensitivity;
      const targetY = mouseY * sensitivity;

      camera.position.x = Math.sin(targetX) * 10;
      camera.position.z = Math.cos(targetX) * 10;
      camera.position.y = targetY * 5;

      camera.lookAt(new THREE.Vector3(0, 0, 0));

      sphere.rotation.x += 0.005;
      sphere.rotation.y += 0.01;

      renderer.render(scene, camera);
      renderer.setAnimationLoop(animate);
    }

    animate();

    //cleaning up function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
    };
  }, []);

  return (
    <div 
      id="threejs-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default ResumePageBackground;