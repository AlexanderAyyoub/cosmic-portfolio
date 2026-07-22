'use client';
import { useEffect, useMemo, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { DRACOLoader } from 'three/examples/jsm/Addons.js';
import { EXRLoader } from 'three/examples/jsm/Addons.js';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import getStarfield from './getStarfield.js';


const SUN_START_POS = new THREE.Vector3(-30, -20, -48);
const SUN_END_POS = new THREE.Vector3(-80, -10, -140);
const SUN_START_SCALE = 63;
const SUN_END_SCALE = 65;

const FLARE_START_POS = new THREE.Vector3(-4, -3, -4);
const FLARE_END_POS = new THREE.Vector3(-48, -8, -80);
const FLARE_START_SCALE = new THREE.Vector3(36, 38, 17);
const FLARE_END_SCALE = new THREE.Vector3(117, 97, 140);

const StarPageScene = ({ star }) => {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);

  const warpStars = useMemo(() => (
    Array.from({ length: 350 }, () => ({
      angle: `${Math.random() * 360}deg`,
      delay: `-${Math.random() * 2}s`,
      duration: `${0.8 + Math.random() * 0.8}s`,
      width: `${1 + Math.random() * 1.5}px`,
      height: `${420 + Math.random() * 420}px`,
    }))
  ), []);

  // Load the fonts (same pattern as resume-page.tsx)
  useEffect(() => {
    const titleFont = new FontFace(
      'AlbertusMTStd',
      'url(/fonts/AlbertusMTStd.otf)'
    );

    const bodyFont = new FontFace(
      'ABCArizonaFlare',
      'url(/fonts/ABCArizonaFlare-Regular-Trial.otf)'
    );

    Promise.all([titleFont.load(), bodyFont.load()])
      .then(([loadedTitleFont, loadedBodyFont]) => {
        document.fonts.add(loadedTitleFont);
        document.fonts.add(loadedBodyFont);
      })
      .catch((error) => {
        console.error('Font failed to load:', error);
      });
  }, []);

  // Reveal the 2D content once the user scrolls past the hero
  useEffect(() => {
    const handleScroll = () => {
      setRevealed(window.scrollY > window.innerHeight * 0.2);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

 
  useEffect(() => {
    let isSnapping = false;

    const handleWheel = (event) => {
      if (isSnapping || event.deltaY <= 0) return;
      const target = window.innerHeight * 1.1;
      if (window.scrollY < target - 10) {
        event.preventDefault();
        isSnapping = true;
        window.scrollTo({ top: target, behavior: 'smooth' });
        setTimeout(() => {
          isSnapping = false;
        }, 1000);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Three.js background: starfield + nebula + sun/flare, tied to scroll
  useEffect(() => {
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

    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, windowW / windowH, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(windowW, windowH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const container = document.getElementById('star-page-background');
    if (container) {
      container.appendChild(renderer.domElement);
    }
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    camera.position.set(0, 0, 0);

    scene.fog = new THREE.FogExp2(star.color1, 0.01);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };
    window.addEventListener('resize', handleResize);

    // Sun model
    const loader = new GLTFLoader(loadingManager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    let sunMesh = null;
    loader.load(star.modleName, (gltf) => {
      sunMesh = gltf.scene;
      sunMesh.position.copy(SUN_START_POS);
      sunMesh.scale.setScalar(SUN_START_SCALE);
      scene.add(sunMesh);
    });

    // Solar flare video plane
    const video = document.createElement('video');
    video.src = star.solarFlareGIF;
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

    const flareMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: videoTexture },
        threshold: { value: 0.001 },
        darkColor: { value: new THREE.Color(star.color2) },
        lightColor: { value: new THREE.Color(star.color1) },
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
          float alpha = smoothstep(threshold, 1.0, brightness);
          gl_FragColor = vec4(resultColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const flareGeometry = new THREE.PlaneGeometry(2, 2);
    const flarePlane = new THREE.Mesh(flareGeometry, flareMaterial);
    flarePlane.position.copy(FLARE_START_POS);
    flarePlane.scale.copy(FLARE_START_SCALE);
    flarePlane.lookAt(camera.position);
    scene.add(flarePlane);

    // Nebula environment, tinted with this star's palette
    const randomIndex = Math.floor(Math.random() * 10) + 1;
    const randomNebulaePath = `/textures/nebulae/${randomIndex}.exr`;

    const colorReplacementShader = {
      uniforms: {
        tDiffuse: { value: null },
        greenColor: { value: new THREE.Color('#0C2B09') },
        blueColor: { value: new THREE.Color('#7C8FFF') },
        newGreenColor: { value: new THREE.Color('#f20505') },
        newBlueColor: { value: new THREE.Color('#0511f2') },
        greenColorRange: { value: 0.1 },
        blueColorRange: { value: 1 },
        greenHueRange: { value: 0.5 },
        blueHueRange: { value: 0.5 },
        exposure: { value: 0.3 },
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
        uniform float exposure;
        varying vec2 vUv;

        vec3 rgb2hsv(vec3 c) {
            vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        float hueDistance(float h1, float h2) {
            float diff = abs(h1 - h2);
            return min(diff, 1.0 - diff);
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            vec3 color = texel.rgb;

            vec3 pixelHSV = rgb2hsv(color);

            vec3 greenHSV = rgb2hsv(greenColor);
            vec3 blueHSV = rgb2hsv(blueColor);
            vec3 newGreenHSV = rgb2hsv(newGreenColor);
            vec3 newBlueHSV = rgb2hsv(newBlueColor);

            float greenHueDist = hueDistance(pixelHSV.x, greenHSV.x);
            if (greenHueDist < greenHueRange && pixelHSV.y > 0.15) {
                float blendFactor = 1.0 - (greenHueDist / greenHueRange);
                blendFactor = smoothstep(0.0, 1.0, blendFactor);

                vec3 newColorHSV = vec3(
                    newGreenHSV.x,
                    mix(pixelHSV.y, newGreenHSV.y, 0.7),
                    pixelHSV.z
                );
                vec3 newColorRGB = hsv2rgb(newColorHSV);
                color = mix(color, newColorRGB, blendFactor);
            }

            float blueHueDist = hueDistance(pixelHSV.x, blueHSV.x);
            if (blueHueDist < blueHueRange && pixelHSV.y > 0.15) {
                float blendFactor = 1.0 - (blueHueDist / blueHueRange);
                blendFactor = smoothstep(0.0, 1.0, blendFactor);

                vec3 newColorHSV = vec3(
                    newBlueHSV.x,
                    mix(pixelHSV.y, newBlueHSV.y, 0.7),
                    pixelHSV.z
                );
                vec3 newColorRGB = hsv2rgb(newColorHSV);
                color = mix(color, newColorRGB, blendFactor);
            }

            color *= exposure;

            gl_FragColor = vec4(color, texel.a);
        }
      `,
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new EXRLoader(loadingManager).load(randomNebulaePath, (texture) => {
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

      hdriQuad.material.uniforms.tDiffuse.value = texture;
      hdriQuad.material.uniforms.newGreenColor.value = new THREE.Color(star.color3);
      hdriQuad.material.uniforms.newBlueColor.value = new THREE.Color(star.color1);

      hdriProcessingScene.add(hdriQuad);

      const width = texture.image.width;
      const height = texture.image.height;
      const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
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

    // Starfield
    const starArray = getStarfield({ numStars: 500 });
    scene.add(starArray);

    // Subtle mouse-look parallax
    let mouseX = 0;
    let mouseY = 0;
    const sensitivity = 0.01;
    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Scroll-tied zoom: sun + flare travel together from the close-up
    // start framing to their resting position over the first ~1.1 screens.
    let scrollTarget = 0;
    let scrollCurrent = 0;
    const handleScroll = () => {
      const zoomDistance = window.innerHeight * 1.1;
      scrollTarget = THREE.MathUtils.clamp(window.scrollY / zoomDistance, 0, 1);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    let frameId;
    function animate() {
      scrollCurrent += (scrollTarget - scrollCurrent) * 0.07;

      if (sunMesh) {
        sunMesh.position.lerpVectors(SUN_START_POS, SUN_END_POS, scrollCurrent);
        sunMesh.scale.setScalar(THREE.MathUtils.lerp(SUN_START_SCALE, SUN_END_SCALE, scrollCurrent));
      }

      flarePlane.position.lerpVectors(FLARE_START_POS, FLARE_END_POS, scrollCurrent);
      flarePlane.scale.lerpVectors(FLARE_START_SCALE, FLARE_END_SCALE, scrollCurrent);
      flarePlane.lookAt(camera.position);

      const targetX = mouseX * sensitivity;
      const targetY = mouseY * sensitivity;
      camera.position.x = Math.sin(targetX) * 5;
      camera.position.z = Math.cos(targetX) * 5;
      camera.position.y = targetY * 2;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);

      video.pause();
      videoTexture.dispose();
      flareGeometry.dispose();
      flareMaterial.dispose();
      dracoLoader.dispose();

      scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [star]);

  const handleGoBack = () => {
    router.push('/homePage');
  };

  const titleColor = star.color4 || '#EEE8DC';
  const bodyColor = star.color2 || '#C2C8B8';
  const accentColor = star.color3 || '#6E00F5';

  const imageUrls = Array.isArray(star.imageURL)
    ? star.imageURL
    : typeof star.imageURL === 'string' && star.imageURL.trim() !== ''
      ? star.imageURL.split(',').map((url) => url.trim()).filter(Boolean)
      : [];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        fontFamily: 'ABCArizonaFlare, Arial, sans-serif',
        color: bodyColor,
      }}
    >
      <div
        id="star-page-background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none',
          background: '#000000',
        }}
      />

      {/* Hero spacer: lets the sun sit huge and alone before content appears */}
      <div className="relative h-screen">
        <div
          className="absolute top-6 right-6 md:top-10 md:right-10 text-right"
          style={{
            fontFamily: 'AlbertusMTStd, serif',
            color: titleColor,
            opacity: revealed ? 0 : 0.8,
            transition: 'opacity 0.6s ease',
          }}
        >
          <div className="text-2xl md:text-4xl tracking-widest uppercase leading-tight">Scroll to view</div>
          <div className="text-2xl md:text-4xl tracking-widest uppercase leading-tight">the project</div>
          <div className="text-3xl md:text-5xl mt-2">↓ ↓</div>
        </div>
      </div>

      <div
        className="relative z-10 px-6 md:px-10 lg:px-14 pb-24"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        <div className="max-w-6xl ml-auto mr-2 md:mr-8">
          <header className="space-y-3 mb-10">
            <div
              className="text-4xl md:text-6xl font-bold tracking-tight"
              style={{
                fontFamily: 'AlbertusMTStd, serif',
                color: titleColor,
              }}
            >
              {star.name}
            </div>
            <div className="w-24 h-[2px]" style={{ backgroundColor: accentColor }} />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
            <div
              className="relative overflow-hidden rounded-[28px]"
              style={{
                background: 'rgba(0, 14, 20, 0.7)',
                backdropFilter: 'blur(7px)',
                WebkitBackdropFilter: 'blur(7px)',
              }}
            >
              <div className="px-6 md:px-8 lg:px-10 py-8">
                <p
                  className="text-base md:text-lg leading-relaxed whitespace-pre-line"
                  style={{ color: bodyColor }}
                >
                  {star.description}
                </p>
              </div>
            </div>

            {imageUrls.length > 0 && (
              <div
                className="relative overflow-hidden rounded-[28px] aspect-square"
                style={{
                  background: 'rgba(0, 14, 20, 0.7)',
                  backdropFilter: 'blur(7px)',
                  WebkitBackdropFilter: 'blur(7px)',
                }}
              >
                <div
                  className={`h-full w-full p-3 grid gap-2 ${
                    imageUrls.length > 1 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-1'
                  }`}
                >
                  {imageUrls.slice(0, 4).map((url, index) => (
                    <div
                      key={index}
                      className="rounded-sm border overflow-hidden"
                      style={{ borderColor: 'rgba(238, 232, 220, 0.14)' }}
                    >
                      <img
                        src={url}
                        alt={`${star.name} screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleGoBack}
        className="fixed bottom-8 right-8 z-50 px-6 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: '#000E14',
          border: `2px solid ${titleColor}`,
          fontFamily: 'AlbertusMTStd, serif',
          color: titleColor,
        }}
      >
        <div className="text-lg font-semibold">
          &lt; Go Back
        </div>
      </button>

      <div
        id="global-loader"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 9999,
          pointerEvents: 'auto',
          transition: 'opacity 0.8s ease-in-out',
          background: 'black',
        }}
      >
        {/* CSS Warp Speed */}
        <style>{`
            @keyframes warpStreak {
                0%   { transform: translateX(-50%) translateY(0)      scaleY(0); opacity: 0; }
                5%   { opacity: 1; }
                100% { transform: translateX(-50%) translateY(-110vh) scaleY(1); opacity: 1; }
            }
            .warp-anchor {
                position: absolute;
                left: 50%;
                top: 50%;
                width: 0;
                height: 0;
            }
            .warp-star {
                position: absolute;
                left: 0;
                bottom: 0;
                background: linear-gradient(to top, transparent 0%, transparent 50%, white 100%);
                transform-origin: center bottom;
                animation: warpStreak linear infinite;
                will-change: transform, opacity;
            }
        `}</style>
        {warpStars.map((s, i) => (
          <div
            key={i}
            className="warp-anchor"
            style={{ transform: `rotate(${s.angle})` }}
          >
            <div
              className="warp-star"
              style={{
                width: s.width,
                height: s.height,
                animationDelay: s.delay,
                animationDuration: s.duration,
              }}
            />
          </div>
        ))}

        {/* Overlay content */}
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
            zIndex: 1,
          }}
        >
          <style jsx global>{`
              @font-face {
                  font-family: 'AlbertusMTStd';
                  src: url('/fonts/AlbertusMTStd.otf') format('opentype');
                  font-display: swap;
              }
          `}</style>

          <h1 className="text-2xl mb-4 tracking-wide">
            Loading
          </h1>

          <div className="w-1/2 max-w-md">
            <progress
              id="global-progress-bar"
              value="0"
              max="100"
              className="w-full h-3 appearance-none overflow-hidden rounded bg-white/10 [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-white [&::-moz-progress-bar]:bg-white"
            />
          </div>

          <p
            id="global-progress-label"
            className="mt-4 text-sm text-gray-300"
          >
            0%
          </p>
        </div>
      </div>
    </div>
  );
};

export default StarPageScene;
