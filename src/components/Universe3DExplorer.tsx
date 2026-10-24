import { useState, useEffect, useRef, useMemo, type FC } from 'react';
import * as THREE from 'three';
import type { AppPage } from '../types';
import { SOLAR_SYSTEM_OBJECTS } from '../data/solarSystemData';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import { useReducedMotion, useDocumentVisibility } from '../utils/motion';
import { 
  createSunTexture,
  createMercuryTexture,
  createVenusTexture,
  createEarthTexture,
  createMoonTexture,
  createMarsTexture,
  createJupiterTexture,
  createSaturnTexture,
  createSaturnRingsTexture,
  createUranusTexture,
  createNeptuneTexture
} from '../utils/planetTextureGenerator';
import { 
  Compass, 
  Orbit, 
  Eye, 
  EyeOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Info, 
  X
} from 'lucide-react';

interface Universe3DExplorerProps {
  onNavigate: (page: AppPage) => void;
}

// Check if WebGL is available
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// 3D Presentation configurations for Solar System bodies
interface Body3DConfig {
  id: string;
  name: string;
  presentationRadius: number;
  presentationDistance: number;
  realDistanceScaleAU: number; // distance multiplier in astronomical mode
  orbitPeriodSpeed: number; // relative orbital speed (Keplerian)
  rotationSpeed: number; // axial rotation speed
  axialTiltDeg: number;
  orbitColor: string;
  hasRings?: boolean;
  hasMoon?: boolean;
}

const BODIES_CONFIG: Body3DConfig[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    presentationRadius: 1.2,
    presentationDistance: 26,
    realDistanceScaleAU: 0.387 * 20,
    orbitPeriodSpeed: 4.15, // orbits in 0.24 yr
    rotationSpeed: 0.005,
    axialTiltDeg: 0.03,
    orbitColor: '#94A3B8'
  },
  {
    id: 'venus',
    name: 'Venus',
    presentationRadius: 1.8,
    presentationDistance: 38,
    realDistanceScaleAU: 0.723 * 20,
    orbitPeriodSpeed: 1.62, // orbits in 0.61 yr
    rotationSpeed: -0.002, // retrograde
    axialTiltDeg: 177.3,
    orbitColor: '#FBBF24'
  },
  {
    id: 'earth',
    name: 'Earth',
    presentationRadius: 2.0,
    presentationDistance: 52,
    realDistanceScaleAU: 1.0 * 20,
    orbitPeriodSpeed: 1.0, // base 1 year
    rotationSpeed: 0.02,
    axialTiltDeg: 23.44,
    orbitColor: '#38BDF8',
    hasMoon: true
  },
  {
    id: 'mars',
    name: 'Mars',
    presentationRadius: 1.5,
    presentationDistance: 66,
    realDistanceScaleAU: 1.524 * 20,
    orbitPeriodSpeed: 0.53, // orbits in 1.88 yr
    rotationSpeed: 0.019,
    axialTiltDeg: 25.19,
    orbitColor: '#EF4444'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    presentationRadius: 4.8,
    presentationDistance: 88,
    realDistanceScaleAU: 5.204 * 20,
    orbitPeriodSpeed: 0.084, // orbits in 11.86 yr
    rotationSpeed: 0.04,
    axialTiltDeg: 3.13,
    orbitColor: '#F59E0B'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    presentationRadius: 4.0,
    presentationDistance: 112,
    realDistanceScaleAU: 9.582 * 20,
    orbitPeriodSpeed: 0.034, // orbits in 29.45 yr
    rotationSpeed: 0.038,
    axialTiltDeg: 26.73,
    orbitColor: '#EAB308',
    hasRings: true
  },
  {
    id: 'uranus',
    name: 'Uranus',
    presentationRadius: 2.8,
    presentationDistance: 136,
    realDistanceScaleAU: 19.22 * 20,
    orbitPeriodSpeed: 0.012, // orbits in 84 yr
    rotationSpeed: -0.025, // retrograde
    axialTiltDeg: 97.77,
    orbitColor: '#06B6D4'
  },
  {
    id: 'neptune',
    name: 'Neptune',
    presentationRadius: 2.7,
    presentationDistance: 158,
    realDistanceScaleAU: 30.07 * 20,
    orbitPeriodSpeed: 0.006, // orbits in 164.8 yr
    rotationSpeed: 0.026,
    axialTiltDeg: 28.32,
    orbitColor: '#3B82F6'
  }
];

export const Universe3DExplorer: FC<Universe3DExplorerProps> = ({ onNavigate }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useReducedMotion();
  const isDocumentVisible = useDocumentVisibility();

  // UI state
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [scaleMode, setScaleMode] = useState<'presentation' | 'proportional'>('presentation');
  const [searchQuery, setSearchQuery] = useState('');
  const [isWebGLSupported] = useState(() => isWebGLAvailable());

  // Direct DOM label references for 60fps label tracking without React reconciliation overhead
  const labelElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Active object scientific data from Stage 2 dataset
  const activeObjectData = useMemo(() => {
    if (!selectedObjectId) return null;
    return SOLAR_SYSTEM_OBJECTS.find(o => o.id === selectedObjectId) || null;
  }, [selectedObjectId]);

  // Three.js instances ref
  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    planetMeshes: Map<string, { mesh: THREE.Mesh; orbitGroup: THREE.Group; config: Body3DConfig }>;
    orbitLines: THREE.Line[];
    selectionRing: THREE.Mesh;
    cameraTarget: THREE.Vector3;
    cameraSpherical: { radius: number; theta: number; phi: number };
    targetSpherical: { radius: number; theta: number; phi: number };
    isDragging: boolean;
    pointerStart: { x: number; y: number; time: number };
    activeFocusBodyId: string | null;
    animFrameId: number;
    sunMesh: THREE.Mesh;
    moonMesh?: THREE.Mesh;
    earthMesh?: THREE.Mesh;
  } | null>(null);

  // Initialize and mount 3D Three.js Scene
  useEffect(() => {
    if (!isWebGLSupported || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030611');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 3000);
    const cameraSpherical = { radius: 210, theta: Math.PI / 4, phi: Math.PI / 3.2 };
    const cameraTarget = new THREE.Vector3(0, 0, 0);

    // Initial camera positioning
    camera.position.set(
      cameraSpherical.radius * Math.sin(cameraSpherical.phi) * Math.sin(cameraSpherical.theta),
      cameraSpherical.radius * Math.cos(cameraSpherical.phi),
      cameraSpherical.radius * Math.sin(cameraSpherical.phi) * Math.cos(cameraSpherical.theta)
    );
    camera.lookAt(cameraTarget);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight('#2A3859', 0.5);
    scene.add(ambientLight);

    // Central Sun light
    const sunLight = new THREE.PointLight('#FFFBEA', 3.0, 1500, 0.6);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // 4. Starfield Particles
    const starCount = 3000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 600 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      // Star spectral colors (white, soft blue, warm amber)
      const colorType = Math.random();
      if (colorType > 0.7) {
        starColors[i * 3] = 0.8; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 1.0; // blue-white
      } else if (colorType > 0.4) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 0.8; // pale gold
      } else {
        starColors[i * 3] = 0.95; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 0.95; // white
      }
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 5. Central Sun Mesh & Corona Glow
    const sunGeom = new THREE.SphereGeometry(9.0, 32, 32);
    const sunTexture = createSunTexture();
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture,
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunMesh.userData = { id: 'sun', name: 'Sun' };
    scene.add(sunMesh);

    // Outer subtle coronal halo
    const haloGeom = new THREE.SphereGeometry(10.2, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: '#F59E0B',
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    sunMesh.add(haloMesh);

    // 6. Selection Targeting Ring
    const ringGeom = new THREE.RingGeometry(2.5, 3.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#38BDF8',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const selectionRing = new THREE.Mesh(ringGeom, ringMat);
    selectionRing.rotation.x = Math.PI / 2;
    selectionRing.visible = false;
    scene.add(selectionRing);

    // 7. Planet Meshes & Orbits
    const planetMeshes = new Map<string, { mesh: THREE.Mesh; orbitGroup: THREE.Group; config: Body3DConfig }>();
    const orbitLines: THREE.Line[] = [];

    // Helper map of texture generators
    const textureMap: Record<string, () => THREE.CanvasTexture> = {
      mercury: createMercuryTexture,
      venus: createVenusTexture,
      earth: createEarthTexture,
      mars: createMarsTexture,
      jupiter: createJupiterTexture,
      saturn: createSaturnTexture,
      uranus: createUranusTexture,
      neptune: createNeptuneTexture
    };

    let moonMeshRef: THREE.Mesh | undefined;
    let earthMeshRef: THREE.Mesh | undefined;

    for (const body of BODIES_CONFIG) {
      const orbitGroup = new THREE.Group();
      scene.add(orbitGroup);

      // Sphere geometry
      const sphereGeom = new THREE.SphereGeometry(body.presentationRadius, 32, 32);
      const textureFn = textureMap[body.id] || createMercuryTexture;
      const texture = textureFn();

      const planetMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.75,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(sphereGeom, planetMat);
      mesh.rotation.z = (body.axialTiltDeg * Math.PI) / 180;
      mesh.userData = { id: body.id, name: body.name };

      const dist = scaleMode === 'presentation' ? body.presentationDistance : body.realDistanceScaleAU;
      mesh.position.set(dist, 0, 0);
      orbitGroup.add(mesh);

      // Saturn Ring System
      if (body.hasRings) {
        const ringInner = body.presentationRadius * 1.4;
        const ringOuter = body.presentationRadius * 2.5;
        const ringGeometry = new THREE.RingGeometry(ringInner, ringOuter, 64);
        const ringTex = createSaturnRingsTexture();
        const ringMaterial = new THREE.MeshStandardMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95
        });
        const ringsMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringsMesh.rotation.x = Math.PI / 2;
        mesh.add(ringsMesh);
      }

      // Earth's Moon
      if (body.hasMoon) {
        const moonGeom = new THREE.SphereGeometry(0.5, 16, 16);
        const moonMat = new THREE.MeshStandardMaterial({
          map: createMoonTexture(),
          roughness: 0.9
        });
        const moon = new THREE.Mesh(moonGeom, moonMat);
        moon.position.set(3.5, 0.5, 0);
        mesh.add(moon);
        moonMeshRef = moon;
        earthMeshRef = mesh;
      }

      // Keplerian Orbit Line Loop
      const points: THREE.Vector3[] = [];
      const segments = 128;
      const ecc = SOLAR_SYSTEM_OBJECTS.find(o => o.id === body.id)?.eccentricity || 0;
      const a = dist;
      const b = a * Math.sqrt(Math.max(0.1, 1 - ecc * ecc));

      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        const x = a * Math.cos(theta) - (a * ecc);
        const z = b * Math.sin(theta);
        points.push(new THREE.Vector3(x, 0, z));
      }

      const orbitPathGeom = new THREE.BufferGeometry().setFromPoints(points);
      const orbitPathMat = new THREE.LineBasicMaterial({
        color: body.orbitColor,
        transparent: true,
        opacity: 0.28
      });
      const orbitLine = new THREE.Line(orbitPathGeom, orbitPathMat);
      scene.add(orbitLine);
      orbitLines.push(orbitLine);

      planetMeshes.set(body.id, { mesh, orbitGroup, config: body });
    }

    sceneRefs.current = {
      scene,
      camera,
      renderer,
      planetMeshes,
      orbitLines,
      selectionRing,
      cameraTarget,
      cameraSpherical,
      targetSpherical: { ...cameraSpherical },
      isDragging: false,
      pointerStart: { x: 0, y: 0, time: 0 },
      activeFocusBodyId: null,
      animFrameId: 0,
      sunMesh,
      moonMesh: moonMeshRef,
      earthMesh: earthMeshRef
    };

    // 8. Interactive Pointer Controls & Drag Detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      if (!sceneRefs.current) return;
      sceneRefs.current.isDragging = true;
      sceneRefs.current.pointerStart = { x: e.clientX, y: e.clientY, time: Date.now() };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!sceneRefs.current) return;
      const { isDragging, targetSpherical } = sceneRefs.current;
      if (!isDragging) return;

      const dx = e.clientX - sceneRefs.current.pointerStart.x;
      const dy = e.clientY - sceneRefs.current.pointerStart.y;

      // Update camera spherical target angles
      targetSpherical.theta -= dx * 0.005;
      targetSpherical.phi = Math.max(0.08, Math.min(Math.PI - 0.08, targetSpherical.phi - dy * 0.005));

      sceneRefs.current.pointerStart.x = e.clientX;
      sceneRefs.current.pointerStart.y = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!sceneRefs.current) return;
      const wasDragging = sceneRefs.current.isDragging;
      sceneRefs.current.isDragging = false;

      // Disambiguate Drag vs Click:
      // If pointer movement was less than 6px, treat as selection click
      const distMoved = Math.hypot(
        e.clientX - sceneRefs.current.pointerStart.x,
        e.clientY - sceneRefs.current.pointerStart.y
      );

      if (distMoved < 6 && wasDragging) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // Collect all selectable meshes
        const candidateMeshes: THREE.Mesh[] = [sunMesh];
        for (const item of planetMeshes.values()) {
          candidateMeshes.push(item.mesh);
        }

        const intersects = raycaster.intersectObjects(candidateMeshes, false);
        if (intersects.length > 0) {
          const clickedId = intersects[0].object.userData?.id;
          if (clickedId) {
            handleSelectObject(clickedId);
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!sceneRefs.current) return;
      e.preventDefault();
      const { targetSpherical, activeFocusBodyId } = sceneRefs.current;

      const zoomFactor = 1 + Math.sign(e.deltaY) * 0.08;
      const minRadius = activeFocusBodyId ? 8 : 25;
      const maxRadius = activeFocusBodyId ? 180 : 800;

      targetSpherical.radius = Math.max(minRadius, Math.min(maxRadius, targetSpherical.radius * zoomFactor));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation & Render Loop
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      sceneRefs.current!.animFrameId = requestAnimationFrame(animate);

      if (!isDocumentVisible) return;

      const delta = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;

      const refs = sceneRefs.current;
      if (!refs) return;

      // Spin the Sun (disabled when reduced motion)
      if (!isReducedMotion) {
        refs.sunMesh.rotation.y += 0.002;
      }

      // Orbit and spin planets if not paused and not reduced motion
      if (!isPaused && !isReducedMotion) {
        for (const { mesh, orbitGroup, config } of refs.planetMeshes.values()) {
          // Axial spin
          mesh.rotation.y += config.rotationSpeed * simSpeed;

          // Orbital revolution
          orbitGroup.rotation.y += (config.orbitPeriodSpeed * 0.15 * delta * simSpeed);
        }

        // Spin moon around Earth
        if (refs.moonMesh) {
          refs.moonMesh.rotation.y += 0.03 * simSpeed;
        }
      }

      // Smooth camera position & tracking
      let targetPos = new THREE.Vector3(0, 0, 0);

      if (refs.activeFocusBodyId) {
        if (refs.activeFocusBodyId === 'sun') {
          targetPos = refs.sunMesh.position;
        } else {
          const item = refs.planetMeshes.get(refs.activeFocusBodyId);
          if (item) {
            item.mesh.getWorldPosition(targetPos);

            // Update selection ring
            refs.selectionRing.position.copy(targetPos);
            refs.selectionRing.scale.setScalar(item.config.presentationRadius * 0.6);
            refs.selectionRing.visible = true;
          }
        }
      } else {
        refs.selectionRing.visible = false;
      }

      // Smoothly lerp cameraTarget toward targetPos
      const targetLerp = isReducedMotion ? 1.0 : 0.06;
      refs.cameraTarget.lerp(targetPos, targetLerp);

      // Smoothly lerp camera spherical angles towards target
      const angleLerp = isReducedMotion ? 1.0 : 0.08;
      const sp = refs.cameraSpherical;
      const tsp = refs.targetSpherical;
      sp.radius += (tsp.radius - sp.radius) * angleLerp;
      sp.phi += (tsp.phi - sp.phi) * angleLerp;
      sp.theta += (tsp.theta - sp.theta) * angleLerp;

      // Compute camera coords from spherical
      const cx = refs.cameraTarget.x + sp.radius * Math.sin(sp.phi) * Math.sin(sp.theta);
      const cy = refs.cameraTarget.y + sp.radius * Math.cos(sp.phi);
      const cz = refs.cameraTarget.z + sp.radius * Math.sin(sp.phi) * Math.cos(sp.theta);

      refs.camera.position.set(cx, cy, cz);
      refs.camera.lookAt(refs.cameraTarget);

      // 10. Update 2D Screen Labels directly without triggering React re-renders
      if (showLabels) {
        const tempV = new THREE.Vector3();
        for (const [id, { mesh, config }] of refs.planetMeshes.entries()) {
          const el = labelElementsRef.current.get(id);
          if (!el) continue;
          mesh.getWorldPosition(tempV);
          tempV.y += config.presentationRadius * 1.4;
          tempV.project(refs.camera);

          // Is behind camera?
          const isVisible = tempV.z < 1.0;
          if (isVisible) {
            const sx = (tempV.x * 0.5 + 0.5) * container.clientWidth;
            const sy = (-(tempV.y * 0.5) + 0.5) * container.clientHeight;
            el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
            el.style.display = 'block';
          } else {
            el.style.display = 'none';
          }
        }
      }

      renderer.render(scene, camera);
    };

    sceneRefs.current.animFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      if (sceneRefs.current) {
        cancelAnimationFrame(sceneRefs.current.animFrameId);
      }
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js objects
      starGeometry.dispose();
      starMaterial.dispose();
      sunGeom.dispose();
      sunTexture.dispose();
      ringGeom.dispose();
      ringMat.dispose();

      for (const line of orbitLines) {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isWebGLSupported, scaleMode, isDocumentVisible, isReducedMotion]);

  // Handle Planet Selection & Focus
  const handleSelectObject = (id: string) => {
    setSelectedObjectId(id);
    if (!sceneRefs.current) return;

    sceneRefs.current.activeFocusBodyId = id;

    if (id === 'sun') {
      sceneRefs.current.targetSpherical.radius = 45;
    } else {
      const item = sceneRefs.current.planetMeshes.get(id);
      if (item) {
        sceneRefs.current.targetSpherical.radius = item.config.presentationRadius * 6.5;
        sceneRefs.current.targetSpherical.phi = Math.PI / 2.8;
      }
    }
  };

  // Reset Camera to System Overview
  const handleResetOverview = () => {
    setSelectedObjectId(null);
    if (!sceneRefs.current) return;
    sceneRefs.current.activeFocusBodyId = null;
    sceneRefs.current.targetSpherical.radius = 210;
    sceneRefs.current.targetSpherical.phi = Math.PI / 3.2;
    sceneRefs.current.targetSpherical.theta = Math.PI / 4;
  };

  // Toggle Orbits Visibility
  useEffect(() => {
    if (!sceneRefs.current) return;
    for (const line of sceneRefs.current.orbitLines) {
      line.visible = showOrbits;
    }
  }, [showOrbits]);

  // Handle Search in 3D Explorer
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = BODIES_CONFIG.find(b => b.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    if (match) {
      handleSelectObject(match.id);
    } else if (searchQuery.toLowerCase().includes('sun')) {
      handleSelectObject('sun');
    }
  };

  return (
    <div className="relative w-full min-h-[92vh] bg-[#030611] text-[#F8FAFC] overflow-hidden flex flex-col">
      {/* 1. TOP HEADER & SCIENTIFIC SCALE CONTROLS */}
      <div className="relative z-20 bg-[#050B1A]/85 backdrop-blur-md border-b border-[#1E293B] px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
              <Compass className="w-3.5 h-3.5" />
              Planetary Mechanics • 3D Universe Explorer
            </span>
            <span className="text-xs text-[#94A3B8]">JPL Horizons Reference Ephemerides</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
            Interactive 3D Solar System
          </h1>
        </div>

        {/* View & Scale Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Scale Mode Toggle */}
          <div className="flex items-center rounded-xl bg-[#0B1630] border border-[#1E293B] p-1">
            <button
              onClick={() => setScaleMode('presentation')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                scaleMode === 'presentation'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Normalized visual scale so every planet is visible and interactive"
            >
              Presentation Scale
            </button>
            <button
              onClick={() => setScaleMode('proportional')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                scaleMode === 'proportional'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
              title="Linear astronomical distance scale (AU) showing vast outer distances"
            >
              Astronomical Scale (AU)
            </button>
          </div>

          {/* Reset Overview Button */}
          <button
            onClick={handleResetOverview}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B1630] hover:bg-[#1E293B] border border-[#1E293B] text-[#38BDF8] font-medium transition-colors"
            title="Reset camera to isometric Solar System overview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* 2. SCALE NOTIFICATION BANNER */}
      <div className="relative z-10 bg-[#0B1630]/75 border-b border-[#1E293B]/60 px-4 py-2 text-[11px] text-[#94A3B8] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
          <span>
            {scaleMode === 'presentation'
              ? 'Presentation Scale active: Planetary sizes and orbital radii are visually scaled so inner and outer planets remain clearly visible and interactive.'
              : 'Astronomical Scale (AU) active: Orbital distances are strictly proportional to real astronomical units (1 AU = 149.6M km). Note how outer gas giants are dispersed into deep space.'}
          </span>
        </div>
        <div className="hidden sm:block text-[#64748B]">
          Drag to orbit camera • Scroll to zoom • Click planet to focus
        </div>
      </div>

      {/* 3. 3D WEBGL VIEWPORT OR ACCESSIBLE FALLBACK */}
      <div className="relative flex-1 w-full h-[650px] min-h-[550px] overflow-hidden">
        {isWebGLSupported ? (
          <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full" />
        ) : (
          /* WebGL Unsupported Fallback */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#0B1630] text-center">
            <Orbit className="w-16 h-16 text-[#38BDF8] mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-white">WebGL Hardware Acceleration Unavailable</h2>
            <p className="mt-2 text-sm text-[#94A3B8] max-w-md">
              Your browser does not have WebGL enabled. You can still inspect all verified orbital elements and physical properties below.
            </p>
          </div>
        )}

        {/* 2D Overlay Projected Planet Labels (Direct DOM transforms without React re-rendering) */}
        {showLabels && isWebGLSupported && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {BODIES_CONFIG.map(body => {
              const isSelected = selectedObjectId === body.id;
              return (
                <div
                  key={body.id}
                  ref={el => {
                    if (el) labelElementsRef.current.set(body.id, el);
                    else labelElementsRef.current.delete(body.id);
                  }}
                  style={{
                    display: 'none',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    willChange: 'transform'
                  }}
                  className="absolute -translate-x-1/2 -translate-y-full pb-2 transition-opacity"
                >
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider whitespace-nowrap shadow-lg ${
                      isSelected
                        ? 'bg-[#38BDF8] text-[#050B1A] font-bold ring-2 ring-[#38BDF8]/50'
                        : 'bg-[#0B1630]/80 text-[#94A3B8] border border-[#1E293B]'
                    }`}
                  >
                    {body.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. BOTTOM FLOATING CONTROLS DOCK */}
        <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quick Select Planet Bar */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#050B1A]/90 border border-[#1E293B] backdrop-blur-md overflow-x-auto scrollbar-none shadow-2xl">
            <button
              onClick={() => handleSelectObject('sun')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedObjectId === 'sun'
                  ? 'bg-[#F59E0B] text-[#050B1A] font-bold shadow-md'
                  : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
              }`}
            >
              Sun
            </button>
            {BODIES_CONFIG.map(body => {
              const isSelected = selectedObjectId === body.id;
              return (
                <button
                  key={body.id}
                  onClick={() => handleSelectObject(body.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-md'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
                  }`}
                >
                  {body.name}
                </button>
              );
            })}
          </div>

          {/* Quick Actions (Pause/Play, Orbits, Labels) */}
          <div className="flex items-center justify-between sm:justify-start gap-2 p-1.5 rounded-2xl bg-[#050B1A]/90 border border-[#1E293B] backdrop-blur-md shadow-2xl">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
              title={isPaused ? 'Resume orbital motion' : 'Pause orbital motion'}
              aria-label={isPaused ? 'Resume orbital motion' : 'Pause orbital motion'}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Orbit Lines Toggle */}
            <button
              onClick={() => setShowOrbits(!showOrbits)}
              className={`p-2 rounded-xl transition-colors ${
                showOrbits ? 'text-[#38BDF8] bg-[#38BDF8]/10' : 'text-[#64748B] hover:text-white'
              }`}
              title={showOrbits ? 'Hide orbital paths' : 'Show orbital paths'}
              aria-label={showOrbits ? 'Hide orbital paths' : 'Show orbital paths'}
            >
              <Orbit className="w-4 h-4" />
            </button>

            {/* Labels Toggle */}
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`p-2 rounded-xl transition-colors ${
                showLabels ? 'text-[#38BDF8] bg-[#38BDF8]/10' : 'text-[#64748B] hover:text-white'
              }`}
              title={showLabels ? 'Hide planet labels' : 'Show planet labels'}
              aria-label={showLabels ? 'Hide planet labels' : 'Show planet labels'}
            >
              {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Speed multipliers */}
            <div className="flex items-center pl-1 border-l border-[#1E293B] text-[10px] font-mono">
              {[1, 2, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    simSpeed === s ? 'text-[#38BDF8] font-bold bg-[#38BDF8]/10' : 'text-[#64748B] hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. SEARCH & SNAP CONTROL */}
        <div className="absolute top-4 left-4 z-20 max-w-xs">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search planet (e.g. Saturn)..."
              className="w-full pl-9 pr-8 py-2 bg-[#050B1A]/85 backdrop-blur-md border border-[#1E293B] rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* 6. SCIENTIFIC OBJECT DETAILS PANEL (Slide-over / Modal) */}
        {activeObjectData && (
          <div className="absolute top-4 right-4 z-30 w-full max-w-sm bg-[#050B1A]/95 backdrop-blur-md border border-[#1E293B] rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#1E293B] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 font-semibold">
                    {activeObjectData.type}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    JPL Horizons Record
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{activeObjectData.name}</h3>
              </div>
              <button
                onClick={handleResetOverview}
                className="p-1 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors"
                title="Close and return to overview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mission Photograph / Scientific Visual */}
            <div className="rounded-xl overflow-hidden border border-[#1E293B] bg-[#050B1A]">
              <AstronomicalImage
                target={activeObjectData}
                targetType={activeObjectData.id === 'sun' ? 'star' : 'planet'}
                aspectRatio="16/9"
                showBadge={true}
                className="w-full h-36 object-cover"
              />
            </div>

            {/* Description */}
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              {activeObjectData.description}
            </p>

            {/* Scientific Properties Grid with Units */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono uppercase text-[#64748B] font-semibold">
                Verified Astronomical Parameters
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs tabular-nums">
                <div className="p-2 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                  <span className="text-[10px] text-[#64748B] block">Semi-Major Axis</span>
                  <span className="font-semibold text-white font-mono">{activeObjectData.semiMajorAxisAU}</span>
                  <span className="text-[10px] text-[#94A3B8] ml-1">AU</span>
                </div>

                <div className="p-2 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                  <span className="text-[10px] text-[#64748B] block">Orbital Period</span>
                  <span className="font-semibold text-white font-mono">{activeObjectData.orbitalPeriodYears}</span>
                  <span className="text-[10px] text-[#94A3B8] ml-1">years</span>
                </div>

                <div className="p-2 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                  <span className="text-[10px] text-[#64748B] block">Mean Radius</span>
                  <span className="font-semibold text-white font-mono">{activeObjectData.radiusKm.toLocaleString()}</span>
                  <span className="text-[10px] text-[#94A3B8] ml-1">km</span>
                </div>

                <div className="p-2 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                  <span className="text-[10px] text-[#64748B] block">Mass (Relative)</span>
                  <span className="font-semibold text-white font-mono">{activeObjectData.massEarthRelative}</span>
                  <span className="text-[10px] text-[#94A3B8] ml-1">M⊕</span>
                </div>

                <div className="p-2 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                  <span className="text-[10px] text-[#64748B] block">Eccentricity</span>
                  <span className="font-semibold text-white font-mono">{activeObjectData.eccentricity}</span>
                </div>

                <div className="p-2 rounded-lg bg-[#0B1630] border border-[#1E293B]">
                  <span className="text-[10px] text-[#64748B] block">Orbital Inclination</span>
                  <span className="font-semibold text-white font-mono">{activeObjectData.inclinationDeg}</span>
                  <span className="text-[10px] text-[#94A3B8] ml-1">°</span>
                </div>
              </div>
            </div>

            {/* Scientific Context */}
            {activeObjectData.scientificContext && (
              <div className="p-3 rounded-xl bg-[#0B1630]/80 border border-[#1E293B] text-[11px] text-[#94A3B8]">
                <strong className="text-white block mb-0.5">Scientific Significance:</strong>
                {activeObjectData.scientificContext}
              </div>
            )}

            {/* Provenance Link */}
            <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs">
              <a
                href="https://ssd.jpl.nasa.gov/horizons/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#64748B] hover:text-[#94A3B8] inline-flex items-center gap-1 text-[11px]"
              >
                <span>JPL Horizons Ephemeris</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Ask AI Guide Button */}
              <button
                onClick={() => onNavigate('ai-guide')}
                className="text-[#38BDF8] hover:text-[#7DD3FC] font-semibold inline-flex items-center gap-1 text-[11px]"
              >
                <Sparkles className="w-3 h-3" />
                <span>Ask AI Guide</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. BOTTOM SCIENTIFIC INTEGRITY & UNITS FOOTER */}
      <div className="border-t border-[#1E293B] bg-[#050B1A] p-4 text-xs text-[#94A3B8] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Keplerian elements synchronized with IAU and NASA Planetary Data System.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
          <span>1 AU = 149,597,870.7 km</span>
          <span>1 M⊕ = 5.972 × 10²⁴ kg</span>
          <span>{"Orbital Speeds ∝ 1/√(a³)"}</span>
        </div>
      </div>
    </div>
  );
};
