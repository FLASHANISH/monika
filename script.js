/* ═══════════════════════════════════════════════════════
   QUEEN MONIKA — 3D Royal Birthday Cinematic Experience
   Dedicated to Monika on 21 September | Created by Anish
   100% Procedural 3D Scene with Authentic Portrait Face Cameo,
   PBR Royal Materials, Wave Gown Physics, 4 Interactive Scenes,
   Romantic Synthesizer & Heartfelt Love Letter
   ═══════════════════════════════════════════════════════ */

// ── DOM ELEMENTS ──
const $ = id => document.getElementById(id);
const container          = $('webgl-container');
const entryScreen        = $('entry');
const enterBtn           = $('enterBtn');
const musicToggleBtn     = $('musicToggleBtn');
const musicLabel         = $('musicLabel');
const musicModal         = $('musicModal');
const closeMusicModalBtn   = $('closeMusicModalBtn');
const fullscreenBtn      = $('fullscreenBtn');
const sceneTag           = $('sceneTag');
const sceneTitle         = $('sceneTitle');
const storyPretitle      = $('storyPretitle');
const storyHeading       = $('storyHeading');
const storyBody          = $('storyBody');
const storyActions       = $('storyActions');
const interactionHint    = $('interactionHint');
const prevSceneBtn       = $('prevSceneBtn');
const nextSceneBtn       = $('nextSceneBtn');
const dockTabs           = [...document.querySelectorAll('.dock-tab')];
const letterModal        = $('letterModal');
const letterBackdrop     = $('letterBackdrop');
const closeLetterBtn     = $('closeLetterBtn');
const closeLetterBottomBtn = $('closeLetterBottomBtn');
const confettiLetterBtn  = $('confettiLetterBtn');
const turntableIndicator = $('turntableIndicator');
const angleControls      = $('angleControls');
const angleBtns          = [...document.querySelectorAll('.angle-btn')];

// ── STATE ──
let currentScene = 0;
let isStarted = false;
let isTransitioning = false;
let isDragging = false;
let prevPointer = { x: 0, y: 0 };
let rotTarget = 0;
let pitchTarget = 0;
let animTime = 0;
let candlesBlown = false;

// ── THREE.JS CORE ──
let scene, camera, renderer, clock;
let ambientLight, mainSpotLight, fillLight, rimLight, faceSpotLight;

// 3D Groups
let queenGroup;
let coronationGroup;
let runwayGroup;
let galaxyGroup;
let celebrationGroup;

// Animated elements
let crownMesh;
let gownSkirtMesh, gownOriginalPositions;
let facePortraitMesh, faceGlowMesh, faceFrameMesh;
let rosePetalsGroup;
let galaxyPhotoFrames = [];
let cakeCandles = [];
let floatingBalloons = [];
let fireworksList = [];

// Textures (All 6 beautiful photos of Monika)
const fullPhotoUrls = [
  'assets/monika-1.jpg',
  'assets/monika-2.jpg',
  'assets/monika-3.jpg',
  'assets/monika-4-upright.jpg',
  'assets/monika-5.png',
  'assets/monika-6.png'
];
const facePhotoUrls = [
  'assets/face-1.png',
  'assets/face-2.png',
  'assets/face-3.png',
  'assets/face-4.png',
  'assets/face-5.png',
  'assets/face-6.png'
];

let currentFaceIdx = 0;
let fullTextures = [];
let faceTextures = [];
let avatarStandingTexture = null;
let avatarStandingMesh = null;
let avatarRunwayTexture = null;
let runwayQueenGroup = null;
let runwayQueenMesh = null;
let runwayCakeCandleLight = null;
let hallChandelierLights = [];
let hallStardustParticles = null;
let currentCameraAngle = 'front';

// Camera angle configurations (matching all 6 view buttons)
const cameraAnglePositions = {
  front:        { pos: [0, 1.5, 3.8],    look: [0, 1.35, 0] },
  frontLeft45:  { pos: [-2.0, 1.5, 3.0], look: [0, 1.35, 0] },
  left:         { pos: [-3.0, 1.5, 0],   look: [0, 1.35, 0] },
  back45:       { pos: [-2.0, 1.5, -3.0],look: [0, 1.35, 0] },
  back:         { pos: [0, 1.6, -3.8],   look: [0, 1.35, 0] },
  right:        { pos: [2.6, 1.5, 2.2],  look: [0, 1.35, 0] }
};

// Audio
let audioCtx = null, masterGain = null, isMusicPlaying = false, synthTimer = null;

// Camera motion targets
let cameraTargetPos = new THREE.Vector3(0, 1.5, 3.8);
let cameraLookTarget = new THREE.Vector3(0, 1.35, 0);

// ══════════════════════════════════════════════════════
//  1. INITIALIZE THREE.JS & LOAD TEXTURES
// ══════════════════════════════════════════════════════
function init3D() {
  if (typeof THREE === 'undefined') {
    console.error('Three.js library is not available.');
    return;
  }

  clock = new THREE.Clock();

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060206, 0.035);
  scene.background = new THREE.Color(0x060206);

  // Camera with adaptive mobile FOV
  const isMobile = window.innerWidth < 768;
  const isPortrait = window.innerHeight > window.innerWidth;
  camera = new THREE.PerspectiveCamera((isMobile && isPortrait) ? 58 : 45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 4.4);
  camera.lookAt(cameraLookTarget);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  // ── LIGHTING SETUP ──
  ambientLight = new THREE.AmbientLight(0xffe8f0, 0.7);
  scene.add(ambientLight);

  mainSpotLight = new THREE.SpotLight(0xffecd0, 1.4);
  mainSpotLight.position.set(2, 6, 4);
  mainSpotLight.angle = Math.PI / 3.5;
  mainSpotLight.penumbra = 0.6;
  mainSpotLight.castShadow = true;
  scene.add(mainSpotLight);

  fillLight = new THREE.PointLight(0xa31d42, 2.0, 14);
  fillLight.position.set(-3, 2.5, 2.5);
  scene.add(fillLight);

  rimLight = new THREE.DirectionalLight(0xffd700, 1.3);
  rimLight.position.set(0, 4, -4);
  scene.add(rimLight);

  // Dedicated soft warm face fill light (gentle, natural skin tone)
  faceSpotLight = new THREE.SpotLight(0xfff0e6, 0.45);
  faceSpotLight.position.set(0, 3.2, 2.8);
  faceSpotLight.angle = Math.PI / 4.5;
  faceSpotLight.penumbra = 0.8;
  faceSpotLight.target.position.set(0, 2.65, 0);
  scene.add(faceSpotLight);
  scene.add(faceSpotLight.target);

  // Load textures
  loadTextures();

  // Build 3D environments
  buildStarfield();
  buildQueenModel();
  buildCoronationScene();
  buildRunwayScene();
  buildGalaxyScene();
  buildCelebrationScene();

  // Setup interactions & start rendering
  setupInteractions();
  animate();

  // ── HIDE LOADING SCREEN SO ENTRY BUTTON IS CLICKABLE ──
  const loadingScreen = $('loadingScreen');
  if (loadingScreen) {
    // Short delay so the 3D scene has rendered at least one frame
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      // Fully remove from DOM after transition ends
      setTimeout(() => {
        if (loadingScreen.parentNode) loadingScreen.parentNode.removeChild(loadingScreen);
      }, 900);
    }, 600);
  }

  console.log('Queen Monika 3D World successfully initialized!');
}

function loadTextures() {
  const loader = new THREE.TextureLoader();

  fullTextures = fullPhotoUrls.map((url, i) => {
    const tex = loader.load(url, undefined, undefined, () => {
      console.warn('Could not load full photo:', url);
    });
    tex.minFilter = THREE.LinearFilter;
    return tex;
  });

  faceTextures = facePhotoUrls.map((url, i) => {
    const tex = loader.load(url, () => {
      // Once loaded, update face material if active
      if (facePortraitMesh && i === 0) {
        facePortraitMesh.material.map = tex;
        facePortraitMesh.material.needsUpdate = true;
      }
    }, undefined, () => {
      console.warn('Could not load face photo:', url);
    });
    tex.minFilter = THREE.LinearFilter;
    return tex;
  });

  // Load standing full-body avatar
  avatarStandingTexture = loader.load('assets/avatar-standing-clean.png', (tex) => {
    tex.minFilter = THREE.LinearFilter;
    if (avatarStandingMesh) {
      avatarStandingMesh.material.map = tex;
      avatarStandingMesh.material.needsUpdate = true;
    }
  }, undefined, () => {
    console.warn('Could not load avatar-standing-clean.png');
  });

  // Load Queen Hall runway avatar (holding birthday cake in royal gold gown)
  avatarRunwayTexture = loader.load('assets/avatar-runway-queen.png', (tex) => {
    tex.minFilter = THREE.LinearFilter;
    if (runwayQueenMesh) {
      runwayQueenMesh.material.map = tex;
      runwayQueenMesh.material.needsUpdate = true;
    }
  }, undefined, () => {
    console.warn('Could not load avatar-runway-queen.png');
  });
}

// ══════════════════════════════════════════════════════
//  2. COSMIC STARFIELD
// ══════════════════════════════════════════════════════
function buildStarfield() {
  const count = 1400;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = 8 + Math.random() * 26;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const rnd = Math.random();
    if (rnd > 0.65) {
      colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.84; colors[i * 3 + 2] = 0.45; // Gold
    } else if (rnd > 0.35) {
      colors[i * 3] = 0.94; colors[i * 3 + 1] = 0.45; colors[i * 3 + 2] = 0.60; // Rose
    } else {
      colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0;  // Diamond
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.09,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  scene.add(new THREE.Points(geometry, material));
}

// ══════════════════════════════════════════════════════
//  3. QUEEN 3D AVATAR & ILLUMINATED 360° TURNTABLE
// ══════════════════════════════════════════════════════
function buildQueenModel() {
  queenGroup = new THREE.Group();
  queenGroup.position.set(0, 0, 0);

  // ── A. SLEEK CIRCULAR TURNTABLE PEDESTAL ──
  const pedestalGroup = new THREE.Group();

  // Dark obsidian cylindrical platform
  const pedestalGeo = new THREE.CylinderGeometry(1.62, 1.74, 0.16, 64);
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0x110812,
    roughness: 0.32,
    metalness: 0.72
  });
  const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestalMesh.position.set(0, 0.0, 0);
  pedestalMesh.receiveShadow = true;
  pedestalGroup.add(pedestalMesh);

  // Gold metallic bevel trim ring
  const goldBevel = new THREE.Mesh(
    new THREE.TorusGeometry(1.63, 0.022, 16, 64),
    new THREE.MeshStandardMaterial({
      color: 0xdfb76c,
      metalness: 0.94,
      roughness: 0.16
    })
  );
  goldBevel.rotation.x = Math.PI / 2;
  goldBevel.position.set(0, 0.065, 0);
  pedestalGroup.add(goldBevel);

  // Glowing LED neon edge ring (Matching user's concept render)
  const neonGeo = new THREE.TorusGeometry(1.65, 0.028, 16, 64);
  neonGeo.rotateX(Math.PI / 2);
  const neonMat = new THREE.MeshStandardMaterial({
    color: 0xffe29a,
    emissive: 0xffd152,
    emissiveIntensity: 2.6,
    roughness: 0.2
  });
  const neonRing = new THREE.Mesh(neonGeo, neonMat);
  neonRing.position.set(0, 0.08, 0);
  pedestalGroup.add(neonRing);

  // Turntable top reflective metallic plate
  const topDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.58, 48),
    new THREE.MeshStandardMaterial({
      color: 0x1a0816,
      metalness: 0.88,
      roughness: 0.2
    })
  );
  topDisc.rotation.x = -Math.PI / 2;
  topDisc.position.set(0, 0.081, 0);
  topDisc.receiveShadow = true;
  pedestalGroup.add(topDisc);

  // Soft contact shadow directly beneath Monika's feet
  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 32),
    new THREE.MeshBasicMaterial({
      color: 0x050105,
      transparent: true,
      opacity: 0.65
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.set(0, 0.083, 0);
  pedestalGroup.add(contactShadow);

  // Floor ambient reflection pool
  const floorPool = new THREE.Mesh(
    new THREE.CircleGeometry(2.35, 48),
    new THREE.MeshBasicMaterial({
      color: 0xa31d42,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    })
  );
  floorPool.rotation.x = -Math.PI / 2;
  floorPool.position.set(0, -0.09, 0);
  pedestalGroup.add(floorPool);

  queenGroup.add(pedestalGroup);

  // ── B. MONIKA 3D AVATAR (FROM CONCEPT RENDER) ──
  // Standing avatar plane with gentle cylindrical curvature for 3D depth
  const avatarGeo = new THREE.PlaneGeometry(1.45, 2.90, 24, 1);
  const pos = avatarGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    // Subtle curved relief so it catches specular spotlights in 3D
    pos.setZ(i, -0.05 * (1 - Math.pow(x / 0.725, 2)));
  }
  avatarGeo.computeVertexNormals();

  const avatarMat = new THREE.MeshStandardMaterial({
    map: avatarStandingTexture || null,
    transparent: true,
    alphaTest: 0.04,
    side: THREE.DoubleSide,
    roughness: 0.88,
    metalness: 0.0
  });

  avatarStandingMesh = new THREE.Mesh(avatarGeo, avatarMat);
  avatarStandingMesh.position.set(0, 1.53, 0);
  avatarStandingMesh.castShadow = true;
  avatarStandingMesh.receiveShadow = true;
  queenGroup.add(avatarStandingMesh);

  // ── C. HALO & AURA GLOW BEHIND MONIKA (Soft & subtle, non-intrusive) ──
  faceGlowMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 36),
    new THREE.MeshBasicMaterial({
      color: 0xdfb76c,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide
    })
  );
  faceGlowMesh.position.set(0, 2.52, -0.06);
  queenGroup.add(faceGlowMesh);

  const roseAura = new THREE.Mesh(
    new THREE.CircleGeometry(0.72, 36),
    new THREE.MeshBasicMaterial({
      color: 0xa31d42,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide
    })
  );
  roseAura.position.set(0, 2.50, -0.08);
  queenGroup.add(roseAura);

  // ── D. FLOATING ROYAL CAMEO LOCKET (FOR CYCLING REAL CLOSE-UP PHOTOS) ──
  buildFacePortrait();

  // ── E. 3D GOLDEN ROYAL CROWN ──
  crownMesh = buildRoyalCrown();
  crownMesh.position.set(0, 2.96, 0);
  queenGroup.add(crownMesh);

  // ── F. SWIRLING ROYAL STARDUST PARTICLES ──
  const sparkleCount = 90;
  const sparkleGeo = new THREE.BufferGeometry();
  const sparklePos = new Float32Array(sparkleCount * 3);
  const sparkleColors = new Float32Array(sparkleCount * 3);
  for (let i = 0; i < sparkleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 0.4 + Math.random() * 1.1;
    sparklePos[i * 3]     = Math.cos(angle) * rad;
    sparklePos[i * 3 + 1] = 0.2 + Math.random() * 2.8;
    sparklePos[i * 3 + 2] = Math.sin(angle) * rad;

    if (Math.random() > 0.5) {
      sparkleColors[i * 3] = 1.0; sparkleColors[i * 3 + 1] = 0.85; sparkleColors[i * 3 + 2] = 0.35;
    } else {
      sparkleColors[i * 3] = 1.0; sparkleColors[i * 3 + 1] = 0.45; sparkleColors[i * 3 + 2] = 0.65;
    }
  }
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
  sparkleGeo.setAttribute('color', new THREE.BufferAttribute(sparkleColors, 3));
  const sparkleMat = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });
  const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
  queenGroup.add(sparkles);

  scene.add(queenGroup);
}

// ── MONIKA'S AUTHENTIC FACE PORTRAIT MEDALLION ──
function buildFacePortrait() {
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0.92, 2.45, 0.12);
  faceGroup.scale.set(0.72, 0.72, 0.72);

  // Warm golden aura disc (subtle rim)
  const medallionGlow = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 36),
    new THREE.MeshBasicMaterial({
      color: 0xdfb76c,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    })
  );
  medallionGlow.position.set(0, 0, -0.04);
  faceGroup.add(medallionGlow);

  // Secondary crimson aura
  const roseGlow = new THREE.Mesh(
    new THREE.CircleGeometry(0.58, 36),
    new THREE.MeshBasicMaterial({
      color: 0xa31d42,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide
    })
  );
  roseGlow.position.set(0, 0, -0.06);
  faceGroup.add(roseGlow);

  // Close-up photo of Monika
  const portraitGeo = new THREE.CircleGeometry(0.33, 48);
  const portraitMat = new THREE.MeshBasicMaterial({
    map: faceTextures[0] || null,
    transparent: true,
    side: THREE.FrontSide
  });
  facePortraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
  facePortraitMesh.position.set(0, 0, 0.02);
  faceGroup.add(facePortraitMesh);

  // Ornate golden bezel frame
  faceFrameMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.026, 16, 48),
    new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.12
    })
  );
  faceFrameMesh.position.set(0, 0, 0.03);
  faceGroup.add(faceFrameMesh);

  // Crown jewels on frame
  const jewelMat = new THREE.MeshStandardMaterial({
    color: 0xe0f7fa,
    emissive: 0x80deea,
    roughness: 0.05,
    metalness: 0.95
  });
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.018, 0), jewelMat);
    sparkle.position.set(Math.cos(angle) * 0.34, Math.sin(angle) * 0.34, 0.04);
    faceGroup.add(sparkle);
  }

  // Mini crown on top of the cameo
  const miniCrown = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.10, 5),
    new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.15 })
  );
  miniCrown.position.set(0, 0.39, 0.03);
  faceGroup.add(miniCrown);

  queenGroup.add(faceGroup);
}

function updateFacePhoto(index) {
  currentFaceIdx = index % faceTextures.length;
  if (facePortraitMesh && faceTextures[currentFaceIdx]) {
    facePortraitMesh.material.map = faceTextures[currentFaceIdx];
    facePortraitMesh.material.needsUpdate = true;
  }
}

function cycleFacePhoto() {
  currentFaceIdx = (currentFaceIdx + 1) % faceTextures.length;
  updateFacePhoto(currentFaceIdx);
  triggerConfetti();
}

// ── 3D GOLDEN CROWN ──
function buildRoyalCrown() {
  const crown = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.15 });
  const rubyMat = new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0x990022, roughness: 0.1, metalness: 0.9 });
  const diaMat  = new THREE.MeshStandardMaterial({ color: 0xe0f7fa, emissive: 0x80deea, roughness: 0.05, metalness: 0.95 });

  // Base band
  const baseBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.19, 0.04, 32, 1, true),
    goldMat
  );
  crown.add(baseBand);

  // 7 crown spikes with ruby/diamond tips
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const radius = 0.185;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const isCenter = (i === 0);
    const height = isCenter ? 0.16 : (i % 2 === 0 ? 0.12 : 0.08);

    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.026, height, 8), goldMat);
    spike.position.set(x, height / 2 + 0.02, z);
    crown.add(spike);

    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(isCenter ? 0.030 : 0.018, 0),
      isCenter ? rubyMat : diaMat
    );
    gem.position.set(x, height + 0.035, z);
    crown.add(gem);
  }

  // Subtle golden jewel glint on crown (non-blinding)
  const crownLight = new THREE.PointLight(0xffd700, 0.22, 1.2);
  crownLight.position.set(0, 0.16, 0);
  crown.add(crownLight);

  return crown;
}

// ══════════════════════════════════════════════════════
//  4. SCENE 1: CORONATION PALACE
// ══════════════════════════════════════════════════════
function buildCoronationScene() {
  coronationGroup = new THREE.Group();

  // Royal marble pedestal
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.8, 0.28, 48),
    new THREE.MeshStandardMaterial({ color: 0x12040b, metalness: 0.5, roughness: 0.35 })
  );
  pedestal.position.set(0, -0.14, 0);
  pedestal.receiveShadow = true;
  coronationGroup.add(pedestal);

  // Gold ring on pedestal
  const goldRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.85, 0.03, 16, 64),
    new THREE.MeshStandardMaterial({ color: 0xdfb76c, metalness: 0.9, roughness: 0.15, emissive: 0x553800 })
  );
  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.set(0, -0.01, 0);
  coronationGroup.add(goldRing);

  // Crimson outer ring
  const crimsonRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.025, 16, 64),
    new THREE.MeshStandardMaterial({ color: 0xa31d42, metalness: 0.8, roughness: 0.2, emissive: 0x440011 })
  );
  crimsonRing.rotation.x = Math.PI / 2;
  crimsonRing.position.set(0, -0.1, 0);
  coronationGroup.add(crimsonRing);

  // 3D Rose Petals Shower
  buildRosePetals();

  scene.add(coronationGroup);
}

function buildRosePetals() {
  rosePetalsGroup = new THREE.Group();
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.bezierCurveTo(0.06, 0.05, 0.08, 0.14, 0, 0.22);
  petalShape.bezierCurveTo(-0.08, 0.14, -0.06, 0.05, 0, 0);

  const petalGeo = new THREE.ShapeGeometry(petalShape);
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xb71239,
    roughness: 0.45,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < 90; i++) {
    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(
      (Math.random() - 0.5) * 6,
      Math.random() * 5 + 0.5,
      (Math.random() - 0.5) * 6
    );
    petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    petal.userData = {
      speedY: 0.008 + Math.random() * 0.015,
      rotX: (Math.random() - 0.5) * 0.03,
      rotY: (Math.random() - 0.5) * 0.03,
      wobble: 1 + Math.random() * 2
    };
    rosePetalsGroup.add(petal);
  }

  coronationGroup.add(rosePetalsGroup);
}

// ══════════════════════════════════════════════════════
//  5. SCENE 2: THE GRAND QUEEN HALL & RUNWAY (DARBAR)
// ══════════════════════════════════════════════════════
function buildRunwayScene() {
  runwayGroup = new THREE.Group();
  runwayGroup.visible = false;

  // ── A. PALATIAL POLISHED OBSIDIAN & GOLD MARBLE FLOOR ──
  const hallFloorGeo = new THREE.PlaneGeometry(16, 26);
  const hallFloorMat = new THREE.MeshStandardMaterial({
    color: 0x0a0208,
    roughness: 0.12,
    metalness: 0.82,
    side: THREE.DoubleSide
  });
  const hallFloor = new THREE.Mesh(hallFloorGeo, hallFloorMat);
  hallFloor.rotation.x = -Math.PI / 2;
  hallFloor.position.set(0, -0.05, 1);
  hallFloor.receiveShadow = true;
  runwayGroup.add(hallFloor);

  // Gold inlay strip dividers along the palace floor
  const floorInlayMat = new THREE.MeshStandardMaterial({
    color: 0xdfb76c,
    metalness: 0.92,
    roughness: 0.18
  });
  [-4.6, -2.4, 2.4, 4.6].forEach(x => {
    const inlay = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 24), floorInlayMat);
    inlay.position.set(x, -0.04, 1);
    runwayGroup.add(inlay);
  });

  // ── B. GRAND VELVET CRIMSON & GOLD RUNWAY CARPET ──
  const carpetMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.05, 20),
    new THREE.MeshStandardMaterial({
      color: 0x7c0c24,
      roughness: 0.82,
      metalness: 0.15
    })
  );
  carpetMesh.position.set(0, -0.02, 1);
  carpetMesh.receiveShadow = true;
  runwayGroup.add(carpetMesh);

  // Embroidered Gold Borders on both carpet edges
  const carpetGoldMat = new THREE.MeshStandardMaterial({
    color: 0xf7e1a0,
    emissive: 0x6b4f12,
    emissiveIntensity: 0.28,
    metalness: 0.88,
    roughness: 0.22
  });
  [-1.34, 1.34].forEach(x => {
    const border = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 20), carpetGoldMat);
    border.position.set(x, -0.01, 1);
    runwayGroup.add(border);
  });

  // ── C. GRAND COLONNADE: 10 MARBLE & GOLD PALACE COLUMNS WITH CANDELABRAS ──
  const zPositions = [-6.5, -3.5, -0.5, 2.5, 5.5];
  const colX = 3.6;

  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0x1f0916,
    roughness: 0.35,
    metalness: 0.4
  });
  const goldPillarMat = new THREE.MeshStandardMaterial({
    color: 0xdfb76c,
    metalness: 0.88,
    roughness: 0.22
  });

  zPositions.forEach(z => {
    [-colX, colX].forEach(x => {
      const colGroup = new THREE.Group();
      colGroup.position.set(x, 0, z);

      // Stepped square gold base
      const base1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.25, 0.85), goldPillarMat);
      base1.position.y = 0.125;
      colGroup.add(base1);

      const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.44, 0.2, 24), goldPillarMat);
      base2.position.y = 0.32;
      colGroup.add(base2);

      // Fluted marble pillar shaft
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.33, 4.4, 24), marbleMat);
      shaft.position.y = 2.52;
      shaft.castShadow = true;
      colGroup.add(shaft);

      // Gold decorative rings on pillar
      [1.4, 2.7, 4.0].forEach(ringY => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.035, 12, 24), goldPillarMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = ringY;
        colGroup.add(ring);
      });

      // Corinthian / Roman Gold Capital
      const capital = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.31, 0.45, 24), goldPillarMat);
      capital.position.y = 4.85;
      colGroup.add(capital);

      const abacus = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.18, 0.95), goldPillarMat);
      abacus.position.y = 5.12;
      colGroup.add(abacus);

      // Wall Candelabra Sconce on pillar facing aisle
      const sconceArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.42),
        goldPillarMat
      );
      sconceArm.rotation.z = (x < 0 ? 1 : -1) * (Math.PI / 3.2);
      sconceArm.position.set(x < 0 ? 0.3 : -0.3, 2.3, 0);
      colGroup.add(sconceArm);

      const sconceDish = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.04, 0.06, 16), goldPillarMat);
      sconceDish.position.set(x < 0 ? 0.44 : -0.44, 2.44, 0);
      colGroup.add(sconceDish);

      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.22, 12),
        new THREE.MeshStandardMaterial({ color: 0xfff3e0, roughness: 0.4 })
      );
      candle.position.set(x < 0 ? 0.44 : -0.44, 2.57, 0);
      colGroup.add(candle);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.035, 0.1, 10),
        new THREE.MeshBasicMaterial({ color: 0xffcc33 })
      );
      flame.position.set(x < 0 ? 0.44 : -0.44, 2.73, 0);
      colGroup.add(flame);

      // Soft flickering candle light on column
      const candleLight = new THREE.PointLight(0xffaa33, 0.45, 4.0);
      candleLight.position.set(x < 0 ? 0.5 : -0.5, 2.8, 0);
      colGroup.add(candleLight);

      runwayGroup.add(colGroup);
    });

    // ── D. GRAND OVERHEAD ROMAN ARCH ACROSS EACH PAIR ──
    const archCurve = new THREE.EllipseCurve(0, 0, colX, 2.2, 0, Math.PI, false, 0);
    const archPts = archCurve.getPoints(36);
    const archGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(archPts.map(p => new THREE.Vector3(p.x, p.y + 3.0, z))),
      30, 0.12, 10, false
    );
    const archMesh = new THREE.Mesh(archGeo, goldPillarMat);
    runwayGroup.add(archMesh);

    // Arch keystone crown medallion
    const crownKeystone = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0x996515,
        emissiveIntensity: 0.5,
        metalness: 0.95
      })
    );
    crownKeystone.position.set(0, 5.25, z);
    runwayGroup.add(crownKeystone);
  });

  // ── E. MULTI-TIER ROYAL CRYSTAL CHANDELIERS ──
  const chandelierZ = [-4.0, 0.5, 5.0];
  hallChandelierLights = [];
  chandelierZ.forEach(cz => {
    const chGroup = new THREE.Group();
    chGroup.position.set(0, 4.3, cz);

    // Hanging gold chain rod
    const chain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 1.2),
      goldPillarMat
    );
    chain.position.y = 0.6;
    chGroup.add(chain);

    // Concentric gold chandelier hoops
    const hoop1 = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.035, 12, 36), goldPillarMat);
    hoop1.rotation.x = Math.PI / 2;
    chGroup.add(hoop1);

    const hoop2 = new THREE.Mesh(new THREE.TorusGeometry(0.50, 0.03, 12, 32), goldPillarMat);
    hoop2.rotation.x = Math.PI / 2;
    hoop2.position.y = -0.3;
    chGroup.add(hoop2);

    // Crystal drop pendants
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xe0f7fa,
      emissive: 0x18ffff,
      emissiveIntensity: 0.25,
      metalness: 0.92,
      roughness: 0.08,
      transparent: true,
      opacity: 0.88
    });

    const numCrystals = 14;
    for (let c = 0; c < numCrystals; c++) {
      const angle = (c / numCrystals) * Math.PI * 2;
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), crystalMat);
      crystal.position.set(Math.cos(angle) * 0.85, -0.15, Math.sin(angle) * 0.85);
      crystal.scale.set(0.8, 1.6, 0.8);
      chGroup.add(crystal);
    }

    // Chandelier warm illumination
    const chLight = new THREE.PointLight(0xffe6a8, 1.1, 9.0);
    chLight.position.set(0, -0.2, 0);
    chGroup.add(chLight);
    hallChandelierLights.push(chLight);

    runwayGroup.add(chGroup);
  });

  // ── F. GRAND THRONE DAIS & PALACE BACKDROP (AT END OF HALL) ──
  const throneGroup = new THREE.Group();
  throneGroup.position.set(0, 0, -8.2);

  // 3-Tier Dais Steps
  const stepMat = new THREE.MeshStandardMaterial({ color: 0x140510, metalness: 0.6, roughness: 0.3 });
  const stepGoldMat = new THREE.MeshStandardMaterial({ color: 0xdfb76c, metalness: 0.88, roughness: 0.22 });

  const s1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.16, 2.6), stepMat);
  s1.position.y = 0.08;
  throneGroup.add(s1);

  const s2 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 2.0), stepMat);
  s2.position.y = 0.24;
  throneGroup.add(s2);

  const s3 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.16, 1.4), stepMat);
  s3.position.y = 0.40;
  throneGroup.add(s3);

  // Red velvet carpet on steps
  const daisCarpet = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.42, 2.7),
    new THREE.MeshStandardMaterial({ color: 0x8a0f28, roughness: 0.8 })
  );
  daisCarpet.position.set(0, 0.21, 0);
  throneGroup.add(daisCarpet);

  // Queen's Golden Throne
  const throneSeat = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.2, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x8a0f28, roughness: 0.7 })
  );
  throneSeat.position.set(0, 0.65, -0.1);
  throneGroup.add(throneSeat);

  const throneBack = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.6, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x6e091e, roughness: 0.65 })
  );
  throneBack.position.set(0, 1.45, -0.5);
  throneGroup.add(throneBack);

  // Ornate Gold Frame of Throne
  const throneFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 1.8, 0.12),
    stepGoldMat
  );
  throneFrame.position.set(0, 1.5, -0.56);
  throneGroup.add(throneFrame);

  // Crown Crest on Throne Peak
  const throneCrown = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.42, 5),
    stepGoldMat
  );
  throneCrown.position.set(0, 2.5, -0.56);
  throneGroup.add(throneCrown);

  // Royal Velvet Drapery Curtains behind throne
  const curtainMat = new THREE.MeshStandardMaterial({
    color: 0x5a081a,
    roughness: 0.75,
    side: THREE.DoubleSide
  });
  [-2.2, 2.2].forEach(cx => {
    const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.75, 4.8, 16, 1, true), curtainMat);
    drape.scale.set(0.6, 1, 1);
    drape.position.set(cx, 2.4, -0.8);
    throneGroup.add(drape);
  });

  // Stained Glass Palace Rose Window behind throne
  const roseWinGeo = new THREE.CircleGeometry(2.0, 36);
  const roseWinMat = new THREE.MeshBasicMaterial({
    color: 0xffd180,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });
  const roseWin = new THREE.Mesh(roseWinGeo, roseWinMat);
  roseWin.position.set(0, 3.2, -1.2);
  throneGroup.add(roseWin);

  const winBacklight = new THREE.PointLight(0xff80ab, 1.2, 8);
  winBacklight.position.set(0, 3.2, -0.8);
  throneGroup.add(winBacklight);

  runwayGroup.add(throneGroup);

  // ── G. THE NEW QUEEN MONIKA AVATAR (HOLDING BIRTHDAY CAKE) ──
  runwayQueenGroup = new THREE.Group();
  runwayQueenGroup.position.set(0, 0, 0.6);

  // Ornate Turntable Base for Queen Monika
  const rPedestalGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.14, 48);
  const rPedestalMat = new THREE.MeshStandardMaterial({
    color: 0x140510,
    metalness: 0.85,
    roughness: 0.22
  });
  const rPedestal = new THREE.Mesh(rPedestalGeo, rPedestalMat);
  rPedestal.position.y = 0.07;
  rPedestal.receiveShadow = true;
  runwayQueenGroup.add(rPedestal);

  // Glowing LED neon edge ring
  const rNeon = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.026, 16, 64),
    new THREE.MeshStandardMaterial({
      color: 0xffe29a,
      emissive: 0xffd152,
      emissiveIntensity: 2.8,
      roughness: 0.2
    })
  );
  rNeon.rotation.x = Math.PI / 2;
  rNeon.position.y = 0.08;
  runwayQueenGroup.add(rNeon);

  // Curved 3D avatar plane for realistic depth under palace spotlights
  const rAvatarGeo = new THREE.PlaneGeometry(1.55, 2.90, 24, 1);
  const rPos = rAvatarGeo.attributes.position;
  for (let i = 0; i < rPos.count; i++) {
    const x = rPos.getX(i);
    rPos.setZ(i, -0.05 * (1 - Math.pow(x / 0.775, 2)));
  }
  rAvatarGeo.computeVertexNormals();

  const rAvatarMat = new THREE.MeshStandardMaterial({
    map: avatarRunwayTexture || null,
    transparent: true,
    alphaTest: 0.05,
    side: THREE.DoubleSide,
    roughness: 0.88,
    metalness: 0.0
  });

  runwayQueenMesh = new THREE.Mesh(rAvatarGeo, rAvatarMat);
  runwayQueenMesh.position.set(0, 1.52, 0);
  runwayQueenMesh.castShadow = true;
  runwayQueenMesh.receiveShadow = true;
  runwayQueenGroup.add(runwayQueenMesh);

  // Subtle Queen Halo behind head (gentle, soft)
  const rFaceGlow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 36),
    new THREE.MeshBasicMaterial({
      color: 0xdfb76c,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide
    })
  );
  rFaceGlow.position.set(0, 2.50, -0.06);
  runwayQueenGroup.add(rFaceGlow);

  const rRoseAura = new THREE.Mesh(
    new THREE.CircleGeometry(0.72, 36),
    new THREE.MeshBasicMaterial({
      color: 0xa31d42,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide
    })
  );
  rRoseAura.position.set(0, 2.48, -0.08);
  runwayQueenGroup.add(rRoseAura);

  // REALISTIC BIRTHDAY CAKE CANDLE LIGHT (in Monika's hands!)
  runwayCakeCandleLight = new THREE.PointLight(0xffa726, 0.85, 2.4);
  runwayCakeCandleLight.position.set(0.32, 1.84, 0.18);
  runwayQueenGroup.add(runwayCakeCandleLight);

  // Floating Golden Stardust around Queen Monika
  const sparkleCount = 80;
  const sparkleGeo = new THREE.BufferGeometry();
  const sparklePos = new Float32Array(sparkleCount * 3);
  const sparkleColors = new Float32Array(sparkleCount * 3);
  for (let i = 0; i < sparkleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 0.4 + Math.random() * 1.2;
    sparklePos[i * 3]     = Math.cos(angle) * rad;
    sparklePos[i * 3 + 1] = 0.2 + Math.random() * 2.8;
    sparklePos[i * 3 + 2] = Math.sin(angle) * rad;

    if (Math.random() > 0.5) {
      sparkleColors[i * 3] = 1.0; sparkleColors[i * 3 + 1] = 0.88; sparkleColors[i * 3 + 2] = 0.38;
    } else {
      sparkleColors[i * 3] = 1.0; sparkleColors[i * 3 + 1] = 0.45; sparkleColors[i * 3 + 2] = 0.65;
    }
  }
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
  sparkleGeo.setAttribute('color', new THREE.BufferAttribute(sparkleColors, 3));
  hallStardustParticles = new THREE.Points(sparkleGeo, new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  }));
  runwayQueenGroup.add(hallStardustParticles);

  runwayGroup.add(runwayQueenGroup);

  // Overhead Palace Spotlight directly on Queen Monika (soft atmospheric beam)
  const hallSpot = new THREE.SpotLight(0xfff5e6, 1.15, 14, Math.PI / 5, 0.55, 1);
  hallSpot.position.set(0, 6.5, 3.5);
  hallSpot.target = runwayQueenGroup;
  runwayGroup.add(hallSpot);

  scene.add(runwayGroup);
}

// ══════════════════════════════════════════════════════
//  6. SCENE 3: MEMORY GALAXY (ORBITING PHOTOS)
// ══════════════════════════════════════════════════════
function buildGalaxyScene() {
  galaxyGroup = new THREE.Group();
  galaxyGroup.visible = false;

  // Central crystal glowing heart
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0.4);
  heartShape.bezierCurveTo(0, 0.7, -0.4, 0.7, -0.4, 0.4);
  heartShape.bezierCurveTo(-0.4, 0.1, 0, -0.3, 0, -0.5);
  heartShape.bezierCurveTo(0, -0.3, 0.4, 0.1, 0.4, 0.4);
  heartShape.bezierCurveTo(0.4, 0.7, 0, 0.7, 0, 0.4);

  const heartMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.25,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08
    }),
    new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0x990022,
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.15
    })
  );
  heartMesh.position.set(0, 1.8, 0);
  heartMesh.scale.set(0.7, 0.7, 0.7);
  galaxyGroup.add(heartMesh);

  // Orbiting photo frames for all 6 Monika photos
  galaxyPhotoFrames = [];
  const radius = 2.8;
  const totalPhotos = fullPhotoUrls.length;

  for (let i = 0; i < totalPhotos; i++) {
    const angle = (i / totalPhotos) * Math.PI * 2;
    const frameGroup = new THREE.Group();
    frameGroup.position.set(Math.cos(angle) * radius, 1.7, Math.sin(angle) * radius);
    frameGroup.lookAt(0, 1.7, 0);

    // Golden frame border
    const border = new THREE.Mesh(
      new THREE.BoxGeometry(1.10, 1.50, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xdfb76c, metalness: 0.92, roughness: 0.18 })
    );
    frameGroup.add(border);

    // Photo plane
    const photoPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.98, 1.38),
      new THREE.MeshBasicMaterial({
        map: fullTextures[i] || null,
        side: THREE.FrontSide
      })
    );
    photoPlane.position.set(0, 0, 0.035);
    frameGroup.add(photoPlane);

    // Halo light for each frame
    const frameLight = new THREE.PointLight(0xffd700, 0.85, 2.5);
    frameLight.position.set(0, 0, 0.2);
    frameGroup.add(frameLight);

    galaxyGroup.add(frameGroup);
    galaxyPhotoFrames.push(frameGroup);
  }

  scene.add(galaxyGroup);
}

// ══════════════════════════════════════════════════════
//  7. SCENE 4: BIRTHDAY CAKE & CANDLES
// ══════════════════════════════════════════════════════
function buildCelebrationScene() {
  celebrationGroup = new THREE.Group();
  celebrationGroup.visible = false;

  // Table
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.6, 0.2, 40),
    new THREE.MeshStandardMaterial({ color: 0x1a0610, metalness: 0.6, roughness: 0.3 })
  );
  table.position.set(0, 0.5, 0);
  celebrationGroup.add(table);

  // Multi-tier royal cake
  const cake = new THREE.Group();
  cake.position.set(0, 0.6, 0);

  // Tier 1 (Vanilla & Strawberry)
  const tier1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 0.45, 36),
    new THREE.MeshStandardMaterial({ color: 0xfae8e0, roughness: 0.4 })
  );
  tier1.position.set(0, 0.225, 0);
  cake.add(tier1);

  const t1Border = new THREE.Mesh(
    new THREE.TorusGeometry(0.86, 0.03, 16, 40),
    new THREE.MeshStandardMaterial({ color: 0xdfb76c, metalness: 0.85, roughness: 0.2 })
  );
  t1Border.rotation.x = Math.PI / 2;
  t1Border.position.set(0, 0.44, 0);
  cake.add(t1Border);

  // Tier 2 (Crimson Velvet)
  const tier2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.58, 0.40, 32),
    new THREE.MeshStandardMaterial({ color: 0x8a1232, roughness: 0.35 })
  );
  tier2.position.set(0, 0.65, 0);
  cake.add(tier2);

  // Tier 3 (Golden Cream)
  const tier3 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.35, 28),
    new THREE.MeshStandardMaterial({ color: 0xfbf2d8, roughness: 0.38 })
  );
  tier3.position.set(0, 1.025, 0);
  cake.add(tier3);

  // Plaque: "QUEEN MONIKA — Happy Birthday 21 Sep"
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 512; plaqueCanvas.height = 160;
  const pCtx = plaqueCanvas.getContext('2d');
  pCtx.fillStyle = '#1c0510';
  pCtx.fillRect(0, 0, 512, 160);
  pCtx.strokeStyle = '#dfb76c';
  pCtx.lineWidth = 8;
  pCtx.strokeRect(8, 8, 496, 144);
  pCtx.font = 'bold 36px serif';
  pCtx.fillStyle = '#ffd700';
  pCtx.textAlign = 'center';
  pCtx.fillText('QUEEN MONIKA', 256, 68);
  pCtx.font = '24px sans-serif';
  pCtx.fillStyle = '#ffffff';
  pCtx.fillText('Happy Birthday \u2022 21 Sep', 256, 115);

  const plaqueMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.50, 0.16),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(plaqueCanvas) })
  );
  plaqueMesh.position.set(0, 0.65, 0.59);
  cake.add(plaqueMesh);

  // 5 Candles with flickering flames
  cakeCandles = [];
  const candlePositions = [
    { x: 0, z: 0 },
    { x: -0.15, z: 0.12 },
    { x: 0.15, z: 0.12 },
    { x: -0.15, z: -0.12 },
    { x: 0.15, z: -0.12 }
  ];

  candlePositions.forEach(p => {
    const candleStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.3 })
    );
    candleStick.position.set(p.x, 1.30, p.z);
    cake.add(candleStick);

    const flameGeo = new THREE.SphereGeometry(0.028, 12, 12);
    flameGeo.scale(0.8, 1.8, 0.8);
    const flameMesh = new THREE.Mesh(flameGeo, new THREE.MeshBasicMaterial({ color: 0xffa500 }));
    flameMesh.position.set(p.x, 1.44, p.z);
    cake.add(flameMesh);

    const candleLight = new THREE.PointLight(0xffaa22, 0.85, 1.5);
    candleLight.position.set(p.x, 1.46, p.z);
    cake.add(candleLight);

    cakeCandles.push({ flame: flameMesh, light: candleLight });
  });

  celebrationGroup.add(cake);
  scene.add(celebrationGroup);
}

// ══════════════════════════════════════════════════════
//  8. CELEBRATION INTERACTIONS (BLOW CANDLES, FIREWORKS)
// ══════════════════════════════════════════════════════
function blowCandlesAndCelebrate() {
  if (candlesBlown) {
    launchFirework();
    triggerConfetti();
    return;
  }
  candlesBlown = true;

  cakeCandles.forEach(c => {
    c.flame.visible = false;
    c.light.intensity = 0;
  });

  launchFirework();
  launchFirework();
  triggerConfetti();
  spawnBalloons();

  storyPretitle.textContent = 'The candles are blown... and your wishes take flight!';
  storyHeading.textContent = 'Happy Birthday, Queen Monika!';
  storyBody.innerHTML = 'May every tear turn into a diamond, every sadness into endless joy, and may you reign happy and free forever. Happy Birthday to the queen of my heart.';

  storyActions.innerHTML = '';
  const letterBtn = document.createElement('button');
  letterBtn.className = 'story-action-btn gold-btn';
  letterBtn.textContent = '\uD83D\uDC8C Read Anish\'s Love Letter';
  letterBtn.addEventListener('click', openLetter);
  storyActions.appendChild(letterBtn);

  const fwBtn = document.createElement('button');
  fwBtn.className = 'story-action-btn';
  fwBtn.textContent = '\uD83C\uDF86 More Fireworks!';
  fwBtn.addEventListener('click', () => { launchFirework(); triggerConfetti(); });
  storyActions.appendChild(fwBtn);
}

function launchFirework() {
  const count = 300;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const velocities = [];
  const origin = new THREE.Vector3((Math.random() - 0.5) * 3, 2.5 + Math.random() * 2, (Math.random() - 0.5) * 2);
  const hue = Math.random();

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = origin.x;
    positions[i * 3 + 1] = origin.y;
    positions[i * 3 + 2] = origin.z;

    const speed = 0.05 + Math.random() * 0.12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    velocities.push({
      x: speed * Math.sin(phi) * Math.cos(theta),
      y: speed * Math.sin(phi) * Math.sin(theta),
      z: speed * Math.cos(phi)
    });

    if (hue > 0.6) {
      colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.3;
    } else if (hue > 0.3) {
      colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.15; colors[i * 3 + 2] = 0.45;
    } else {
      colors[i * 3] = 0.3; colors[i * 3 + 1] = 0.90; colors[i * 3 + 2] = 1.0;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const points = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending
  }));
  scene.add(points);
  fireworksList.push({ mesh: points, velocities, life: 1.0, decay: 0.015 + Math.random() * 0.01 });
}

function spawnBalloons() {
  const mat = new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.25, metalness: 0.5 });
  for (let i = 0; i < 14; i++) {
    const geo = new THREE.SphereGeometry(0.2, 16, 16);
    geo.scale(1, 1.2, 0.8);
    const balloon = new THREE.Mesh(geo, mat);
    balloon.position.set((Math.random() - 0.5) * 4, 0.5 + Math.random() * 0.5, (Math.random() - 0.5) * 3);
    balloon.userData = { speedY: 0.02 + Math.random() * 0.02, wobble: Math.random() * 2 };
    celebrationGroup.add(balloon);
    floatingBalloons.push(balloon);
  }
}

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#ff1744', '#ff80ab', '#ffffff', '#e040fb']
    });
  }
}

// ══════════════════════════════════════════════════════
//  9. SCENE SWITCHING (4 SCENES — ALL ENGLISH)
// ══════════════════════════════════════════════════════
const sceneDetails = [
  {
    tag: 'Scene 1 / 4',
    title: 'The Royal Coronation',
    pretitle: 'For the most beautiful soul in the universe',
    heading: 'The Queen of the Universe \u2014 Monika',
    body: '21st September \u2014 Today is the day the most beautiful soul was born. Monika, you cannot be sad today, because today is the birthday of the queen of the universe.',
    actions: [
      { text: '\uD83D\uDC51 Place the Crown', action: 'crown' },
      { text: '\uD83C\uDF39 Rose Shower', action: 'roses' },
      { text: '\u2728 Next Face Photo', action: 'cycleFace' }
    ]
  },
  {
    tag: 'Scene 2 / 4',
    title: 'The Grand Queen Hall & Runway',
    pretitle: 'The Royal Darbar of Queen Monika',
    heading: 'Empress Monika in the Royal Hall 👑',
    body: 'Walking with supreme grace in the grand palace hall, holding her birthday cake adorned with glowing candles. Monika commands the room with timeless elegance, royal majesty, and that enchanting smile.',
    actions: [
      { text: '✨ Palace Hall Glow', action: 'spotlight', primary: true },
      { text: '👗 Royal 360 Twirl', action: 'twirl' },
      { text: '🎂 Cake Candle Sparkle', action: 'cakeGlow' }
    ]
  },
  {
    tag: 'Scene 3 / 4',
    title: '3D Photo Memory Galaxy',
    pretitle: 'Your innocence shines through every photograph',
    heading: 'The 3D Memory Nebula',
    body: 'Every photograph of yours tells a beautiful story — sometimes the simplicity, sometimes that lovely smile, sometimes that effortless grace. Monika, you are extraordinary in every way.',
    actions: [
      { text: '🪐 Rotate Galaxy', action: 'rotateGalaxy' },
      { text: '🔍 Next Photo', action: 'nextPhoto' }
    ]
  },
  {
    tag: 'Scene 4 / 4',
    title: '3D Cake & Love Letter',
    pretitle: 'A celebration of happiness — Make a wish!',
    heading: 'Happy Birthday, Queen Monika! 🎂',
    body: 'Today, say goodbye to all your sadness. Blow out the 3D candles, make a special wish, and read the heartfelt letter written just for you by Anish.',
    actions: [
      { text: '🎂 Blow Out the Candles', action: 'blowCandles', primary: true },
      { text: '💌 Read Love Letter', action: 'openLetter' }
    ]
  }
];

function switchScene(index) {
  if (isTransitioning) return;
  isTransitioning = true;
  currentScene = ((index % 4) + 4) % 4;

  dockTabs.forEach((tab, i) => tab.classList.toggle('active', i === currentScene));

  if (queenGroup) queenGroup.visible = (currentScene === 0);
  if (coronationGroup) coronationGroup.visible = (currentScene === 0);
  if (runwayGroup) runwayGroup.visible = (currentScene === 1);
  if (galaxyGroup) galaxyGroup.visible = (currentScene === 2);
  if (celebrationGroup) celebrationGroup.visible = (currentScene === 3);

  // Camera targets for each scene
  const camPositions = [
    { pos: [0, 1.6, 4.4], look: [0, 1.4, 0] },
    { pos: [0.2, 1.68, 4.3], look: [0, 1.45, 0.6] },
    { pos: [0, 2.2, 5.2], look: [0, 1.7, 0] },
    { pos: [0, 1.8, 3.2], look: [0, 1.1, 0] }
  ][currentScene];

  cameraTargetPos.set(...camPositions.pos);
  cameraLookTarget.set(...camPositions.look);

  // Update face photo per scene
  if (currentScene < 2) updateFacePhoto(currentScene);

  // Play matching romantic soundtrack for this scene
  if (isStarted && !isAudioMuted) {
    playSceneSong(currentScene);
  }

  // Floating love letter button visibility on celebration scene (and easy toggle)
  const floatingLetterBtn = $('floatingLetterBtn');
  if (floatingLetterBtn) {
    floatingLetterBtn.classList.toggle('hidden', currentScene !== 3);
  }

  // Hide zoom controls on celebration page — they clutter the right side near the love letter button
  const cameraControls = $('cameraFloatingControls');
  if (cameraControls) {
    cameraControls.classList.toggle('hidden', currentScene === 3);
  }

  // Story overlay update
  const d = sceneDetails[currentScene];
  sceneTag.textContent = d.tag;
  sceneTitle.textContent = d.title;
  storyPretitle.textContent = d.pretitle;
  storyHeading.textContent = d.heading;
  storyBody.innerHTML = d.body;

  storyActions.innerHTML = '';
  d.actions.forEach(actionInfo => {
    const btn = document.createElement('button');
    btn.className = `story-action-btn ${actionInfo.primary ? 'gold-btn' : ''}`;
    btn.textContent = actionInfo.text;
    btn.addEventListener('click', () => handleSceneAction(actionInfo.action));
    storyActions.appendChild(btn);
  });

  // Toggle angle controls & turntable indicator visibility
  const showTurntable = (currentScene === 0 || currentScene === 1);
  if (turntableIndicator) {
    if (showTurntable) {
      turntableIndicator.classList.remove('hidden');
      clearTimeout(turntableIndicator._fadeTimer);
      // Auto-hide after 3.5s so it never blocks the avatar on the main page
      turntableIndicator._fadeTimer = setTimeout(() => {
        if (turntableIndicator) turntableIndicator.classList.add('hidden');
      }, 3500);
    } else {
      turntableIndicator.classList.add('hidden');
    }
  }
  if (angleControls) {
    angleControls.classList.toggle('hidden', !showTurntable);
  }
  if (showTurntable) {
    setCameraAngle('front');
  }

  setTimeout(() => { isTransitioning = false; }, 500);
}

function setCameraAngle(angleKey) {
  currentCameraAngle = angleKey;
  // HTML uses data-view, not data-angle
  angleBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === angleKey);
  });

  const targetAngles = {
    front:       0,
    frontLeft45: -Math.PI * 0.25,
    left:        -Math.PI * 0.5,
    back45:      -Math.PI * 0.75,
    back:        Math.PI,
    right:       Math.PI * 0.5
  };

  if (targetAngles[angleKey] !== undefined) {
    rotTarget = targetAngles[angleKey];
    pitchTarget = 0;
  }

  const camConfig = cameraAnglePositions[angleKey] || cameraAnglePositions.front;
  const zOffset = (currentScene === 1) ? 0.6 : 0;
  cameraTargetPos.set(camConfig.pos[0], camConfig.pos[1], camConfig.pos[2] + zOffset);
  cameraLookTarget.set(camConfig.look[0], camConfig.look[1], camConfig.look[2] + zOffset);
}

function handleSceneAction(action) {
  if (action === 'crown' && crownMesh) {
    crownMesh.position.y = 3.6;
    const start = performance.now();
    (function descend() {
      const p = Math.min(1, (performance.now() - start) / 1200);
      crownMesh.position.y = 3.6 - (3.6 - 2.80) * p;
      if (p < 1) requestAnimationFrame(descend);
      else triggerConfetti();
    })();
  } else if (action === 'roses' && rosePetalsGroup) {
    rosePetalsGroup.children.forEach(p => p.userData.speedY *= 2.5);
    setTimeout(() => rosePetalsGroup.children.forEach(p => p.userData.speedY /= 2.5), 2000);
  } else if (action === 'cycleFace') {
    cycleFacePhoto();
  } else if (action === 'spotlight') {
    if (mainSpotLight) {
      mainSpotLight.color.setHex(mainSpotLight.color.getHex() === 0xffecd0 ? 0xff4081 : 0xffecd0);
    }
    if (hallChandelierLights && hallChandelierLights.length) {
      hallChandelierLights.forEach(ch => {
        ch.color.setHex(ch.color.getHex() === 0xffe6a8 ? 0xff80ab : 0xffe6a8);
      });
    }
  } else if (action === 'twirl') {
    rotTarget += Math.PI * 2;
    triggerConfetti();
  } else if (action === 'cakeGlow') {
    if (runwayCakeCandleLight) {
      runwayCakeCandleLight.intensity = 2.8;
      triggerConfetti();
      setTimeout(() => {
        if (runwayCakeCandleLight) runwayCakeCandleLight.intensity = 0.85;
      }, 1500);
    }
  } else if (action === 'rotateGalaxy' && galaxyGroup) {
    galaxyGroup.rotation.y += Math.PI / 2;
  } else if (action === 'nextPhoto' && galaxyGroup) {
    galaxyGroup.rotation.y += Math.PI / 2;
  } else if (action === 'blowCandles') {
    blowCandlesAndCelebrate();
  } else if (action === 'openLetter') {
    openLetter();
  }
}

// ══════════════════════════════════════════════════════
//  10. LOVE LETTER & ROMANTIC AUDIO
// ══════════════════════════════════════════════════════
function openLetter() {
  const modal = $('letterModal') || letterModal;
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('active');
    triggerConfetti();
    launchFirework();
  }
}

function closeLetter() {
  const modal = $('letterModal') || letterModal;
  if (modal) {
    modal.classList.remove('active');
  }
}

// ══════════════════════════════════════════════════════
//  10. REAL ROMANTIC SOUNDTRACK SYSTEM
// ══════════════════════════════════════════════════════
const sceneSoundtracks = [
  {
    title: 'Rose Palace & Coronation Theme',
    subtitle: 'Scene 1 · Coronation & Rose Shower',
    src: 'song/rose.mp3'
  },
  {
    title: 'Royal Runway Melody',
    subtitle: 'Scene 2 · Haute Couture Fashion Show',
    src: 'song/enter.mp3'
  },
  {
    title: 'Memories with Monika',
    subtitle: 'Scene 3 · 3D Photo Memory Galaxy',
    src: 'song/memory.mp3'
  },
  {
    title: 'Birthday Celebration & Cake Song',
    subtitle: 'Scene 4 · Cake, Fireworks & Love Letter',
    src: 'song/cake.mp3'
  }
];

let bgAudio = new Audio();
bgAudio.loop = true;
bgAudio.preload = 'auto';
let isAudioMuted = false;
let currentTrackIndex = -1;

function playSceneSong(sceneIdx) {
  if (sceneIdx === currentTrackIndex && !bgAudio.paused) return;
  currentTrackIndex = sceneIdx % sceneSoundtracks.length;
  const track = sceneSoundtracks[currentTrackIndex];

  fadeAudioTransition(track.src, () => {
    updateMusicUI();
    highlightActiveModalTrack(currentTrackIndex);
  });
}

function fadeAudioTransition(newSrc, onLoaded) {
  if (bgAudio.src && !bgAudio.paused) {
    let vol = bgAudio.volume;
    const fadeOut = setInterval(() => {
      vol = Math.max(0, vol - 0.15);
      bgAudio.volume = vol;
      if (vol <= 0.05) {
        clearInterval(fadeOut);
        bgAudio.src = newSrc;
        bgAudio.volume = isAudioMuted ? 0 : 0.85;
        if (!isAudioMuted) {
          bgAudio.play().catch(e => console.log('Audio play deferred:', e));
        }
        if (onLoaded) onLoaded();
      }
    }, 40);
  } else {
    bgAudio.src = newSrc;
    bgAudio.volume = isAudioMuted ? 0 : 0.85;
    if (!isAudioMuted) {
      bgAudio.play().catch(e => console.log('Audio play deferred:', e));
    }
    if (onLoaded) onLoaded();
  }
}

function toggleMusic() {
  if (bgAudio.paused) {
    isAudioMuted = false;
    bgAudio.volume = 0.85;
    if (!bgAudio.src) {
      playSceneSong(currentScene >= 0 ? currentScene : 0);
    } else {
      bgAudio.play().catch(()=>{});
    }
  } else {
    isAudioMuted = true;
    bgAudio.pause();
  }
  updateMusicUI();
}

function updateMusicUI() {
  const isPlaying = !bgAudio.paused && !isAudioMuted;
  musicToggleBtn.classList.toggle('paused', !isPlaying);
  const track = sceneSoundtracks[currentTrackIndex >= 0 ? currentTrackIndex : 0];
  musicLabel.textContent = isPlaying ? ('Playing: ' + track.title) : 'Music Paused';
}

function highlightActiveModalTrack(index) {
  const trackItems = document.querySelectorAll('#musicTracksList .track-item');
  trackItems.forEach((item, i) => {
    const isActive = (i === index);
    item.classList.toggle('active', isActive);
    const badge = item.querySelector('.track-badge');
    if (badge) badge.textContent = isActive ? 'Playing' : 'Play';
  });
}

// ══════════════════════════════════════════════════════
//  11. USER INTERACTIONS & EVENT LISTENERS
// ══════════════════════════════════════════════════════
function setupInteractions() {
  // Enter button — triggers cinematic reveal then main experience
  enterBtn.addEventListener('click', () => {
    isStarted = true;
    entryScreen.classList.add('hidden');
    triggerConfetti();
    playSceneSong(0);
    switchScene(0);

    // ── CINEMATIC BIRTHDAY REVEAL SEQUENCE ──
    const reveal = $('birthdayReveal');
    if (reveal) {
      // Show overlay after short delay
      setTimeout(() => {
        reveal.classList.remove('hidden');
        reveal.style.opacity = '1';
        // Auto-dismiss after 3.5 s
        setTimeout(() => {
          reveal.style.opacity = '0';
          reveal.style.transition = 'opacity 1.2s ease';
          setTimeout(() => reveal.classList.add('hidden'), 1300);
        }, 3500);
      }, 400);
    }

    setTimeout(() => {
      if (interactionHint) interactionHint.style.opacity = '0';
    }, 5000);
  });

  // Music controls
  musicToggleBtn.addEventListener('click', toggleMusic);
  musicToggleBtn.addEventListener('contextmenu', e => {
    e.preventDefault();
    musicModal.classList.add('active');
  });
  closeMusicModalBtn.addEventListener('click', () => musicModal.classList.remove('active'));

  // Playlist track item click to play immediately
  const modalTrackItems = document.querySelectorAll('#musicTracksList .track-item');
  modalTrackItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.trackIndex, 10);
      isAudioMuted = false;
      playSceneSong(idx);
    });
  });

  // 360 Camera Angle Buttons — HTML uses data-view, not data-angle
  angleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setCameraAngle(btn.dataset.view);
    });
  });

  // ── ZOOM & RESET BUTTONS ──
  const zoomInBtn   = $('zoomInBtn');
  const zoomOutBtn  = $('zoomOutBtn');
  const resetViewBtn = $('resetViewBtn');

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      const dir = new THREE.Vector3();
      dir.subVectors(cameraLookTarget, camera.position).normalize();
      const newPos = camera.position.clone().addScaledVector(dir, 0.6);
      const minDist = 1.8;
      if (newPos.distanceTo(cameraLookTarget) > minDist) {
        cameraTargetPos.copy(newPos);
      }
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      const dir = new THREE.Vector3();
      dir.subVectors(camera.position, cameraLookTarget).normalize();
      const newPos = camera.position.clone().addScaledVector(dir, 0.6);
      const maxDist = 7.0;
      if (newPos.distanceTo(cameraLookTarget) < maxDist) {
        cameraTargetPos.copy(newPos);
      }
    });
  }

  if (resetViewBtn) {
    resetViewBtn.addEventListener('click', () => {
      setCameraAngle('front');
      rotTarget = 0;
      pitchTarget = 0;
    });
  }

  // Double-tap reset on 3D container
  let lastTap = 0;
  container.addEventListener('pointerdown', e => {
    const now = Date.now();
    if (now - lastTap < 320) {
      // Double tap = reset view
      setCameraAngle('front');
      rotTarget = 0;
      pitchTarget = 0;
    }
    lastTap = now;
    isDragging = true;
    prevPointer = { x: e.clientX, y: e.clientY };
    if (turntableIndicator) {
      clearTimeout(turntableIndicator._fadeTimer);
      turntableIndicator.classList.add('hidden');
    }
  });

  // Scroll to zoom
  container.addEventListener('wheel', e => {
    e.preventDefault();
    const dir = new THREE.Vector3();
    const zoomDelta = e.deltaY > 0 ? -0.4 : 0.4;
    dir.subVectors(cameraLookTarget, camera.position).normalize();
    const newPos = camera.position.clone().addScaledVector(dir, zoomDelta);
    const dist = newPos.distanceTo(cameraLookTarget);
    if (dist > 1.8 && dist < 7.0) {
      cameraTargetPos.copy(newPos);
    }
  }, { passive: false });

  // Fullscreen
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  });

  // Scene navigation
  dockTabs.forEach(tab => tab.addEventListener('click', () => switchScene(+tab.dataset.scene)));
  prevSceneBtn.addEventListener('click', () => switchScene(currentScene - 1));
  nextSceneBtn.addEventListener('click', () => switchScene(currentScene + 1));

  window.addEventListener('keydown', e => {
    if (!isStarted) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') switchScene(currentScene + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') switchScene(currentScene - 1);
    else if ('1234'.includes(e.key)) switchScene(+e.key - 1);
  });

  // Mouse / touch 3D orbit — only on the WebGL canvas, not UI buttons
  window.addEventListener('pointermove', e => {
    if (!isDragging) return;
    rotTarget += (e.clientX - prevPointer.x) * 0.008;
    pitchTarget = Math.max(-0.4, Math.min(0.4, pitchTarget + (e.clientY - prevPointer.y) * 0.005));
    prevPointer = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('pointerup', () => isDragging = false);
  window.addEventListener('pointercancel', () => isDragging = false);

  // Love letter modal
  if (closeLetterBtn) closeLetterBtn.addEventListener('click', closeLetter);
  if (closeLetterBottomBtn) closeLetterBottomBtn.addEventListener('click', closeLetter);
  if (letterBackdrop) letterBackdrop.addEventListener('click', closeLetter);
  if (confettiLetterBtn) {
    confettiLetterBtn.addEventListener('click', () => {
      triggerConfetti();
      launchFirework();
    });
  }

  // Floating love letter button
  const floatingLetterBtn = $('floatingLetterBtn');
  if (floatingLetterBtn) {
    floatingLetterBtn.addEventListener('click', openLetter);
  }

  // Story card minimize/expand toggle (especially handy on mobile)
  const storyToggleBtn = $('storyToggleBtn');
  const storyCard = $('storyCard');
  if (storyToggleBtn && storyCard) {
    storyToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCollapsed = storyCard.classList.toggle('collapsed');
      storyToggleBtn.innerHTML = isCollapsed ? '&#x25B8;' : '&#x25BE;';
      storyToggleBtn.title = isCollapsed ? 'Expand Story Card' : 'Minimize Story Card';
    });
  }

  // Escape key closes modals
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeLetter();
      if (musicModal) musicModal.classList.remove('active');
    }
  });

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  if (!camera || !renderer) return;
  const isMobile = window.innerWidth < 768;
  const isPortrait = window.innerHeight > window.innerWidth;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = (isMobile && isPortrait) ? 58 : 45;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// ══════════════════════════════════════════════════════
//  12. ANIMATION LOOP
// ══════════════════════════════════════════════════════
function animate() {
  requestAnimationFrame(animate);
  if (!renderer || !scene || !camera) return;

  const delta = clock.getDelta();
  animTime += delta;

  // Smooth camera motion
  camera.position.lerp(cameraTargetPos, 0.045);
  camera.lookAt(cameraLookTarget);

  // Ballgown silk wave physics
  if (gownSkirtMesh && gownOriginalPositions) {
    const attr = gownSkirtMesh.geometry.attributes.position;
    const orig = gownOriginalPositions;
    for (let i = 0; i < attr.count; i++) {
      const ox = orig.getX(i), oy = orig.getY(i), oz = orig.getZ(i);
      const depth = Math.max(0, 1.8 - oy);
      const wave = Math.sin(animTime * 2.2 + oy * 3.5 + ox * 2) * 0.035 * depth;
      attr.setXYZ(i, ox + wave * Math.cos(ox), oy, oz + wave * Math.sin(oz));
    }
    attr.needsUpdate = true;
  }

  // Queen breathing, rotation & crown
  if (queenGroup && queenGroup.visible) {
    queenGroup.rotation.y += (rotTarget - queenGroup.rotation.y) * 0.08;
    queenGroup.rotation.x += (pitchTarget - queenGroup.rotation.x) * 0.08;

    if (!isDragging) {
      rotTarget += 0.0018;
      queenGroup.position.y = Math.sin(animTime * 1.4) * 0.03;
    }

    if (crownMesh) {
      crownMesh.rotation.y = -queenGroup.rotation.y * 0.5 + animTime * 0.3;
    }

    if (faceGlowMesh) {
      faceGlowMesh.material.opacity = 0.04 + Math.sin(animTime * 2) * 0.015;
      faceGlowMesh.scale.setScalar(1 + Math.sin(animTime * 1.5) * 0.03);
    }

    if (avatarStandingMesh) {
      avatarStandingMesh.position.y = 1.53 + Math.sin(animTime * 1.4) * 0.012;
    }
  }

  // Rose petals falling
  if (rosePetalsGroup && coronationGroup && coronationGroup.visible) {
    rosePetalsGroup.children.forEach(petal => {
      petal.position.y -= petal.userData.speedY;
      petal.position.x += Math.sin(animTime * petal.userData.wobble + petal.position.y) * 0.005;
      petal.rotation.x += petal.userData.rotX;
      petal.rotation.y += petal.userData.rotY;
      if (petal.position.y < -0.1) {
        petal.position.y = 5.0;
        petal.position.x = (Math.random() - 0.5) * 6;
      }
    });
  }

  // Runway Queen Hall animations
  if (runwayGroup && runwayGroup.visible) {
    if (runwayQueenGroup) {
      runwayQueenGroup.rotation.y += (rotTarget - runwayQueenGroup.rotation.y) * 0.08;
      runwayQueenGroup.rotation.x += (pitchTarget - runwayQueenGroup.rotation.x) * 0.08;

      if (!isDragging) {
        rotTarget += 0.0016;
        runwayQueenGroup.position.y = Math.sin(animTime * 1.4) * 0.025;
      }
    }

    if (runwayQueenMesh) {
      runwayQueenMesh.position.y = 1.52 + Math.sin(animTime * 1.4) * 0.012;
    }

    if (runwayCakeCandleLight) {
      // Warm candle flame flickering on Monika's birthday cake
      runwayCakeCandleLight.intensity = 0.80 + Math.sin(animTime * 16) * 0.15 + (Math.random() - 0.5) * 0.08;
    }

    if (hallStardustParticles) {
      hallStardustParticles.rotation.y += 0.003;
    }

    // Gentle candle flicker in the palace hall
    if (hallChandelierLights && hallChandelierLights.length) {
      hallChandelierLights.forEach((light, li) => {
        light.intensity = 1.05 + Math.sin(animTime * 6 + li * 2) * 0.12;
      });
    }
  }

  // Memory galaxy orbit
  if (galaxyGroup && galaxyGroup.visible) {
    galaxyGroup.rotation.y += 0.003;
    galaxyPhotoFrames.forEach((frame, idx) => {
      frame.position.y = 1.7 + Math.sin(animTime * 1.5 + idx) * 0.08;
    });
  }

  // Cake candle flame flickering & floating balloons
  if (celebrationGroup && celebrationGroup.visible) {
    if (!candlesBlown) {
      cakeCandles.forEach((candle, idx) => {
        const flicker = 0.85 + Math.sin(animTime * 14 + idx * 3) * 0.15 + (Math.random() - 0.5) * 0.1;
        candle.flame.scale.set(flicker, flicker * 1.2, flicker);
        candle.light.intensity = flicker * 0.9;
      });
    }

    floatingBalloons.forEach(b => {
      b.position.y += b.userData.speedY;
      b.position.x += Math.sin(animTime * 2 + b.userData.wobble) * 0.006;
      if (b.position.y > 6.0) {
        b.position.y = 0.5;
        b.position.x = (Math.random() - 0.5) * 4;
      }
    });
  }

  // Fireworks particles
  for (let i = fireworksList.length - 1; i >= 0; i--) {
    const fw = fireworksList[i];
    const posAttr = fw.mesh.geometry.attributes.position;
    for (let j = 0; j < fw.velocities.length; j++) {
      const v = fw.velocities[j];
      posAttr.setXYZ(j, posAttr.getX(j) + v.x, posAttr.getY(j) + v.y, posAttr.getZ(j) + v.z);
      v.y -= 0.0015;
      v.x *= 0.98;
      v.z *= 0.98;
    }
    posAttr.needsUpdate = true;
    fw.life -= fw.decay;
    fw.mesh.material.opacity = Math.max(0, fw.life);

    if (fw.life <= 0) {
      scene.remove(fw.mesh);
      fw.mesh.geometry.dispose();
      fw.mesh.material.dispose();
      fireworksList.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

// ══════════════════════════════════════════════════════
//  13. START ENGINE ON PAGE LOAD
// ══════════════════════════════════════════════════════
let _initDone = false;
function safeInit3D() {
  if (_initDone) return;
  _initDone = true;
  init3D();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  safeInit3D();
} else {
  window.addEventListener('DOMContentLoaded', safeInit3D, { once: true });
}
