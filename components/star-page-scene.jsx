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
const FLARE_END_POS = new THREE.Vector3(-48, -7, -82);
const FLARE_START_SCALE = new THREE.Vector3(36, 38, 17);
const FLARE_END_SCALE = new THREE.Vector3(114, 93, 135);

//Asteroid field (bands are multiples of the sun's measured radius)
const ASTEROID_MODEL_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const ASTEROID_HEAVY_TRIS = 8000;
const TEXTURE_SLOTS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'];

//Where animate() parks the camera, and how much space to leave it
const CAMERA_HOME = new THREE.Vector3(0, 0, 5);
const CAMERA_KEEPOUT = 30;
const SUN_CLEARANCE = 1.14;
const DRIFT_MAX = 7;

//Ring pattern
const RING_BAND = [1.5, 2.35];
const RING_COUNT = 460;

//Scatter pattern
const SCATTER_BAND = [1.3, 3.2];
const SCATTER_COUNT = 210;

//Clump pattern
const CLUMP_BAND = [1.35, 3];
const CLUMP_RANGE = [8, 13];
const CLUMP_MEMBERS = [9, 22];

//Foreground rocks, measured off the camera path instead of the sun
const NEAR_COUNT = 70;
const NEAR_REACH = [8, 95];

//Single drifting rocks
const LONER_BAND = [1.2, 3];
const LONER_COUNT = 4;
const LONER_SOLITUDE = 46;

//Even spread over a sphere (two random angles would bunch at the poles)
const randomDirection = (target = new THREE.Vector3()) => {
  const z = Math.random() * 2 - 1;
  const angle = Math.random() * Math.PI * 2;
  const ring = Math.sqrt(1 - z * z);
  return target.set(Math.cos(angle) * ring, Math.sin(angle) * ring, z);
};

const perpendicularTo = (axis, target = new THREE.Vector3()) => {
  const seed = Math.abs(axis.x) > 0.9 ? [0, 1, 0] : [1, 0, 0];
  target.set(seed[0], seed[1], seed[2]);
  return target.crossVectors(axis, target).normalize();
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];

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
    let disposed = false;

    //Gives back the sun's radius, which the asteroid field is sized against
    const sunReady = (star.modleName ? loader.loadAsync(star.modleName) : Promise.reject())
      .then((gltf) => {
        if (disposed) return 0;
        sunMesh = gltf.scene;
        sunMesh.position.copy(SUN_START_POS);
        sunMesh.scale.setScalar(SUN_START_SCALE);
        scene.add(sunMesh);
        //Half-extent, not getBoundingSphere() (that measures the box corner)
        const size = new THREE.Box3().setFromObject(sunMesh).getSize(new THREE.Vector3());
        return Math.max(size.x, size.y, size.z) / 2;
      })
      .catch(() => 0);

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

    //Asteroid field. Own LoadingManager so the ~46MB of models doesn't hold up
    //the loading screen, it just fades in when it gets here
    const asteroidLoader = new GLTFLoader(new THREE.LoadingManager());
    asteroidLoader.setDRACOLoader(dracoLoader);

    const asteroids = [];
    const asteroidMeshes = [];
    const asteroidGeometries = new Set();
    const asteroidMaterials = new Set();
    const materialCache = new Map();
    let asteroidField = null;
    let fieldFade = 0;

    const disposeAsteroidAssets = () => {
      asteroidGeometries.forEach((geometry) => geometry.dispose());
      asteroidMaterials.forEach((material) => {
        TEXTURE_SLOTS.forEach((slot) => material[slot]?.dispose());
        material.dispose();
      });
      asteroidGeometries.clear();
      asteroidMaterials.clear();
      materialCache.clear();
    };

    //4-13.glb share the same textures, so they share one material too
    const shareMaterial = (material) => {
      const key = [
        material.name,
        material.map?.image?.width ?? 0,
        material.map?.image?.height ?? 0,
        material.normalMap ? 'n' : '',
        material.roughnessMap ? 'r' : '',
        material.emissiveMap ? 'e' : '',
      ].join('|');

      const cached = materialCache.get(key);
      if (cached) {
        TEXTURE_SLOTS.forEach((slot) => material[slot]?.dispose());
        material.dispose();
        return cached;
      }

      material.fog = false; //the fog would erase anything out by the sun
      material.envMapIntensity = 2.5; //nebula fill on the dark sides
      material.metalness = Math.min(material.metalness ?? 0, 0.2); //some models come in fully metallic
      material.transparent = true; //just for the fade in
      material.opacity = 0;

      materialCache.set(key, material);
      asteroidMaterials.add(material);
      return material;
    };

    //Recentres and normalises each model to a radius of 1 (the pack is all
    //different sizes and some sit way off their own origin, which spins wrong)
    const prepareModel = (gltf) => {
      let source = null;
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((child) => {
        if (!source && child.isMesh) source = child;
      });
      if (!source) return null;

      const geometry = source.geometry.clone();
      geometry.applyMatrix4(source.matrixWorld);
      geometry.computeBoundingSphere();
      const { center, radius } = geometry.boundingSphere;
      geometry.translate(-center.x, -center.y, -center.z);
      geometry.scale(1 / radius, 1 / radius, 1 / radius);
      geometry.computeBoundingSphere();
      geometry.computeBoundingBox();
      asteroidGeometries.add(geometry);

      const index = geometry.getIndex();
      return {
        geometry,
        material: shareMaterial(source.material),
        triangles: (index ? index.count : geometry.attributes.position.count) / 3,
      };
    };

    const buildField = (sunRadius, models) => {
      const field = new THREE.Group();
      field.position.copy(SUN_START_POS);
      scene.add(field);
      asteroidField = field;

      //The star lights its own rocks (sits inside the sun so the sun is unaffected)
      const starLight = new THREE.PointLight(new THREE.Color(star.color1), 1, 0, 1.6);
      starLight.intensity = Math.pow(sunRadius * 2, 1.6) * 3;
      field.add(starLight);

      const camPath = new THREE.Line3(
        CAMERA_HOME.clone().sub(SUN_START_POS),
        CAMERA_HOME.clone().sub(SUN_END_POS)
      );
      const nearest = new THREE.Vector3();
      const minCentre = sunRadius * SUN_CLEARANCE;

      //Rejects anything sitting on the camera's scroll path or inside the sun.
      //Drift is capped at DRIFT_MAX so counting it here keeps rocks clear forever
      const isClear = (pos, bodyRadius) => {
        const margin = bodyRadius + DRIFT_MAX;
        if (pos.length() < minCentre + margin) return false;
        camPath.closestPointToPoint(pos, true, nearest);
        return nearest.distanceTo(pos) > CAMERA_KEEPOUT + margin;
      };

      const findSpot = (propose, bodyRadius, attempts = 48, alsoValid = null) => {
        for (let i = 0; i < attempts; i++) {
          const pos = propose();
          if (isClear(pos, bodyRadius) && (!alsoValid || alsoValid(pos))) return pos;
        }
        return null;
      };

      const onBand = (band, target = new THREE.Vector3()) =>
        randomDirection(target).multiplyScalar(sunRadius * THREE.MathUtils.randFloat(band[0], band[1]));

      //The 54k triangle model is kept out of the crowd, loners can use anything
      const light = models.filter((model) => model.triangles <= ASTEROID_HEAVY_TRIS);
      const crowd = light.length ? light : models;

      //Records a rock. The meshes get built as InstancedMesh once placement is done
      const spawn = (model, pos, bodyRadius) => {
        //Constant spin about one body axis loops seamlessly, bigger rocks turn
        //slower, and some get a second axis so they tumble like the real ones
        const spinRate = THREE.MathUtils.randFloat(0.05, 0.34) / (1 + bodyRadius * 0.12);
        const driftA = THREE.MathUtils.randFloat(1, DRIFT_MAX * 0.66);
        const driftAxisA = randomDirection();

        asteroids.push({
          model,
          base: pos.clone(),
          scale: bodyRadius,
          quaternion: new THREE.Quaternion().setFromEuler(
            new THREE.Euler(
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2
            )
          ),
          spinAxis: randomDirection(),
          spinRate,
          tumbleAxis: Math.random() < 0.45 ? randomDirection() : null,
          tumbleRate: spinRate * 0.28,
          driftAxisA,
          driftAxisB: perpendicularTo(driftAxisA),
          driftA,
          driftB: driftA * 0.5, //driftA + driftB stays under DRIFT_MAX, isClear() counts on it
          driftFreqA: (Math.PI * 2) / THREE.MathUtils.randFloat(19, 68),
          driftFreqB: (Math.PI * 2) / THREE.MathUtils.randFloat(23, 81),
          driftPhase: Math.random() * Math.PI * 2,
        });
      };

      //Pattern 1: planetary ring. Normal is tilted ~60 deg off the sun->camera
      //axis, face on reads as a circle and edge on as a line
      const viewAxis = camPath.end.clone().normalize();
      const ringNormal = viewAxis
        .clone()
        .applyAxisAngle(perpendicularTo(viewAxis), THREE.MathUtils.degToRad(THREE.MathUtils.randFloat(56, 72)))
        .applyAxisAngle(viewAxis, Math.random() * Math.PI * 2)
        .normalize();
      const ringU = perpendicularTo(ringNormal);
      const ringV = new THREE.Vector3().crossVectors(ringNormal, ringU).normalize();

      for (let i = 0; i < RING_COUNT; i++) {
        //Exponent keeps the big ones rare, rings are mostly fine rubble
        const bodyRadius = 0.45 + Math.pow(Math.random(), 3) * 4.3;
        const pos = findSpot(() => {
          const radius = sunRadius * THREE.MathUtils.randFloat(RING_BAND[0], RING_BAND[1]);
          const angle = Math.random() * Math.PI * 2;
          return new THREE.Vector3()
            .addScaledVector(ringU, Math.cos(angle) * radius)
            .addScaledVector(ringV, Math.sin(angle) * radius)
            .addScaledVector(ringNormal, THREE.MathUtils.randFloatSpread(sunRadius * 0.1));
        }, bodyRadius);
        if (pos) spawn(pick(crowd), pos, bodyRadius);
      }

      //Pattern 2: loose scatter through the whole shell
      for (let i = 0; i < SCATTER_COUNT; i++) {
        const bodyRadius = 0.4 + Math.pow(Math.random(), 2.4) * 3.6;
        const pos = findSpot(() => onBand(SCATTER_BAND), bodyRadius);
        if (pos) spawn(pick(crowd), pos, bodyRadius);
      }

      //Pattern 3: small clumps. Whole clump volume is cleared at once so a
      //cluster never straddles the keep out tube
      const clumps = THREE.MathUtils.randInt(CLUMP_RANGE[0], CLUMP_RANGE[1]);
      for (let c = 0; c < clumps; c++) {
        const spread = THREE.MathUtils.randFloat(6, 16);
        const centre = findSpot(() => onBand(CLUMP_BAND), spread + 3);
        if (!centre) continue;

        const members = THREE.MathUtils.randInt(CLUMP_MEMBERS[0], CLUMP_MEMBERS[1]);
        for (let i = 0; i < members; i++) {
          const bodyRadius = 0.3 + Math.pow(Math.random(), 2.6) * 2.3;
          const pos = findSpot(
            () => centre.clone().addScaledVector(randomDirection(), Math.cbrt(Math.random()) * spread),
            bodyRadius,
            16
          );
          if (pos) spawn(pick(crowd), pos, bodyRadius);
        }
      }

      //Pattern 4: foreground rubble
      const nearAnchor = new THREE.Vector3();
      for (let i = 0; i < NEAR_COUNT; i++) {
        const bodyRadius = 0.35 + Math.pow(Math.random(), 2.8) * 3.3;
        const pos = findSpot(() => {
          camPath.at(Math.random(), nearAnchor);
          const reach =
            CAMERA_KEEPOUT + bodyRadius + DRIFT_MAX +
            THREE.MathUtils.randFloat(NEAR_REACH[0], NEAR_REACH[1]);
          return nearAnchor.clone().addScaledVector(randomDirection(), reach);
        }, bodyRadius);
        if (pos) spawn(pick(crowd), pos, bodyRadius);
      }

      // Pattern 5: large high poly models
      const taken = asteroids.map((rock) => rock.base);
      for (let i = 0; i < LONER_COUNT; i++) {
        const bodyRadius = THREE.MathUtils.randFloat(7, 13.5);
        const pos = findSpot(
          () => onBand(LONER_BAND),
          bodyRadius,
          64,
          (candidate) => taken.every((other) => other.distanceTo(candidate) > LONER_SOLITUDE)
        );
        if (pos) {
          spawn(pick(models), pos, bodyRadius);
          taken.push(pos.clone());
        }
      }

      //One InstancedMesh per model instead of a mesh per rock, so a few hundred
      //rocks cost ~13 draw calls. Each rock remembers its slot for the animation
      models.forEach((model) => {
        const members = asteroids.filter((rock) => rock.model === model);
        if (!members.length) return;

        const instanced = new THREE.InstancedMesh(model.geometry, model.material, members.length);
        instanced.frustumCulled = false; //matrices change every frame
        members.forEach((rock, index) => {
          rock.instanced = instanced;
          rock.index = index;
        });
        field.add(instanced);
        asteroidMeshes.push(instanced);
      });
    };

    Promise.all([
      sunReady,
      Promise.all(
        ASTEROID_MODEL_IDS.map((id) =>
          asteroidLoader
            .loadAsync(`/models/astroid-models/${id}.glb`)
            .then(prepareModel)
            .catch(() => null)
        )
      ),
    ]).then(([sunRadius, models]) => {
      const usable = models.filter(Boolean);
      // Without a sun there is nothing to orbit, so skip the field entirely.
      if (disposed || !sunRadius || !usable.length) {
        disposeAsteroidAssets();
        return;
      }
      buildField(sunRadius, usable);
    });

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
    const clock = new THREE.Clock();

    //Scratch objects for the asteroid matrices, reused every frame
    const spinStep = new THREE.Quaternion();
    const rockPos = new THREE.Vector3();
    const rockScale = new THREE.Vector3();
    const rockMatrix = new THREE.Matrix4();

    function animate() {
      const delta = Math.min(clock.getDelta(), 0.05); //stops a jump after a backgrounded tab
      const elapsed = clock.elapsedTime;
      scrollCurrent += (scrollTarget - scrollCurrent) * 0.07;

      if (sunMesh) {
        sunMesh.position.lerpVectors(SUN_START_POS, SUN_END_POS, scrollCurrent);
        sunMesh.scale.setScalar(THREE.MathUtils.lerp(SUN_START_SCALE, SUN_END_SCALE, scrollCurrent));
      }

      if (asteroidField) {
        asteroidField.position.lerpVectors(SUN_START_POS, SUN_END_POS, scrollCurrent);

        if (fieldFade < 1) {
          fieldFade = Math.min(1, fieldFade + delta / 1.4);
          const eased = fieldFade * fieldFade * (3 - 2 * fieldFade);
          asteroidMaterials.forEach((material) => {
            material.opacity = eased;
            if (fieldFade === 1) material.transparent = false; //back to the opaque pass
          });
        }

        asteroids.forEach((rock) => {
          rock.quaternion.multiply(spinStep.setFromAxisAngle(rock.spinAxis, rock.spinRate * delta));
          if (rock.tumbleAxis) {
            rock.quaternion.multiply(spinStep.setFromAxisAngle(rock.tumbleAxis, rock.tumbleRate * delta));
          }
          rockPos
            .copy(rock.base)
            .addScaledVector(rock.driftAxisA, Math.sin(elapsed * rock.driftFreqA + rock.driftPhase) * rock.driftA)
            .addScaledVector(rock.driftAxisB, Math.cos(elapsed * rock.driftFreqB + rock.driftPhase) * rock.driftB);
          rockScale.setScalar(rock.scale);
          rock.instanced.setMatrixAt(rock.index, rockMatrix.compose(rockPos, rock.quaternion, rockScale));
        });
        asteroidMeshes.forEach((mesh) => {
          mesh.instanceMatrix.needsUpdate = true;
        });
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
      disposed = true; // stops an in-flight load from populating a torn-down scene
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);

      video.pause();
      videoTexture.dispose();
      flareGeometry.dispose();
      flareMaterial.dispose();
      dracoLoader.dispose();

      asteroidMeshes.forEach((mesh) => mesh.dispose());
      asteroidMeshes.length = 0;
      asteroids.length = 0;
      disposeAsteroidAssets(); //the traverse below misses the shared textures

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
            color: `color-mix(in srgb, ${bodyColor} 55%, transparent)`,
            WebkitTextStrokeWidth: '0.2px',
            WebkitTextStrokeColor: titleColor,
            opacity: revealed ? 0 : 1,
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
