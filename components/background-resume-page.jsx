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
    const camera = new THREE.PerspectiveCamera(75, windowW / windowH, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(windowW, windowH);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    
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
    
    loader.load('/models/star_models/BlueWhiteTestStar.glb', (gltf) => {
        const saternMesh = gltf.scene;
        saternMesh.position.set(0, 0, 0);
        saternMesh.scale.set(10, 10, 10); 
        scene.add(saternMesh);
    });
   

    //Starfield
    const starfield = getStarfield({ numStars: 500 });
    scene.add(starfield);

    camera.position.set(0, 0, 0);

    let mouseX = 0;
    let mouseY = 0;
    const sensitivity = 0.05;

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
      // Clean up for three.js assets 
      scene.traverse((object) => {
        if (object.isMesh) {
          scene.remove(object);
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
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