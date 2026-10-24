import { useState, useEffect, useRef, useCallback, type FC } from 'react';
import * as THREE from 'three';
import type { 
  LiveCloseApproach, 
  AsteroidMotionResponse,
  AsteroidMotionStateVector
} from '../types';
import { fetchAsteroidOrbit } from '../services/liveSpaceService';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import {
  propagateElementsClient,
  type KeplerianElements
} from '../utils/orbitalMotion';
import {
  useReducedMotion,
  useDocumentVisibility,
  Easing
} from '../utils/motion';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Orbit,
  ArrowRight,
  Clock
} from 'lucide-react';

interface AsteroidMotionViewerProps {
  initialDesignation?: string;
  allApproaches?: LiveCloseApproach[];
  onSelectApproach?: (approach: LiveCloseApproach) => void;
  onSwitchToListMode: () => void;
}

type RenderEngine = '3d' | '2d';
type ViewPerspective = 'encounter' | 'heliocentric';

const SPEED_PRESETS = [
  { label: '-1 d/s', factor: -24 * 3600 },
  { label: '1 hr/s', factor: 3600 },
  { label: '6 hr/s', factor: 6 * 3600 },
  { label: '1 d/s', factor: 24 * 3600 },
  { label: '7 d/s', factor: 7 * 24 * 3600 },
  { label: '30 d/s', factor: 30 * 24 * 3600 },
];

const FAMOUS_NEO_PRESETS = [
  { des: '99942', label: '99942 Apophis', note: '2029 Super Close Flyby (0.08 LD)' },
  { des: '433', label: '433 Eros', note: 'First Landed NEA (NEAR Shoemaker)' },
  { des: '4179', label: '4179 Toutatis', note: 'Contact Binary Apollo PHA' },
  { des: '101955', label: '101955 Bennu', note: 'OSIRIS-REx Sample Return Target' },
  { des: '162173', label: '162173 Ryugu', note: 'Hayabusa2 Sample Target' },
  { des: '2010 VQ', label: '2010 VQ', note: 'Aten Asteroid (Dec 2026 Pass)' },
  { des: '2025 UK9', label: '2025 UK9', note: 'Sub-Lunar Pass (0.82 LD)' },
  { des: '2024 YR4', label: '2024 YR4', note: 'Recently Cataloged Apollo' }
];

export const AsteroidMotionViewer: FC<AsteroidMotionViewerProps> = ({
  initialDesignation = '99942',
  allApproaches = [],
  onSelectApproach,
  onSwitchToListMode
}) => {
  const isReducedMotion = useReducedMotion();
  const isDocumentVisible = useDocumentVisibility();

  // Target designation & base data
  const [selectedDes, setSelectedDes] = useState<string>(initialDesignation);
  const [motionData, setMotionData] = useState<AsteroidMotionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View Controls
  const [renderEngine, setRenderEngine] = useState<RenderEngine>('3d');
  const [viewPerspective, setViewPerspective] = useState<ViewPerspective>('encounter');
  const [distanceUnit, setDistanceUnit] = useState<'lunar' | 'km' | 'au'>('lunar');

  // Display Toggles
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showMoon, setShowMoon] = useState<boolean>(true);

  // Time & Playback Controls
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedFactor, setSpeedFactor] = useState<number>(24 * 3600); // 1 day/sec default
  const [baseEpoch, setBaseEpoch] = useState<Date>(new Date());

  // Real-time telemetry state (updated at throttled intervals for React rendering)
  const [realtimeDistLD, setRealtimeDistLD] = useState<number>(0);
  const [realtimeDistAU, setRealtimeDistAU] = useState<number>(0);
  const [realtimeSpeedKmS, setRealtimeSpeedKmS] = useState<number>(0);

  // Canvas Refs
  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvas2dRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulated Time Ref for 60fps loop
  const simTimeRef = useRef<number>(Date.now());
  const lastTickRef = useRef<number>(performance.now());
  const lastHudUpdateRef = useRef<number>(0);
  const transitAnimRef = useRef<number | null>(null);

  // 3D Three.js State
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    earthGroup: THREE.Group;
    asteroidMesh: THREE.Mesh;
    moonMesh: THREE.Mesh;
    sunMesh: THREE.Mesh;
    orbitLine: THREE.Line;
    earthOrbitLine: THREE.Line;
    distanceLine: THREE.Line;
    velocityVector: THREE.ArrowHelper;
    isDragging: boolean;
    prevMouse: { x: number; y: number };
    currentRotation: { x: number; y: number };
    targetRotation: { x: number; y: number };
    currentZoom: number;
    targetZoom: number;
    cameraTarget: THREE.Vector3;
    currentTarget: THREE.Vector3;
  } | null>(null);

  // Handle target selection
  const handleSelectTarget = (des: string) => {
    setSelectedDes(des);
    const matched = allApproaches.find(a => a.designation.toLowerCase().includes(des.toLowerCase()));
    if (matched && onSelectApproach) {
      onSelectApproach(matched);
    }
  };

  // Convert API orbital elements to Keplerian client solver format
  const getKeplerianElements = useCallback((): KeplerianElements | null => {
    if (!motionData?.asteroid?.orbitalElements) return null;
    const el = motionData.asteroid.orbitalElements;
    return {
      a: el.semiMajorAxisAU,
      e: el.eccentricity,
      i: el.inclinationDeg,
      node: el.longitudeOfAscendingNodeDeg,
      peri: el.argumentOfPerihelionDeg,
      M0: el.meanAnomalyDeg,
      epochJd: el.epochJd,
      periodYears: el.orbitalPeriodYears,
      meanMotionDegDay: el.meanMotionDegDay
    };
  }, [motionData]);

  // Load Asteroid Orbit Data
  const loadOrbitData = useCallback(async (desToLoad: string, targetEpoch?: Date) => {
    try {
      setIsLoading(true);
      setError(null);
      const epochIso = targetEpoch ? targetEpoch.toISOString() : undefined;
      const res = await fetchAsteroidOrbit({ des: desToLoad, date: epochIso });
      setMotionData(res);
      setRealtimeDistLD(res.stateVector.distEarthLunar);
      setRealtimeDistAU(res.stateVector.distEarthAU);
      setRealtimeSpeedKmS(res.stateVector.orbitalSpeedKmS);

      // If target epoch was not explicitly provided and the asteroid has a close-approach record, set base epoch to that date
      if (!targetEpoch && res.asteroid.closeApproach) {
        const caDate = new Date(res.asteroid.closeApproach.iso);
        if (!isNaN(caDate.getTime())) {
          setBaseEpoch(caDate);
        }
      }
    } catch (err: any) {
      console.error('[AsteroidMotionViewer] Failed to load asteroid orbit:', err);
      setError('Unable to load orbital data from JPL SBDB. Displaying verified local archive.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial and designation change fetch
  useEffect(() => {
    loadOrbitData(selectedDes, simulatedDate);
  }, [selectedDes]);

  // Keep simulated time ref in sync with React state
  useEffect(() => {
    simTimeRef.current = simulatedDate.getTime();
  }, [simulatedDate]);

  // Synchronize 3D meshes for a given epoch (called at 60fps in Three loop)
  const sync3DPositionForEpoch = useCallback((epochMs: number) => {
    if (!threeRef.current || !motionData) return;
    const { 
      earthGroup, 
      asteroidMesh, 
      moonMesh, 
      sunMesh, 
      orbitLine, 
      earthOrbitLine, 
      distanceLine, 
      velocityVector 
    } = threeRef.current;

    const keplerian = getKeplerianElements();
    const currentDate = new Date(epochMs);
    let state: AsteroidMotionStateVector | any;

    if (keplerian) {
      state = propagateElementsClient(keplerian, currentDate);
    } else {
      state = motionData.stateVector;
    }

    const isPha = motionData.asteroid.isPotentiallyHazardous;

    if (viewPerspective === 'encounter') {
      // Earth at center
      earthGroup.position.set(0, 0, 0);
      earthGroup.visible = true;
      sunMesh.visible = false;
      earthOrbitLine.visible = false;

      const scaleLD = 18.0;
      const missLD = state.distEarthLunar;
      const relNorm = Math.hypot(state.earthRelativeAU.x, state.earthRelativeAU.y, state.earthRelativeAU.z) || 1;
      const clampedVisualDist = Math.max(5.5, Math.min(75, missLD * scaleLD));
      const astX = (state.earthRelativeAU.x / relNorm) * clampedVisualDist;
      const astY = (state.earthRelativeAU.z / relNorm) * clampedVisualDist;
      const astZ = (state.earthRelativeAU.y / relNorm) * clampedVisualDist;

      asteroidMesh.position.set(astX, astY, astZ);
      (asteroidMesh.material as THREE.MeshStandardMaterial).color.set(isPha ? 0xEF4444 : 0xF59E0B);

      // Moon position at 1 LD
      const moonAngle = (epochMs / (27.3 * 86400000)) * Math.PI * 2;
      moonMesh.position.set(Math.cos(moonAngle) * 18, 0, Math.sin(moonAngle) * 18);
      moonMesh.visible = showMoon;

      // Trajectory flyby arc
      const trajPoints: THREE.Vector3[] = [];
      const flybyLen = 45;
      const velAngle = Math.atan2(state.velocityVectorKmS.vy, state.velocityVectorKmS.vx);
      for (let s = -flybyLen; s <= flybyLen; s += 2) {
        trajPoints.push(new THREE.Vector3(
          astX + Math.cos(velAngle) * s,
          astY,
          astZ + Math.sin(velAngle) * s
        ));
      }
      orbitLine.geometry.dispose();
      orbitLine.geometry = new THREE.BufferGeometry().setFromPoints(trajPoints);
      orbitLine.visible = showOrbits;
      (orbitLine.material as THREE.LineBasicMaterial).color.set(isPha ? 0xEF4444 : 0xF59E0B);

      // Distance line from Earth to Asteroid
      const distPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(astX, astY, astZ)];
      distanceLine.geometry.dispose();
      distanceLine.geometry = new THREE.BufferGeometry().setFromPoints(distPts);
      distanceLine.computeLineDistances();
      distanceLine.visible = showVectors;

      // Velocity Arrow
      const dirVec = new THREE.Vector3(
        state.velocityVectorKmS.vx,
        state.velocityVectorKmS.vz,
        state.velocityVectorKmS.vy
      ).normalize();
      velocityVector.position.set(astX, astY, astZ);
      velocityVector.setDirection(dirVec);
      velocityVector.setLength(7);
      velocityVector.visible = showVectors;
    } else {
      // Heliocentric View: Sun at center
      sunMesh.visible = true;
      moonMesh.visible = false;
      const scaleAU = 35.0;

      const earthX = state.earthPositionAU.x * scaleAU;
      const earthY = state.earthPositionAU.z * scaleAU;
      const earthZ = state.earthPositionAU.y * scaleAU;
      earthGroup.position.set(earthX, earthY, earthZ);
      earthGroup.visible = true;

      const astX = state.heliocentricAU.x * scaleAU;
      const astY = state.heliocentricAU.z * scaleAU;
      const astZ = state.heliocentricAU.y * scaleAU;
      asteroidMesh.position.set(astX, astY, astZ);
      (asteroidMesh.material as THREE.MeshStandardMaterial).color.set(isPha ? 0xEF4444 : 0xF59E0B);

      if (motionData.trajectories.asteroidOrbitPath) {
        const orbitPts = motionData.trajectories.asteroidOrbitPath.map(
          pt => new THREE.Vector3(pt.x * scaleAU, pt.z * scaleAU, pt.y * scaleAU)
        );
        orbitLine.geometry.dispose();
        orbitLine.geometry = new THREE.BufferGeometry().setFromPoints(orbitPts);
        orbitLine.visible = showOrbits;
        (orbitLine.material as THREE.LineBasicMaterial).color.set(isPha ? 0xEF4444 : 0xF59E0B);
      }

      if (motionData.trajectories.earthOrbitPath) {
        const earthPts = motionData.trajectories.earthOrbitPath.map(
          pt => new THREE.Vector3(pt.x * scaleAU, pt.z * scaleAU, pt.y * scaleAU)
        );
        earthOrbitLine.geometry.dispose();
        earthOrbitLine.geometry = new THREE.BufferGeometry().setFromPoints(earthPts);
        earthOrbitLine.visible = showOrbits;
      }

      const distPts = [new THREE.Vector3(earthX, earthY, earthZ), new THREE.Vector3(astX, astY, astZ)];
      distanceLine.geometry.dispose();
      distanceLine.geometry = new THREE.BufferGeometry().setFromPoints(distPts);
      distanceLine.computeLineDistances();
      distanceLine.visible = showVectors;

      const dirVec = new THREE.Vector3(
        state.velocityVectorKmS.vx,
        state.velocityVectorKmS.vz,
        state.velocityVectorKmS.vy
      ).normalize();
      velocityVector.position.set(astX, astY, astZ);
      velocityVector.setDirection(dirVec);
      velocityVector.setLength(8);
      velocityVector.visible = showVectors;
    }
  }, [motionData, getKeplerianElements, viewPerspective, showMoon, showOrbits, showVectors]);

  // Handle Playback animation loop (runs in-memory at 60fps)
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;

    const tick = (now: number) => {
      if (!isDocumentVisible) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const deltaSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      // Advance simulated time
      const timeAdvanceMs = deltaSec * speedFactor * 1000;
      simTimeRef.current += timeAdvanceMs;

      // Synchronize 3D meshes immediately
      if (renderEngine === '3d') {
        sync3DPositionForEpoch(simTimeRef.current);
      }

      // Throttle React state updates to ~10fps so the UI numbers refresh without choking 60fps canvas
      if (now - lastHudUpdateRef.current > 100) {
        lastHudUpdateRef.current = now;
        const newDate = new Date(simTimeRef.current);
        setSimulatedDate(newDate);

        const kepler = getKeplerianElements();
        if (kepler) {
          const st = propagateElementsClient(kepler, newDate);
          setRealtimeDistLD(st.distEarthLunar);
          setRealtimeDistAU(st.distEarthAU);
          setRealtimeSpeedKmS(st.orbitalSpeedKmS);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speedFactor, isDocumentVisible, renderEngine, sync3DPositionForEpoch, getKeplerianElements]);

  // Smooth encounter transit to close approach epoch
  const jumpToCloseApproach = () => {
    let targetIso: string | null = null;
    if (motionData?.asteroid.closeApproach) {
      targetIso = motionData.asteroid.closeApproach.iso;
    } else {
      const matched = allApproaches.find(a => a.designation.toLowerCase().includes(selectedDes.toLowerCase()));
      if (matched) {
        targetIso = matched.closeApproachIso;
      }
    }

    if (!targetIso) return;
    const targetDate = new Date(targetIso);
    if (isNaN(targetDate.getTime())) return;

    if (transitAnimRef.current) cancelAnimationFrame(transitAnimRef.current);

    if (isReducedMotion) {
      // Instant transit for reduced-motion users
      simTimeRef.current = targetDate.getTime();
      setSimulatedDate(targetDate);
      setBaseEpoch(targetDate);
      sync3DPositionForEpoch(targetDate.getTime());
      return;
    }

    // Smooth ease transit over 650ms
    const startEpoch = simTimeRef.current;
    const endEpoch = targetDate.getTime();
    const startTime = performance.now();
    const duration = 650;

    const transitStep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const eased = Easing.easeInOutCubic(progress);
      const currentEpoch = startEpoch + (endEpoch - startEpoch) * eased;
      simTimeRef.current = currentEpoch;

      sync3DPositionForEpoch(currentEpoch);

      if (progress < 1.0) {
        transitAnimRef.current = requestAnimationFrame(transitStep);
      } else {
        setSimulatedDate(targetDate);
        setBaseEpoch(targetDate);
        transitAnimRef.current = null;
      }
    };

    transitAnimRef.current = requestAnimationFrame(transitStep);
  };

  // Reset to Current UTC
  const resetToNow = () => {
    const now = new Date();
    simTimeRef.current = now.getTime();
    setSimulatedDate(now);
    setBaseEpoch(now);
    setIsPlaying(false);
    sync3DPositionForEpoch(now.getTime());
  };

  // Step controls
  const stepTime = (hours: number) => {
    const nextMs = simTimeRef.current + hours * 3600 * 1000;
    simTimeRef.current = nextMs;
    const next = new Date(nextMs);
    setSimulatedDate(next);
    sync3DPositionForEpoch(nextMs);

    const kepler = getKeplerianElements();
    if (kepler) {
      const st = propagateElementsClient(kepler, next);
      setRealtimeDistLD(st.distEarthLunar);
      setRealtimeDistAU(st.distEarthAU);
      setRealtimeSpeedKmS(st.orbitalSpeedKmS);
    }
  };

  // Reset 3D Camera View to default framing
  const resetCameraView = () => {
    if (!threeRef.current) return;
    threeRef.current.targetRotation = { x: 0.35, y: -0.4 };
    threeRef.current.targetZoom = viewPerspective === 'encounter' ? 75 : 120;
    threeRef.current.currentTarget.set(0, 0, 0);
  };

  // Format Distance based on unit
  const formatDist = (distLD: number, distAU: number) => {
    if (distanceUnit === 'lunar') {
      return `${distLD.toFixed(2)} LD`;
    }
    if (distanceUnit === 'km') {
      const km = distLD * 384400.0;
      return `${Math.round(km).toLocaleString()} km`;
    }
    return `${distAU.toFixed(5)} AU`;
  };

  // Everyday size benchmark description
  const getSizeBenchmark = (diamMeters: number) => {
    if (diamMeters < 15) return 'Automobile / Delivery Van (~10 m)';
    if (diamMeters < 40) return 'Chelyabinsk Meteor / Small Building (~20 m)';
    if (diamMeters < 90) return 'Commercial Passenger Jet (~60 m)';
    if (diamMeters < 160) return 'FIFA Football Stadium (~140 m threshold for PHA)';
    if (diamMeters < 350) return 'Eiffel Tower / Apophis Scale (~300 m)';
    return 'Mountain Peak / Empire State Building Scale (> 400 m)';
  };

  // -------------------------------------------------------------
  // THREE.JS 3D SCENE SETUP & SMOOTH CAMERA EASING
  // -------------------------------------------------------------
  useEffect(() => {
    if (renderEngine !== '3d' || !webglCanvasRef.current || !containerRef.current) return;
    const canvas = webglCanvasRef.current;
    const container = containerRef.current;

    // Check WebGL availability
    try {
      const testGl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!testGl) {
        setRenderEngine('2d');
        return;
      }
    } catch {
      setRenderEngine('2d');
      return;
    }

    const width = container.clientWidth || 800;
    const height = 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050B1A);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 35, 75);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Ambient and Directional Lighting
    const ambientLight = new THREE.AmbientLight(0x38BDF8, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    dirLight.position.set(50, 40, 50);
    scene.add(dirLight);

    // 1. Central Earth Group
    const earthGroup = new THREE.Group();
    const earthGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1E40AF,
      emissive: 0x0C2050,
      specular: 0x38BDF8,
      shininess: 25
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Earth Atmosphere Glow Halo
    const atmoGeo = new THREE.SphereGeometry(3.9, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    earthGroup.add(new THREE.Mesh(atmoGeo, atmoMat));
    scene.add(earthGroup);

    // 2. Moon Mesh & Orbit
    const moonGeo = new THREE.SphereGeometry(0.9, 16, 16);
    const moonMat = new THREE.MeshLambertMaterial({ color: 0xCBD5E1 });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);

    // Moon Orbit Ring
    const moonOrbitGeo = new THREE.BufferGeometry();
    const moonPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const th = (i / 64) * Math.PI * 2;
      moonPts.push(new THREE.Vector3(Math.cos(th) * 18, 0, Math.sin(th) * 18));
    }
    moonOrbitGeo.setFromPoints(moonPts);
    const moonOrbitLine = new THREE.Line(
      moonOrbitGeo, 
      new THREE.LineDashedMaterial({ color: 0x38BDF8, dashSize: 1, gapSize: 1 })
    );
    moonOrbitLine.computeLineDistances();
    scene.add(moonOrbitLine);

    // 3. Sun Mesh (for heliocentric perspective)
    const sunGeo = new THREE.SphereGeometry(5.0, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xFBBF24 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.visible = false;
    scene.add(sunMesh);

    // 4. Asteroid Mesh
    const asteroidGeo = new THREE.DodecahedronGeometry(1.4, 1);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.8,
      metalness: 0.2
    });
    const asteroidMesh = new THREE.Mesh(asteroidGeo, asteroidMat);
    scene.add(asteroidMesh);

    // 5. Orbit Trajectory Line
    const orbitGeo = new THREE.BufferGeometry();
    const orbitMat = new THREE.LineBasicMaterial({ color: 0xF87171, linewidth: 2 });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);

    // Earth Orbit Line (Heliocentric)
    const earthOrbitGeo = new THREE.BufferGeometry();
    const earthOrbitMat = new THREE.LineBasicMaterial({ color: 0x38BDF8, linewidth: 1.5 });
    const earthOrbitLine = new THREE.Line(earthOrbitGeo, earthOrbitMat);
    earthOrbitLine.visible = false;
    scene.add(earthOrbitLine);

    // 6. Distance Vector Line
    const distGeo = new THREE.BufferGeometry();
    const distMat = new THREE.LineDashedMaterial({ color: 0x94A3B8, dashSize: 0.8, gapSize: 0.6 });
    const distanceLine = new THREE.Line(distGeo, distMat);
    scene.add(distanceLine);

    // 7. Direction of Travel Arrow
    const velocityVector = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      8,
      0x38BDF8,
      2,
      1
    );
    scene.add(velocityVector);

    // Three State Reference with smooth camera target and angles
    threeRef.current = {
      scene,
      camera,
      renderer,
      earthGroup,
      asteroidMesh,
      moonMesh,
      sunMesh,
      orbitLine,
      earthOrbitLine,
      distanceLine,
      velocityVector,
      isDragging: false,
      prevMouse: { x: 0, y: 0 },
      currentRotation: { x: 0.35, y: -0.4 },
      targetRotation: { x: 0.35, y: -0.4 },
      currentZoom: 75,
      targetZoom: 75,
      cameraTarget: new THREE.Vector3(0, 0, 0),
      currentTarget: new THREE.Vector3(0, 0, 0)
    };

    // Initial position sync
    sync3DPositionForEpoch(simTimeRef.current);

    // Mouse Drag Controls for Orbit Rotation
    const onMouseDown = (e: MouseEvent) => {
      if (!threeRef.current) return;
      threeRef.current.isDragging = true;
      threeRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!threeRef.current || !threeRef.current.isDragging) return;
      const dx = e.clientX - threeRef.current.prevMouse.x;
      const dy = e.clientY - threeRef.current.prevMouse.y;
      threeRef.current.targetRotation.y += dx * 0.008;
      threeRef.current.targetRotation.x = Math.max(-1.4, Math.min(1.4, threeRef.current.targetRotation.x + dy * 0.008));
      threeRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      if (threeRef.current) threeRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!threeRef.current) return;
      threeRef.current.targetZoom = Math.max(20, Math.min(220, threeRef.current.targetZoom + e.deltaY * 0.08));
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for mobile
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (!threeRef.current) return;
      if (e.touches.length === 1) {
        threeRef.current.isDragging = true;
        threeRef.current.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!threeRef.current) return;
      if (e.touches.length === 1 && threeRef.current.isDragging) {
        const dx = e.touches[0].clientX - threeRef.current.prevMouse.x;
        const dy = e.touches[0].clientY - threeRef.current.prevMouse.y;
        threeRef.current.targetRotation.y += dx * 0.008;
        threeRef.current.targetRotation.x = Math.max(-1.4, Math.min(1.4, threeRef.current.targetRotation.x + dy * 0.008));
        threeRef.current.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = touchStartDist - dist;
        touchStartDist = dist;
        threeRef.current.targetZoom = Math.max(20, Math.min(220, threeRef.current.targetZoom + delta * 0.15));
      }
    };

    const onTouchEnd = () => {
      if (threeRef.current) threeRef.current.isDragging = false;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container || !threeRef.current) return;
      const w = container.clientWidth || 800;
      const h = 500;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Render loop with smooth camera easing
    let animId: number;
    const render = () => {
      if (threeRef.current && isDocumentVisible) {
        const { 
          camera, 
          scene, 
          renderer, 
          currentRotation, 
          targetRotation, 
          currentZoom, 
          targetZoom, 
          cameraTarget, 
          currentTarget, 
          earthGroup 
        } = threeRef.current;

        // Smooth camera lerp
        const lerpFactor = isReducedMotion ? 1.0 : 0.09;
        currentRotation.x += (targetRotation.x - currentRotation.x) * lerpFactor;
        currentRotation.y += (targetRotation.y - currentRotation.y) * lerpFactor;
        threeRef.current.currentZoom += (targetZoom - currentZoom) * lerpFactor;
        cameraTarget.lerp(currentTarget, lerpFactor);

        // Compute camera Cartesian position
        const cy = Math.cos(currentRotation.x) * threeRef.current.currentZoom;
        camera.position.x = cameraTarget.x + Math.sin(currentRotation.y) * cy;
        camera.position.y = cameraTarget.y + Math.sin(currentRotation.x) * threeRef.current.currentZoom;
        camera.position.z = cameraTarget.z + Math.cos(currentRotation.y) * cy;
        camera.lookAt(cameraTarget);

        // Gentle ambient Earth rotation (disabled if reduced motion)
        if (!isReducedMotion) {
          earthGroup.rotation.y += 0.002;
        }

        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      threeRef.current = null;
    };
  }, [renderEngine, isDocumentVisible, isReducedMotion, sync3DPositionForEpoch]);

  // Synchronize camera zoom when view perspective changes
  useEffect(() => {
    if (!threeRef.current) return;
    threeRef.current.targetZoom = viewPerspective === 'encounter' ? 75 : 120;
    threeRef.current.currentTarget.set(0, 0, 0);
    sync3DPositionForEpoch(simTimeRef.current);
  }, [viewPerspective, sync3DPositionForEpoch]);

  // -------------------------------------------------------------
  // 2D CANVAS RADAR RENDERING (ACCESSIBILITY & LOW-SPEC FALLBACK)
  // -------------------------------------------------------------
  const render2DRadar = useCallback((epochMs: number) => {
    if (renderEngine !== '2d' || !canvas2dRef.current || !motionData) return;
    const canvas = canvas2dRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 800;
    const height = 500;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Deep space background
    ctx.fillStyle = '#050B1A';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    const kepler = getKeplerianElements();
    const currentDate = new Date(epochMs);
    let state: AsteroidMotionStateVector | any;

    if (kepler) {
      state = propagateElementsClient(kepler, currentDate);
    } else {
      state = motionData.stateVector;
    }

    const isPha = motionData.asteroid.isPotentiallyHazardous;

    if (viewPerspective === 'encounter') {
      // 2D ENCOUNTER RADAR VIEW: Earth at center
      const pxPerLD = Math.min(width, height) / 10;
      const missLD = state.distEarthLunar;
      const missPx = Math.max(24, Math.min(width * 0.44, missLD * pxPerLD));

      // Radar Concentric Distance Rings
      const rings = [0.11, 0.5, 1.0, 2.0, 3.5];
      rings.forEach(r => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r * pxPerLD, 0, Math.PI * 2);
        ctx.strokeStyle = r === 1.0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(148, 163, 184, 0.15)';
        if (r === 1.0) ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        if (showLabels) {
          ctx.fillStyle = r === 1.0 ? '#38BDF8' : '#64748B';
          ctx.font = '10px monospace';
          ctx.fillText(`${r} LD`, centerX + r * pxPerLD + 4, centerY - 4);
        }
      });

      // Central Earth with atmosphere glow
      const earthRadius = 14;
      const glow = ctx.createRadialGradient(centerX, centerY, earthRadius, centerX, centerY, earthRadius + 12);
      glow.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius + 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#1D4ED8';
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (showLabels) {
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Earth', centerX, centerY + 3);
        ctx.textAlign = 'left';
      }

      // Moon Marker (at 1.0 LD)
      if (showMoon) {
        const moonAngle = (epochMs / (27.3 * 86400000)) * Math.PI * 2;
        const moonX = centerX + Math.cos(moonAngle) * 1.0 * pxPerLD;
        const moonY = centerY + Math.sin(moonAngle) * 1.0 * pxPerLD;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#E2E8F0';
        ctx.fill();
        if (showLabels) {
          ctx.fillStyle = '#94A3B8';
          ctx.font = '9px monospace';
          ctx.fillText('Moon', moonX + 6, moonY + 3);
        }
      }

      // Asteroid Position & Trajectory
      const encounterAngle = -Math.PI / 4;
      const astX = centerX + Math.cos(encounterAngle) * missPx;
      const astY = centerY + Math.sin(encounterAngle) * missPx;

      // Trajectory Line
      if (showOrbits) {
        const trajAngle = encounterAngle + Math.PI / 2;
        const trajLen = width * 0.45;
        ctx.beginPath();
        ctx.moveTo(astX - Math.cos(trajAngle) * trajLen, astY - Math.sin(trajAngle) * trajLen);
        ctx.lineTo(astX + Math.cos(trajAngle) * trajLen, astY + Math.sin(trajAngle) * trajLen);
        ctx.strokeStyle = isPha ? '#F87171' : '#F5C451';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Distance Vector Line
      if (showVectors) {
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(astX, astY);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Asteroid Dot
      ctx.beginPath();
      ctx.arc(astX, astY, 6, 0, Math.PI * 2);
      ctx.fillStyle = isPha ? '#EF4444' : '#F59E0B';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (showLabels) {
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(motionData.asteroid.shortName, astX + 10, astY - 6);
        ctx.fillStyle = '#38BDF8';
        ctx.font = '10px monospace';
        ctx.fillText(formatDist(state.distEarthLunar, state.distEarthAU), astX + 10, astY + 8);
      }
    } else {
      // 2D HELIOCENTRIC INNER SYSTEM VIEW: Sun at center
      const pxPerAU = Math.min(width, height) / 3.8;

      // Central Sun
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#FBBF24';
      ctx.fill();
      if (showLabels) {
        ctx.fillStyle = '#050B1A';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Sun', centerX, centerY + 3);
        ctx.textAlign = 'left';
      }

      // Earth Orbit Ring
      if (showOrbits) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 1.0 * pxPerAU, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Earth position
      const earthX = centerX + state.earthPositionAU.x * pxPerAU;
      const earthY = centerY + state.earthPositionAU.y * pxPerAU;
      ctx.beginPath();
      ctx.arc(earthX, earthY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.fill();
      if (showLabels) {
        ctx.fillStyle = '#F8FAFC';
        ctx.font = '10px monospace';
        ctx.fillText('Earth', earthX + 8, earthY + 3);
      }

      // Asteroid Position
      const astX = centerX + state.heliocentricAU.x * pxPerAU;
      const astY = centerY + state.heliocentricAU.y * pxPerAU;

      // Distance Line
      if (showVectors) {
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.moveTo(earthX, earthY);
        ctx.lineTo(astX, astY);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Asteroid marker
      ctx.beginPath();
      ctx.arc(astX, astY, 5, 0, Math.PI * 2);
      ctx.fillStyle = isPha ? '#EF4444' : '#F59E0B';
      ctx.fill();

      if (showLabels) {
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(motionData.asteroid.shortName, astX + 8, astY + 3);
      }
    }
  }, [renderEngine, motionData, getKeplerianElements, viewPerspective, showLabels, showMoon, showOrbits, showVectors, distanceUnit]);

  // Redraw 2D radar on epoch change
  useEffect(() => {
    if (renderEngine === '2d') {
      render2DRadar(simulatedDate.getTime());
    }
  }, [renderEngine, simulatedDate, render2DRadar]);

  return (
    <div className="space-y-6">
      {/* 1. TOP STATUS & ENGINE CONTROLS BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                <Orbit className="w-3.5 h-3.5" />
                Motion Mode • JPL Keplerian Ephemeris
              </span>
              <span className="text-xs text-[#A7B4CC] font-mono">ICRF / J2000 Frame</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight flex items-center gap-2">
              <span>{motionData?.asteroid.name || selectedDes}</span>
              {motionData?.asteroid.isPotentiallyHazardous && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#EF4444]/20 text-[#FCA5A5] border border-[#EF4444]/40">
                  Potentially Hazardous
                </span>
              )}
            </h2>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#A7B4CC] font-mono">Featured NEOs:</span>
            <div className="flex flex-wrap gap-1.5">
              {FAMOUS_NEO_PRESETS.map(preset => (
                <button
                  key={preset.des}
                  onClick={() => handleSelectTarget(preset.des)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    selectedDes === preset.des
                      ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-md shadow-[#38BDF8]/20'
                      : 'bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] hover:bg-[#1E293B] border border-[#1E293B]'
                  }`}
                  title={preset.note}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode Switchers: 3D WebGL vs 2D Radar & Perspectives */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E293B] text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            {/* Perspective Toggle */}
            <div className="flex rounded-xl bg-[#050B1A] p-1 border border-[#1E293B]">
              <button
                onClick={() => setViewPerspective('encounter')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewPerspective === 'encounter'
                    ? 'bg-[#38BDF8] text-[#050B1A]'
                    : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                }`}
                title="Earth-centered flyby geometry (measured in Lunar Distances)"
              >
                Earth Flyby Radar
              </button>
              <button
                onClick={() => setViewPerspective('heliocentric')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewPerspective === 'heliocentric'
                    ? 'bg-[#38BDF8] text-[#050B1A]'
                    : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                }`}
                title="Sun-centered inner Solar System orbit view (measured in AU)"
              >
                Heliocentric Inner System
              </button>
            </div>

            {/* Render Engine Toggle */}
            <div className="flex rounded-xl bg-[#050B1A] p-1 border border-[#1E293B]">
              <button
                onClick={() => setRenderEngine('3d')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  renderEngine === '3d'
                    ? 'bg-[#8B5CF6] text-[#F8FAFC]'
                    : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                }`}
              >
                3D Interactive
              </button>
              <button
                onClick={() => setRenderEngine('2d')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  renderEngine === '2d'
                    ? 'bg-[#8B5CF6] text-[#F8FAFC]'
                    : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                }`}
              >
                2D Radar Canvas
              </button>
            </div>
          </div>

          {/* Display Layer Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowOrbits(!showOrbits)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                showOrbits ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40' : 'bg-[#050B1A] text-[#64748B] border-[#1E293B]'
              }`}
            >
              Orbit: {showOrbits ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowVectors(!showVectors)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                showVectors ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40' : 'bg-[#050B1A] text-[#64748B] border-[#1E293B]'
              }`}
            >
              Vectors: {showVectors ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                showLabels ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40' : 'bg-[#050B1A] text-[#64748B] border-[#1E293B]'
              }`}
            >
              Labels: {showLabels ? 'ON' : 'OFF'}
            </button>

            {/* Moon toggle */}
            {viewPerspective === 'encounter' && (
              <button
                onClick={() => setShowMoon(!showMoon)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                  showMoon ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40' : 'bg-[#050B1A] text-[#64748B] border-[#1E293B]'
                }`}
              >
                Moon: {showMoon ? 'ON' : 'OFF'}
              </button>
            )}

            {/* Distance unit toggle */}
            <div className="flex rounded-lg bg-[#050B1A] p-0.5 border border-[#1E293B]">
              <button
                onClick={() => setDistanceUnit('lunar')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  distanceUnit === 'lunar' ? 'bg-[#38BDF8] text-[#050B1A]' : 'text-[#A7B4CC]'
                }`}
              >
                LD
              </button>
              <button
                onClick={() => setDistanceUnit('km')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  distanceUnit === 'km' ? 'bg-[#38BDF8] text-[#050B1A]' : 'text-[#A7B4CC]'
                }`}
              >
                km
              </button>
              <button
                onClick={() => setDistanceUnit('au')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  distanceUnit === 'au' ? 'bg-[#38BDF8] text-[#050B1A]' : 'text-[#A7B4CC]'
                }`}
              >
                AU
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            {error}
          </div>
        )}
      </div>

      {/* 2. MAIN WORKSPACE: CANVAS (Col Span 2) + TELEMETRY INSPECTOR (Col Span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Orbital Canvas Viewport */}
        <div className="lg:col-span-2 space-y-4">
          <div
            ref={containerRef}
            className="relative rounded-2xl bg-[#050B1A] border border-[#1E293B] overflow-hidden shadow-2xl h-125 flex items-center justify-center group"
          >
            {renderEngine === '3d' ? (
              <canvas ref={webglCanvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />
            ) : (
              <canvas ref={canvas2dRef} className="w-full h-full block" />
            )}

            {/* Overlay Telemetry HUD (Top-Left) */}
            <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#050B1A]/85 backdrop-blur-md border border-[#1E293B] font-mono text-xs space-y-1 pointer-events-none">
              <div className="text-[10px] uppercase text-[#A7B4CC]">
                {viewPerspective === 'encounter' ? 'Earth Flyby Radar View' : 'Heliocentric Ecliptic View'}
              </div>
              <div className="text-sm font-bold text-[#F8FAFC]">
                {motionData?.asteroid.name || selectedDes}
              </div>
              {motionData && (
                <div className="text-[11px] text-[#38BDF8]">
                  Dist to Earth: {formatDist(realtimeDistLD || motionData.stateVector.distEarthLunar, realtimeDistAU || motionData.stateVector.distEarthAU)}
                </div>
              )}
            </div>

            {/* Top-Right HUD Controls: Hint & Reset View */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={resetCameraView}
                className="px-2.5 py-1.5 rounded-xl bg-[#050B1A]/85 hover:bg-[#1E293B] backdrop-blur-md border border-[#1E293B] text-[11px] font-mono text-[#38BDF8] flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                title="Reset camera to default vantage point"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset View</span>
              </button>

              <div className="p-2 rounded-xl bg-[#050B1A]/80 backdrop-blur-md border border-[#1E293B] text-[10px] font-mono text-[#A7B4CC] pointer-events-none hidden sm:block">
                {renderEngine === '3d' ? 'Drag to rotate • Wheel to zoom' : '2D High-DPI Radar Canvas'}
              </div>
            </div>

            {/* Scientific Scaling Disclaimer (Bottom-Left) */}
            <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#A7B4CC] bg-[#050B1A]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1E293B] max-w-sm">
              * Physical sizes of Earth, Moon, and asteroid are visually magnified so surface orientation remains visible. Trajectory geometry and velocities follow true Keplerian elements.
            </div>

            {/* Playback Indicator (Bottom-Right) */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-[#050B1A]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1E293B] text-[10px] font-mono">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 beacon-pulse' : 'bg-amber-400'}`} />
              <span className="text-[#F8FAFC]">{isPlaying ? 'PLAYING MOTION' : 'PAUSED'}</span>
            </div>
          </div>

          {/* 3. TIMELINE & PLAYBACK DOCK */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Play / Pause & Speed Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 text-[#050B1A] hover:bg-amber-400'
                      : 'bg-[#38BDF8] text-[#050B1A] hover:bg-[#38BDF8]/90'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play Motion'}</span>
                </button>

                {/* Speed Multipliers */}
                <div className="flex rounded-lg bg-[#050B1A] p-0.5 border border-[#1E293B] text-[11px] font-mono">
                  {SPEED_PRESETS.map(sp => (
                    <button
                      key={sp.label}
                      onClick={() => setSpeedFactor(sp.factor)}
                      className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                        speedFactor === sp.factor ? 'bg-[#38BDF8] text-[#050B1A]' : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Epoch Actions: Jump to Close Approach & Reset to Now */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <button
                  onClick={jumpToCloseApproach}
                  className="px-3 py-1.5 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/40 hover:border-[#38BDF8] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Jump directly to the predicted closest encounter date"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Jump to Close Approach</span>
                </button>

                <button
                  onClick={resetToNow}
                  className="px-3 py-1.5 rounded-lg bg-[#050B1A] hover:bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Reset simulation epoch to current real-world UTC"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Now (UTC)</span>
                </button>
              </div>
            </div>

            {/* Stepping controls & Timeline Slider */}
            <div className="space-y-2 pt-2 border-t border-[#1E293B]">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[#A7B4CC]">
                  <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Simulation Epoch:</span>
                  <span className="font-bold text-[#F8FAFC]">
                    {simulatedDate.toISOString().replace('T', ' ').slice(0, 19)} UTC
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-[#A7B4CC]">
                  <button
                    onClick={() => stepTime(-24)}
                    className="px-2 py-0.5 rounded bg-[#050B1A] hover:bg-[#0E1B38] border border-[#1E293B] text-[#A7B4CC] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    -1d
                  </button>
                  <button
                    onClick={() => stepTime(-1)}
                    className="px-2 py-0.5 rounded bg-[#050B1A] hover:bg-[#0E1B38] border border-[#1E293B] text-[#A7B4CC] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    -1h
                  </button>
                  <button
                    onClick={() => stepTime(1)}
                    className="px-2 py-0.5 rounded bg-[#050B1A] hover:bg-[#0E1B38] border border-[#1E293B] text-[#A7B4CC] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    +1h
                  </button>
                  <button
                    onClick={() => stepTime(24)}
                    className="px-2 py-0.5 rounded bg-[#050B1A] hover:bg-[#0E1B38] border border-[#1E293B] text-[#A7B4CC] hover:text-[#F8FAFC] cursor-pointer"
                  >
                    +1d
                  </button>
                </div>
              </div>

              {/* Slider (spans -30 days to +30 days relative to base epoch) */}
              <input
                type="range"
                min={-30 * 86400}
                max={30 * 86400}
                step={3600}
                value={Math.round((simulatedDate.getTime() - baseEpoch.getTime()) / 1000)}
                onChange={e => {
                  const offsetSec = parseInt(e.target.value, 10);
                  const newMs = baseEpoch.getTime() + offsetSec * 1000;
                  simTimeRef.current = newMs;
                  const newDate = new Date(newMs);
                  setSimulatedDate(newDate);
                  sync3DPositionForEpoch(newMs);

                  const kepler = getKeplerianElements();
                  if (kepler) {
                    const st = propagateElementsClient(kepler, newDate);
                    setRealtimeDistLD(st.distEarthLunar);
                    setRealtimeDistAU(st.distEarthAU);
                    setRealtimeSpeedKmS(st.orbitalSpeedKmS);
                  }
                }}
                className="w-full accent-[#38BDF8] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
                <span>-30 Days</span>
                <span className="text-[#38BDF8] font-bold">Base Encounter Epoch</span>
                <span>+30 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Inspector Panel (Col Span 1) */}
        <div className="space-y-6">
          {motionData ? (
            <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-5">
              {/* Header with Visual Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#38BDF8] uppercase tracking-wider">
                    Orbital Telemetry
                  </span>
                  <button
                    onClick={onSwitchToListMode}
                    className="text-xs font-mono text-[#A7B4CC] hover:text-[#F8FAFC] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View in Table</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Object Image Preview */}
                <div className="rounded-xl overflow-hidden border border-[#1E293B] bg-[#050B1A]">
                  <AstronomicalImage
                    target={{
                      id: motionData.asteroid.designation.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      name: motionData.asteroid.name,
                      classification: motionData.asteroid.orbitClass
                    }}
                    targetType="small-body"
                    aspectRatio="16/9"
                    className="w-full"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#F8FAFC]">{motionData.asteroid.name}</h3>
                  <p className="text-xs text-[#A7B4CC] font-mono">{motionData.asteroid.orbitClass}</p>
                </div>
              </div>

              {/* Real-time State Vector Telemetry */}
              <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2 text-xs font-mono">
                <div className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">
                  Real-time Dynamics
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#A7B4CC]">
                  <div>
                    <span className="text-[#64748B] block text-[10px]">DISTANCE (EARTH)</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {formatDist(realtimeDistLD || motionData.stateVector.distEarthLunar, realtimeDistAU || motionData.stateVector.distEarthAU)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px]">DISTANCE (SUN)</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {(realtimeDistAU || motionData.stateVector.distSunAU).toFixed(3)} AU
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px]">ORBITAL SPEED</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {(realtimeSpeedKmS || motionData.stateVector.orbitalSpeedKmS).toFixed(1)} km/s
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block text-[10px]">VELOCITY VECTOR</span>
                    <span className="font-bold text-[#F8FAFC]">
                      ({motionData.stateVector.velocityVectorKmS.vx.toFixed(1)}, {motionData.stateVector.velocityVectorKmS.vy.toFixed(1)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Properties & Size Benchmark */}
              <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2 text-xs font-mono">
                <div className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">
                  Physical Scale
                </div>
                <div className="space-y-1 text-[#A7B4CC]">
                  <div className="flex justify-between">
                    <span>Estimated Diameter:</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {motionData.asteroid.diameterMeters.avg} m ({motionData.asteroid.diameterMeters.min}–{motionData.asteroid.diameterMeters.max} m)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absolute Magnitude (H):</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {motionData.asteroid.absoluteMagnitudeH?.toFixed(1) || 'N/A'} mag
                    </span>
                  </div>
                  <div className="pt-1 border-t border-[#1E293B]/60 text-[11px]">
                    <span className="text-[#64748B] block text-[10px]">SCALE BENCHMARK</span>
                    <span className="text-[#F5C451]">
                      {getSizeBenchmark(motionData.asteroid.diameterMeters.avg)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Approach Parameters */}
              {motionData.asteroid.closeApproach && (
                <div className="p-3.5 rounded-xl bg-[#0E1B38] border border-[#38BDF8]/30 space-y-2 text-xs font-mono">
                  <div className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">
                    Nominal Close Approach
                  </div>
                  <div className="space-y-1 text-[#A7B4CC]">
                    <div className="flex justify-between">
                      <span>Predicted Date:</span>
                      <span className="font-bold text-[#F8FAFC]">{motionData.asteroid.closeApproach.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Miss Distance:</span>
                      <span className="font-bold text-[#38BDF8]">
                        {motionData.asteroid.closeApproach.nominalDistanceLD.toFixed(2)} LD ({Math.round(motionData.asteroid.closeApproach.nominalDistanceKm).toLocaleString()} km)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Relative Velocity:</span>
                      <span className="font-bold text-[#F8FAFC]">
                        {motionData.asteroid.closeApproach.relativeVelocityKmS.toFixed(2)} km/s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sentry Impact Risk:</span>
                      <span className="font-bold text-emerald-400">
                        {motionData.asteroid.closeApproach.sentryImpactProbability}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Educational Summary */}
              <div className="text-xs text-[#A7B4CC] leading-relaxed">
                {motionData.asteroid.educationalSummary}
              </div>

              {/* CNEOS Sentry Link */}
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono">
                <a
                  href={motionData.provenance.sentryUrl || 'https://cneos.jpl.nasa.gov/sentry/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#38BDF8] hover:underline flex items-center gap-1.5"
                >
                  <span>Verify on NASA CNEOS Sentry</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] text-[#64748B]">JPL Horizons Ephemeris</span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0B1630] border border-[#1E293B] text-center text-xs font-mono text-[#A7B4CC]">
              {isLoading ? 'Loading orbital telemetries from JPL Small-Body Database...' : 'Loading orbital telemetries from JPL Small-Body Database...'}
            </div>
          )}

          {/* Scientific Transparency Context Box */}
          <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-2 text-xs font-mono text-[#A7B4CC]">
            <div className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Accelerated Playback vs. Live Stream</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Accelerated playback is a mathematical Keplerian orbital simulation calculated using two-body gravitational dynamics and osculating orbital elements from the NASA/JPL Small-Body Database. It does not represent a live camera stream.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsteroidMotionViewer;
