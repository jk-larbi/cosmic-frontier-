import { useState, useEffect, useRef, useCallback, type FC } from 'react';
import * as THREE from 'three';
import type { 
  LiveCloseApproach, 
  AsteroidMotionResponse,
  AsteroidMotionStateVector
} from '../types';
import { fetchAsteroidOrbit } from '../services/liveSpaceService';
import { buildFallbackAsteroidMotionResponse } from '../data/verifiedAsteroidPresets';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import {
  propagateElementsClient,
  type KeplerianElements,
  calculateMajorPlanetPosition,
  generateMajorPlanetOrbitPath,
  type MajorPlanetKey
} from '../utils/orbitalMotion';
import {
  useReducedMotion,
  useDocumentVisibility,
  Easing
} from '../utils/motion';
import { loadPlanetTexture } from '../utils/planetTextureGenerator';
import {
  createAsteroidGeometry,
  createAsteroidMaterial,
  updateAsteroidTumble,
  getAsteroidPhysicalInfo
} from '../utils/asteroidMeshGenerator';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Orbit,
  ArrowRight,
  Clock,
  Eye,
  RefreshCw,
  Search,
  ShieldAlert,
  Info,
  Database,
  AlertCircle
} from 'lucide-react';

interface AsteroidMotionViewerProps {
  initialDesignation?: string;
  allApproaches?: LiveCloseApproach[];
  onSelectApproach?: (approach: LiveCloseApproach) => void;
  onSwitchToListMode: () => void;
}

type RenderEngine = '3d' | '2d';
type ViewPerspective = 'encounter' | 'heliocentric';
type FocusedBody = 'sun' | 'earth' | 'mars' | 'asteroid';

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

// Cached procedural cloud texture to avoid recreating canvas on every mount
let cachedCloudTexture: THREE.CanvasTexture | null = null;
function getCloudTexture(): THREE.CanvasTexture {
  if (cachedCloudTexture) return cachedCloudTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * (canvas.height * 0.8) + canvas.height * 0.1;
    const rx = Math.random() * 160 + 50;
    const ry = Math.random() * 25 + 6;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.sin(x * 0.02) * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  // Major cyclonic storm vortex systems
  for (let s = 0; s < 6; s++) {
    const sx = Math.random() * canvas.width;
    const sy = Math.random() * (canvas.height * 0.6) + canvas.height * 0.2;
    const grad = ctx.createRadialGradient(sx, sy, 5, sx, sy, 40);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  cachedCloudTexture = texture;
  return texture;
}

export const AsteroidMotionViewer: FC<AsteroidMotionViewerProps> = ({
  initialDesignation = '99942',
  allApproaches = [],
  onSelectApproach,
  onSwitchToListMode
}) => {
  const isReducedMotion = useReducedMotion();
  const isDocumentVisible = useDocumentVisibility();

  // Target designation & base data (instant mount with verified preset archive)
  const [selectedDes, setSelectedDes] = useState<string>(initialDesignation);
  const [searchInput, setSearchInput] = useState<string>('');
  const [motionData, setMotionData] = useState<AsteroidMotionResponse | null>(() => {
    try {
      return buildFallbackAsteroidMotionResponse(initialDesignation);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [webGlNotice, setWebGlNotice] = useState<string | null>(null);

  // View & Camera Controls
  const [renderEngine, setRenderEngine] = useState<RenderEngine>('3d');
  const [viewPerspective, setViewPerspective] = useState<ViewPerspective>('heliocentric');
  const [focusedBody, setFocusedBody] = useState<FocusedBody>('asteroid');
  const [distanceUnit, setDistanceUnit] = useState<'lunar' | 'km' | 'au'>('lunar');

  // Display Toggles
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showMoon, setShowMoon] = useState<boolean>(true);
  const [showPlanets, setShowPlanets] = useState<boolean>(true);

  // Time & Playback Controls
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedFactor, setSpeedFactor] = useState<number>(24 * 3600); // 1 day/sec default
  const [baseEpoch, setBaseEpoch] = useState<Date>(new Date());

  // Real-time telemetry state (updated at throttled intervals for React rendering)
  const [realtimeDistLD, setRealtimeDistLD] = useState<number>(() => {
    try {
      const fb = buildFallbackAsteroidMotionResponse(initialDesignation);
      return fb.stateVector.distEarthLunar;
    } catch {
      return 0;
    }
  });
  const [realtimeDistAU, setRealtimeDistAU] = useState<number>(() => {
    try {
      const fb = buildFallbackAsteroidMotionResponse(initialDesignation);
      return fb.stateVector.distEarthAU;
    } catch {
      return 0;
    }
  });
  const [realtimeSpeedKmS, setRealtimeSpeedKmS] = useState<number>(() => {
    try {
      const fb = buildFallbackAsteroidMotionResponse(initialDesignation);
      return fb.stateVector.orbitalSpeedKmS;
    } catch {
      return 0;
    }
  });

  // Container & 2D Canvas Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvas2dRef = useRef<HTMLCanvasElement | null>(null);

  // Simulated Time Ref for 60fps loop
  const simTimeRef = useRef<number>(Date.now());
  const transitAnimRef = useRef<number | null>(null);

  // State refs accessed by 60fps render loop without triggering effect restarts
  const viewPerspectiveRef = useRef<ViewPerspective>(viewPerspective);
  viewPerspectiveRef.current = viewPerspective;

  const focusedBodyRef = useRef<FocusedBody>(focusedBody);
  focusedBodyRef.current = focusedBody;

  const showOrbitsRef = useRef<boolean>(showOrbits);
  showOrbitsRef.current = showOrbits;

  const showVectorsRef = useRef<boolean>(showVectors);
  showVectorsRef.current = showVectors;

  const showMoonRef = useRef<boolean>(showMoon);
  showMoonRef.current = showMoon;

  const showPlanetsRef = useRef<boolean>(showPlanets);
  showPlanetsRef.current = showPlanets;

  const motionDataRef = useRef<AsteroidMotionResponse | null>(motionData);
  motionDataRef.current = motionData;

  const selectedDesRef = useRef<string>(selectedDes);
  selectedDesRef.current = selectedDes;

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const speedFactorRef = useRef<number>(speedFactor);
  speedFactorRef.current = speedFactor;

  // 3D Three.js State
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    sunGroup: THREE.Group;
    earthGroup: THREE.Group;
    earthCloudMesh: THREE.Mesh;
    moonMesh: THREE.Mesh;
    marsGroup: THREE.Group;
    mercuryMesh: THREE.Mesh;
    venusMesh: THREE.Mesh;
    jupiterMesh: THREE.Mesh;
    asteroidMesh: THREE.Mesh;
    asteroidOrbitLine: THREE.Line;
    planetOrbitLines: Record<string, THREE.Line>;
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
    currentAsteroidDes: string;
    lastOrbitPerspective?: ViewPerspective;
    lastOrbitDes?: string;
  } | null>(null);

  // Handle target selection
  const handleSelectTarget = (des: string) => {
    setSelectedDes(des);
    setSearchInput('');
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

  // Load Asteroid Orbit Data (supports genuine network refresh)
  const loadOrbitData = useCallback(async (desToLoad: string, targetEpoch?: Date, isRefresh = false) => {
    const epochIso = targetEpoch ? targetEpoch.toISOString() : undefined;
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res = await fetchAsteroidOrbit({ des: desToLoad, date: epochIso, refresh: isRefresh });
      setMotionData(res);
      setRealtimeDistLD(res.stateVector.distEarthLunar);
      setRealtimeDistAU(res.stateVector.distEarthAU);
      setRealtimeSpeedKmS(res.stateVector.orbitalSpeedKmS);

      // If refresh attempt failed upstream, explain why existing data is retained
      if (isRefresh && res.provenance.lastRefreshAttempt && !res.provenance.lastRefreshAttempt.success) {
        setError(res.provenance.statusExplanation || res.provenance.lastRefreshAttempt.error || 'Live refresh query to NASA/JPL SBDB was unreachable. Existing data is preserved.');
      }

      // If target epoch was not explicitly provided and the asteroid has a close-approach record, set base epoch to that date
      if (!targetEpoch && res.asteroid.closeApproach) {
        const caDate = new Date(res.asteroid.closeApproach.iso);
        if (!isNaN(caDate.getTime())) {
          setBaseEpoch(caDate);
        }
      }
    } catch (err: any) {
      console.warn('[AsteroidMotionViewer] Live JPL SBDB orbit fetch failed, using verified fallback:', err);
      // Ensure existing motionData is preserved if we had any!
      if (!motionData) {
        const fallback = buildFallbackAsteroidMotionResponse(desToLoad, epochIso);
        setMotionData(fallback);
      }
      setError(isRefresh 
        ? 'Live refresh query to NASA/JPL SBDB failed. Preserving current orbital data.' 
        : 'Live JPL SBDB query unavailable. Displaying verified NASA/JPL archive.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [motionData]);

  // Genuine network refresh trigger
  const handleRetryLive = async () => {
    if (isRefreshing || isLoading) return;
    await loadOrbitData(selectedDes, simulatedDate, true);
  };

  // Initial and designation change fetch
  useEffect(() => {
    loadOrbitData(selectedDes, simulatedDate);
  }, [selectedDes]);

  // Keep simulated time ref in sync with React state
  useEffect(() => {
    simTimeRef.current = simulatedDate.getTime();
  }, [simulatedDate]);

  // Synchronize 3D meshes for a given epoch (called inside 60fps Three loop)
  const sync3DPositionForEpoch = useCallback((epochMs: number) => {
    if (!threeRef.current) return;
    const { 
      sunGroup,
      earthGroup, 
      asteroidMesh, 
      moonMesh, 
      marsGroup,
      mercuryMesh,
      venusMesh,
      jupiterMesh,
      asteroidOrbitLine, 
      planetOrbitLines,
      distanceLine, 
      velocityVector,
      currentTarget
    } = threeRef.current;

    const data = motionDataRef.current;
    const currentPerspective = viewPerspectiveRef.current;
    const currentFocus = focusedBodyRef.current;
    const orbitsVisible = showOrbitsRef.current;
    const vectorsVisible = showVectorsRef.current;
    const moonVisible = showMoonRef.current;
    const planetsVisible = showPlanetsRef.current;

    const currentDate = new Date(epochMs);

    // Compute planetary positions via Standish JPL analytical ephemeris
    const earthPos = calculateMajorPlanetPosition('earth', currentDate);
    const marsPos = calculateMajorPlanetPosition('mars', currentDate);
    const mercuryPos = calculateMajorPlanetPosition('mercury', currentDate);
    const venusPos = calculateMajorPlanetPosition('venus', currentDate);
    const jupiterPos = calculateMajorPlanetPosition('jupiter', currentDate);

    // Propagate Asteroid
    let astState: AsteroidMotionStateVector | any = null;
    if (data?.asteroid?.orbitalElements) {
      const el = data.asteroid.orbitalElements;
      const keplerian: KeplerianElements = {
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
      astState = propagateElementsClient(keplerian, currentDate);
    } else if (data?.stateVector) {
      astState = data.stateVector;
    }

    const isPha = data?.asteroid?.isPotentiallyHazardous ?? false;

    // Dynamically sync Asteroid Procedural Topography & PBR Rocky Textures if target changes
    const targetDes = selectedDesRef.current;
    if (threeRef.current.currentAsteroidDes !== targetDes) {
      threeRef.current.currentAsteroidDes = targetDes;
      asteroidMesh.geometry.dispose();
      asteroidMesh.geometry = createAsteroidGeometry(targetDes, 1.5);
      (asteroidMesh.material as THREE.Material).dispose();
      asteroidMesh.material = createAsteroidMaterial(targetDes, isPha);
    } else {
      const mat = asteroidMesh.material as THREE.MeshStandardMaterial;
      if (mat.emissive) {
        mat.emissive.set(isPha ? 0x3B1010 : 0x060606);
        mat.emissiveIntensity = isPha ? 0.35 : 0.1;
      }
    }

    if (currentPerspective === 'encounter') {
      // -------------------------------------------------------------------
      // 1. EARTH FLYBY RADAR PERSPECTIVE (Geocentric Lunar Distance scale)
      // -------------------------------------------------------------------
      earthGroup.position.set(0, 0, 0);
      earthGroup.visible = true;
      sunGroup.visible = false;
      marsGroup.visible = false;
      mercuryMesh.visible = false;
      venusMesh.visible = false;
      jupiterMesh.visible = false;

      // Hide planet orbit lines in encounter mode
      Object.values(planetOrbitLines).forEach(line => {
        line.visible = false;
      });

      const scaleLD = 18.0; // 18 Three.js units = 1 Lunar Distance (384,400 km)
      const missLD = astState ? astState.distEarthLunar : 1.0;
      const relX = astState ? astState.earthRelativeAU.x : 0.002;
      const relY = astState ? astState.earthRelativeAU.y : 0.001;
      const relZ = astState ? astState.earthRelativeAU.z : 0.0005;
      const relNorm = Math.hypot(relX, relY, relZ) || 1;

      const visualDist = Math.max(5.5, Math.min(85, missLD * scaleLD));
      const astX = (relX / relNorm) * visualDist;
      const astY = (relZ / relNorm) * visualDist;
      const astZ = (relY / relNorm) * visualDist;

      asteroidMesh.position.set(astX, astY, astZ);

      // Moon position at 1 LD (18 units)
      const moonAngle = (epochMs / (27.3 * 86400000)) * Math.PI * 2;
      moonMesh.position.set(Math.cos(moonAngle) * 18, 0, Math.sin(moonAngle) * 18);
      moonMesh.visible = moonVisible;

      // Trajectory flyby arc through closest encounter (cached: updated on target/perspective change)
      const needsEncounterOrbitUpdate = 
        threeRef.current.lastOrbitPerspective !== currentPerspective ||
        threeRef.current.lastOrbitDes !== targetDes ||
        !threeRef.current.asteroidOrbitLine.geometry.attributes.position;

      if (needsEncounterOrbitUpdate) {
        threeRef.current.lastOrbitPerspective = currentPerspective;
        threeRef.current.lastOrbitDes = targetDes;
        const trajPoints: THREE.Vector3[] = [];
        const flybyLen = 50;
        const vx = astState?.velocityVectorKmS?.vx ?? 10;
        const vy = astState?.velocityVectorKmS?.vy ?? 5;
        const velAngle = Math.atan2(vy, vx);
        for (let s = -flybyLen; s <= flybyLen; s += 2) {
          trajPoints.push(new THREE.Vector3(
            astX + Math.cos(velAngle) * s,
            astY,
            astZ + Math.sin(velAngle) * s
          ));
        }
        asteroidOrbitLine.geometry.dispose();
        asteroidOrbitLine.geometry = new THREE.BufferGeometry().setFromPoints(trajPoints);
        (asteroidOrbitLine.material as THREE.LineBasicMaterial).color.set(isPha ? 0xF43F5E : 0xF59E0B);
      }
      asteroidOrbitLine.visible = orbitsVisible;

      // Distance line from Earth center to Asteroid (zero-allocation in-place buffer update)
      const distPos = distanceLine.geometry.attributes.position as THREE.BufferAttribute;
      if (distPos) {
        distPos.setXYZ(0, 0, 0, 0);
        distPos.setXYZ(1, astX, astY, astZ);
        distPos.needsUpdate = true;
        distanceLine.computeLineDistances();
        distanceLine.visible = vectorsVisible;
      }

      // Velocity Arrow
      if (astState?.velocityVectorKmS) {
        const dirVec = new THREE.Vector3(
          astState.velocityVectorKmS.vx,
          astState.velocityVectorKmS.vz,
          astState.velocityVectorKmS.vy
        ).normalize();
        velocityVector.position.set(astX, astY, astZ);
        velocityVector.setDirection(dirVec);
        velocityVector.setLength(7);
        velocityVector.visible = vectorsVisible;
      }

      // Camera Target in Encounter Perspective
      if (currentFocus === 'asteroid') {
        currentTarget.set(astX, astY, astZ);
      } else {
        currentTarget.set(0, 0, 0);
      }
    } else {
      // -------------------------------------------------------------------
      // 2. HELIOCENTRIC SOLAR SYSTEM PERSPECTIVE (Inner System AU Scale)
      // -------------------------------------------------------------------
      const scaleAU = 32.0; // 32 Three.js units = 1 AU

      // Sun at center
      sunGroup.position.set(0, 0, 0);
      sunGroup.visible = true;
      moonMesh.visible = false;

      // Earth Position
      const earthX = earthPos.xAU * scaleAU;
      const earthY = earthPos.zAU * scaleAU;
      const earthZ = earthPos.yAU * scaleAU;
      earthGroup.position.set(earthX, earthY, earthZ);
      earthGroup.visible = true;

      // Mars Position
      const marsX = marsPos.xAU * scaleAU;
      const marsY = marsPos.zAU * scaleAU;
      const marsZ = marsPos.yAU * scaleAU;
      marsGroup.position.set(marsX, marsY, marsZ);
      marsGroup.visible = planetsVisible;

      // Mercury Position
      const mercX = mercuryPos.xAU * scaleAU;
      const mercY = mercuryPos.zAU * scaleAU;
      const mercZ = mercuryPos.yAU * scaleAU;
      mercuryMesh.position.set(mercX, mercY, mercZ);
      mercuryMesh.visible = planetsVisible;

      // Venus Position
      const venX = venusPos.xAU * scaleAU;
      const venY = venusPos.zAU * scaleAU;
      const venZ = venusPos.yAU * scaleAU;
      venusMesh.position.set(venX, venY, venZ);
      venusMesh.visible = planetsVisible;

      // Jupiter Position
      const jupX = jupiterPos.xAU * scaleAU;
      const jupY = jupiterPos.zAU * scaleAU;
      const jupZ = jupiterPos.yAU * scaleAU;
      jupiterMesh.position.set(jupX, jupY, jupZ);
      jupiterMesh.visible = planetsVisible;

      // Show/Hide planetary orbit lines
      Object.entries(planetOrbitLines).forEach(([key, line]) => {
        line.visible = orbitsVisible && (key === 'earth' || planetsVisible);
      });

      // Asteroid Position
      if (astState) {
        const astX = astState.heliocentricAU.x * scaleAU;
        const astY = astState.heliocentricAU.z * scaleAU;
        const astZ = astState.heliocentricAU.y * scaleAU;
        asteroidMesh.position.set(astX, astY, astZ);

        // Distance Line from Earth to Asteroid (zero-allocation in-place buffer update)
        const distPos = distanceLine.geometry.attributes.position as THREE.BufferAttribute;
        if (distPos) {
          distPos.setXYZ(0, earthX, earthY, earthZ);
          distPos.setXYZ(1, astX, astY, astZ);
          distPos.needsUpdate = true;
          distanceLine.computeLineDistances();
          distanceLine.visible = vectorsVisible;
        }

        // Velocity Arrow
        if (astState.velocityVectorKmS) {
          const dirVec = new THREE.Vector3(
            astState.velocityVectorKmS.vx,
            astState.velocityVectorKmS.vz,
            astState.velocityVectorKmS.vy
          ).normalize();
          velocityVector.position.set(astX, astY, astZ);
          velocityVector.setDirection(dirVec);
          velocityVector.setLength(8);
          velocityVector.visible = vectorsVisible;
        }

        // Camera target tracking in Heliocentric mode
        if (currentFocus === 'asteroid') {
          currentTarget.set(astX, astY, astZ);
        } else if (currentFocus === 'earth') {
          currentTarget.set(earthX, earthY, earthZ);
        } else if (currentFocus === 'mars') {
          currentTarget.set(marsX, marsY, marsZ);
        } else {
          currentTarget.set(0, 0, 0); // Sun
        }
      }

      // Asteroid Orbit Path Line (cached: only recomputed on target or perspective change)
      const needsHeliocentricOrbitUpdate = 
        threeRef.current.lastOrbitPerspective !== currentPerspective ||
        threeRef.current.lastOrbitDes !== targetDes ||
        !threeRef.current.asteroidOrbitLine.geometry.attributes.position;

      if (needsHeliocentricOrbitUpdate && data?.trajectories?.asteroidOrbitPath) {
        threeRef.current.lastOrbitPerspective = currentPerspective;
        threeRef.current.lastOrbitDes = targetDes;
        const orbitPts = data.trajectories.asteroidOrbitPath.map(
          pt => new THREE.Vector3(pt.x * scaleAU, pt.z * scaleAU, pt.y * scaleAU)
        );
        asteroidOrbitLine.geometry.dispose();
        asteroidOrbitLine.geometry = new THREE.BufferGeometry().setFromPoints(orbitPts);
        (asteroidOrbitLine.material as THREE.LineBasicMaterial).color.set(isPha ? 0xF43F5E : 0xF59E0B);
      }
      asteroidOrbitLine.visible = orbitsVisible;
    }
  }, []);

  // -------------------------------------------------------------
  // THREE.JS 3D SCENE SETUP & SMOOTH CAMERA EASING
  // Initialized cleanly on container mount or renderEngine change
  // -------------------------------------------------------------
  useEffect(() => {
    if (renderEngine !== '3d' || !containerRef.current) return;
    const container = containerRef.current;

    // Clean existing children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 800;
    const height = Math.max(500, container.clientHeight || 520);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040A);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 45, 95);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      container.appendChild(renderer.domElement);
    } catch (err: any) {
      console.warn('[AsteroidMotionViewer] WebGLRenderer creation failed, using 2D radar fallback:', err);
      setWebGlNotice('WebGL acceleration unavailable. Automatically switched to high-DPI 2D radar.');
      setRenderEngine('2d');
      return;
    }

    // 1. Lighting (Sun is the primary directional illumination source in deep space)
    const ambientLight = new THREE.AmbientLight(0x1E293B, 0.35);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xFFF9E6, 2.6, 1200, 0.4);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const fillLight = new THREE.DirectionalLight(0x38BDF8, 0.15);
    fillLight.position.set(50, 70, 50);
    scene.add(fillLight);

    // 2. Cinematic Multi-Tier Deep Space Starfield
    const starGroup = new THREE.Group();

    // Tier 1: Microscopic distant background stars (3000 points)
    const distantStarGeo = new THREE.BufferGeometry();
    const distantCount = 3000;
    const distantPositions = new Float32Array(distantCount * 3);
    for (let i = 0; i < distantCount * 3; i += 3) {
      const radius = 700 + Math.random() * 700;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      distantPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      distantPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      distantPositions[i + 2] = radius * Math.cos(phi);
    }
    distantStarGeo.setAttribute('position', new THREE.BufferAttribute(distantPositions, 3));
    const distantStarMat = new THREE.PointsMaterial({
      color: 0xE2E8F0,
      size: 1.0,
      transparent: true,
      opacity: 0.75
    });
    starGroup.add(new THREE.Points(distantStarGeo, distantStarMat));

    // Tier 2: Prominent navigation stars with realistic stellar spectral colors (350 points)
    const brightStarGeo = new THREE.BufferGeometry();
    const brightCount = 350;
    const brightPositions = new Float32Array(brightCount * 3);
    const brightColors = new Float32Array(brightCount * 3);

    const spectralColors = [
      new THREE.Color(0x93C5FD), // O/B blue-white
      new THREE.Color(0xBAE6FD), // A-type white-blue
      new THREE.Color(0xF8FAFC), // F-type white
      new THREE.Color(0xFDE047), // G-type yellow (Sun-like)
      new THREE.Color(0xFDBA74), // K-type orange
      new THREE.Color(0xFCA5A5)  // M-type red
    ];

    for (let i = 0; i < brightCount * 3; i += 3) {
      const radius = 650 + Math.random() * 600;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      brightPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      brightPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      brightPositions[i + 2] = radius * Math.cos(phi);

      const col = spectralColors[Math.floor(Math.random() * spectralColors.length)];
      brightColors[i] = col.r;
      brightColors[i + 1] = col.g;
      brightColors[i + 2] = col.b;
    }
    brightStarGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
    brightStarGeo.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));
    const brightStarMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });
    starGroup.add(new THREE.Points(brightStarGeo, brightStarMat));

    // Tier 3: Milky Way galactic dust plane (1500 particles)
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyCount = 1500;
    const galaxyPositions = new Float32Array(galaxyCount * 3);
    for (let i = 0; i < galaxyCount * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const r = 750 + Math.random() * 450;
      const spread = (Math.random() - 0.5) * 80;
      galaxyPositions[i] = Math.cos(angle) * r;
      galaxyPositions[i + 1] = spread;
      galaxyPositions[i + 2] = Math.sin(angle) * r;
    }
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
    const galaxyMat = new THREE.PointsMaterial({
      color: 0x94A3B8,
      size: 2.5,
      transparent: true,
      opacity: 0.18
    });
    starGroup.add(new THREE.Points(galaxyGeo, galaxyMat));

    scene.add(starGroup);

    // 3. Central Sun Group (Granulated plasma photosphere + multi-tier coronal glow)
    const sunGroup = new THREE.Group();
    const sunMat = new THREE.MeshBasicMaterial();
    const sunTex = loadPlanetTexture('sun', (tex) => {
      sunMat.map = tex;
      sunMat.needsUpdate = true;
    });
    sunMat.map = sunTex;
    const sunGeo = new THREE.SphereGeometry(4.2, 48, 48);
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Inner Photosphere Corona
    const coronaGeo = new THREE.SphereGeometry(4.8, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xFDE047,
      transparent: true,
      opacity: 0.32,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    sunGroup.add(new THREE.Mesh(coronaGeo, coronaMat));

    // Outer Solar Corona Halo
    const outerCoronaGeo = new THREE.SphereGeometry(6.0, 32, 32);
    const outerCoronaMat = new THREE.MeshBasicMaterial({
      color: 0xF97316,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    sunGroup.add(new THREE.Mesh(outerCoronaGeo, outerCoronaMat));
    scene.add(sunGroup);

    // 4. Central Earth Group (Surface reflectance + cloud deck + Rayleigh limb)
    const earthGroup = new THREE.Group();
    const earthMat = new THREE.MeshStandardMaterial({
      roughness: 0.65,
      metalness: 0.1
    });
    const earthTex = loadPlanetTexture('earth', (tex) => {
      earthMat.map = tex;
      earthMat.needsUpdate = true;
    });
    earthMat.map = earthTex;
    const earthGeo = new THREE.SphereGeometry(3.2, 48, 48);
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Dynamic Concentric Cloud Deck (rotating at differential speed, cached texture)
    const cloudTex = getCloudTexture();
    const cloudGeo = new THREE.SphereGeometry(3.235, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.40,
      depthWrite: false,
      roughness: 0.95
    });
    const earthCloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(earthCloudMesh);

    // Earth Rayleigh Atmospheric Scattering Halo
    const atmoGeo = new THREE.SphereGeometry(3.32, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    earthGroup.add(new THREE.Mesh(atmoGeo, atmoMat));
    scene.add(earthGroup);

    // 5. Moon Mesh & Orbit
    const moonMat = new THREE.MeshStandardMaterial({
      roughness: 0.92,
      metalness: 0.05
    });
    const moonTex = loadPlanetTexture('moon', (tex) => {
      moonMat.map = tex;
      moonMat.needsUpdate = true;
    });
    moonMat.map = moonTex;
    const moonGeo = new THREE.SphereGeometry(0.85, 24, 24);
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);

    const moonOrbitGeo = new THREE.BufferGeometry();
    const moonPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const th = (i / 64) * Math.PI * 2;
      moonPts.push(new THREE.Vector3(Math.cos(th) * 18, 0, Math.sin(th) * 18));
    }
    moonOrbitGeo.setFromPoints(moonPts);
    const moonOrbitLine = new THREE.Line(
      moonOrbitGeo, 
      new THREE.LineDashedMaterial({ color: 0x38BDF8, dashSize: 1, gapSize: 1, transparent: true, opacity: 0.6 })
    );
    moonOrbitLine.computeLineDistances();
    scene.add(moonOrbitLine);

    // 6. Mars Group (Volcanic surface + thin atmosphere)
    const marsGroup = new THREE.Group();
    const marsMat = new THREE.MeshStandardMaterial({
      roughness: 0.88,
      metalness: 0.05
    });
    const marsTex = loadPlanetTexture('mars', (tex) => {
      marsMat.map = tex;
      marsMat.needsUpdate = true;
    });
    marsMat.map = marsTex;
    const marsGeo = new THREE.SphereGeometry(2.0, 32, 32);
    const marsMesh = new THREE.Mesh(marsGeo, marsMat);
    marsGroup.add(marsMesh);

    const marsAtmoGeo = new THREE.SphereGeometry(2.07, 24, 24);
    const marsAtmoMat = new THREE.MeshBasicMaterial({
      color: 0xF87171,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    marsGroup.add(new THREE.Mesh(marsAtmoGeo, marsAtmoMat));
    scene.add(marsGroup);

    // 7. Other Inner Planets
    const mercMat = new THREE.MeshStandardMaterial({ roughness: 0.95 });
    const mercTex = loadPlanetTexture('mercury', (tex) => {
      mercMat.map = tex;
      mercMat.needsUpdate = true;
    });
    mercMat.map = mercTex;
    const mercGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const mercuryMesh = new THREE.Mesh(mercGeo, mercMat);
    scene.add(mercuryMesh);

    const venMat = new THREE.MeshStandardMaterial({ roughness: 0.82 });
    const venTex = loadPlanetTexture('venus', (tex) => {
      venMat.map = tex;
      venMat.needsUpdate = true;
    });
    venMat.map = venTex;
    const venGeo = new THREE.SphereGeometry(2.8, 32, 32);
    const venusMesh = new THREE.Mesh(venGeo, venMat);
    scene.add(venusMesh);

    const jupMat = new THREE.MeshStandardMaterial({ roughness: 0.68 });
    const jupTex = loadPlanetTexture('jupiter', (tex) => {
      jupMat.map = tex;
      jupMat.needsUpdate = true;
    });
    jupMat.map = jupTex;
    const jupGeo = new THREE.SphereGeometry(5.0, 48, 48);
    const jupiterMesh = new THREE.Mesh(jupGeo, jupMat);
    scene.add(jupiterMesh);

    // 8. Planetary Orbit Lines (calculated using JPL Standish orbit paths)
    const scaleAU = 32.0;
    const planetOrbitLines: Record<string, THREE.Line> = {};

    const majorPlanets: MajorPlanetKey[] = ['mercury', 'venus', 'earth', 'mars', 'jupiter'];
    majorPlanets.forEach(pKey => {
      const pathPts = generateMajorPlanetOrbitPath(pKey, new Date(), 96).map(
        pt => new THREE.Vector3(pt.x * scaleAU, pt.z * scaleAU, pt.y * scaleAU)
      );
      const pGeo = new THREE.BufferGeometry().setFromPoints(pathPts);
      const pColor = pKey === 'earth' ? 0x38BDF8 : pKey === 'mars' ? 0xFB923C : 0x64748B;
      const pMat = new THREE.LineBasicMaterial({ color: pColor, transparent: true, opacity: pKey === 'earth' ? 0.55 : 0.35 });
      const pLine = new THREE.Line(pGeo, pMat);
      scene.add(pLine);
      planetOrbitLines[pKey] = pLine;
    });

    // 9. Asteroid Mesh (Authentic non-spherical procedural geometry & PBR rock materials)
    const initialIsPha = motionData?.asteroid?.isPotentiallyHazardous ?? false;
    const asteroidGeo = createAsteroidGeometry(selectedDes, 1.5);
    const asteroidMat = createAsteroidMaterial(selectedDes, initialIsPha);
    const asteroidMesh = new THREE.Mesh(asteroidGeo, asteroidMat);
    scene.add(asteroidMesh);

    // 10. Asteroid Orbit Line
    const asteroidOrbitGeo = new THREE.BufferGeometry();
    const asteroidOrbitMat = new THREE.LineBasicMaterial({
      color: initialIsPha ? 0xF43F5E : 0xF59E0B,
      transparent: true,
      opacity: 0.85
    });
    const asteroidOrbitLine = new THREE.Line(asteroidOrbitGeo, asteroidOrbitMat);
    scene.add(asteroidOrbitLine);

    // 11. Distance Line (Earth to Asteroid with allocated buffer)
    const distGeo = new THREE.BufferGeometry();
    distGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const distMat = new THREE.LineDashedMaterial({ color: 0x94A3B8, dashSize: 0.8, gapSize: 0.6 });
    const distanceLine = new THREE.Line(distGeo, distMat);
    scene.add(distanceLine);

    // 12. Velocity Vector Arrow
    const velocityVector = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      8,
      0x38BDF8,
      2,
      1
    );
    scene.add(velocityVector);

    // 13. State Reference for 60fps render loop
    threeRef.current = {
      scene,
      camera,
      renderer,
      sunGroup,
      earthGroup,
      earthCloudMesh,
      moonMesh,
      marsGroup,
      mercuryMesh,
      venusMesh,
      jupiterMesh,
      asteroidMesh,
      asteroidOrbitLine,
      planetOrbitLines,
      distanceLine,
      velocityVector,
      isDragging: false,
      prevMouse: { x: 0, y: 0 },
      currentRotation: { x: 0.35, y: -0.4 },
      targetRotation: { x: 0.35, y: -0.4 },
      currentZoom: 85,
      targetZoom: 85,
      cameraTarget: new THREE.Vector3(0, 0, 0),
      currentTarget: new THREE.Vector3(0, 0, 0),
      currentAsteroidDes: selectedDes
    };

    // Synchronize initial positions
    sync3DPositionForEpoch(simTimeRef.current);

    // Mouse Drag Controls
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
      threeRef.current.targetRotation.x = Math.max(-1.45, Math.min(1.45, threeRef.current.targetRotation.x + dy * 0.008));
      threeRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      if (threeRef.current) threeRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!threeRef.current) return;
      threeRef.current.targetZoom = Math.max(15, Math.min(260, threeRef.current.targetZoom + e.deltaY * 0.08));
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvasDom.addEventListener('wheel', onWheel, { passive: false });

    // Touch Controls
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
        threeRef.current.targetRotation.x = Math.max(-1.45, Math.min(1.45, threeRef.current.targetRotation.x + dy * 0.008));
        threeRef.current.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = touchStartDist - dist;
        touchStartDist = dist;
        threeRef.current.targetZoom = Math.max(15, Math.min(260, threeRef.current.targetZoom + delta * 0.15));
      }
    };

    const onTouchEnd = () => {
      if (threeRef.current) threeRef.current.isDragging = false;
    };

    canvasDom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container || !threeRef.current) return;
      const w = container.clientWidth || 800;
      const h = Math.max(500, container.clientHeight || 520);
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 60fps Single Unified Render & Propagation Loop
    let animId: number;
    let lastTime = performance.now();
    let lastHudTime = 0;

    const render = (now: number) => {
      if (threeRef.current && isDocumentVisible) {
        const { 
          camera, 
          scene: activeScene, 
          renderer: activeRenderer, 
          currentRotation, 
          targetRotation, 
          currentZoom, 
          targetZoom, 
          cameraTarget, 
          currentTarget, 
          earthGroup: activeEarth,
          earthCloudMesh: activeEarthClouds,
          marsGroup: activeMars,
          asteroidMesh: activeAsteroid
        } = threeRef.current;

        // Delta time capped to 100ms prevents time-travel explosions on tab switch or frame stall
        const deltaSec = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        // Advance simulated time if playing
        if (isPlayingRef.current) {
          const timeAdvanceMs = deltaSec * speedFactorRef.current * 1000;
          simTimeRef.current += timeAdvanceMs;

          // Throttle React state & HUD updates to ~10Hz
          if (now - lastHudTime > 100) {
            lastHudTime = now;
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
        }

        // Synchronize positions for current epoch
        sync3DPositionForEpoch(simTimeRef.current);

        // Smooth camera lerp
        const lerpFactor = isReducedMotion ? 1.0 : 0.08;
        currentRotation.x += (targetRotation.x - currentRotation.x) * lerpFactor;
        currentRotation.y += (targetRotation.y - currentRotation.y) * lerpFactor;
        threeRef.current.currentZoom += (targetZoom - currentZoom) * lerpFactor;
        cameraTarget.lerp(currentTarget, lerpFactor);

        // Compute Cartesian position from spherical angles and target
        const cy = Math.cos(currentRotation.x) * threeRef.current.currentZoom;
        camera.position.x = cameraTarget.x + Math.sin(currentRotation.y) * cy;
        camera.position.y = cameraTarget.y + Math.sin(currentRotation.x) * threeRef.current.currentZoom;
        camera.position.z = cameraTarget.z + Math.cos(currentRotation.y) * cy;
        camera.lookAt(cameraTarget);

        // Gentle axial rotation & realistic asteroid tumbling scaled by deltaSec
        if (!isReducedMotion) {
          activeEarth.rotation.y += deltaSec * 0.15;
          if (activeEarthClouds) {
            activeEarthClouds.rotation.y += deltaSec * 0.20;
          }
          activeMars.rotation.y += deltaSec * 0.12;
          updateAsteroidTumble(activeAsteroid, deltaSec, selectedDesRef.current);
        }

        activeRenderer.render(activeScene, camera);
      } else {
        lastTime = now;
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvasDom.removeEventListener('wheel', onWheel);
      canvasDom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      // Deep GPU resource disposal to prevent WebGL memory leaks
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
          if (obj.geometry) {
            obj.geometry.dispose();
          }
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(canvasDom)) {
        container.removeChild(canvasDom);
      }
      threeRef.current = null;
    };
  }, [renderEngine, isDocumentVisible, isReducedMotion, sync3DPositionForEpoch]);

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
    threeRef.current.targetZoom = viewPerspective === 'encounter' ? 75 : 85;
    threeRef.current.currentTarget.set(0, 0, 0);
    setFocusedBody('asteroid');
  };

  // Focus specific body
  const handleFocusBody = (body: FocusedBody) => {
    setFocusedBody(body);
    if (!threeRef.current) return;
    if (body === 'sun') {
      threeRef.current.targetZoom = 110;
    } else if (body === 'earth') {
      threeRef.current.targetZoom = 45;
    } else if (body === 'mars') {
      threeRef.current.targetZoom = 40;
    } else {
      threeRef.current.targetZoom = viewPerspective === 'encounter' ? 65 : 55;
    }
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
  // 2D CANVAS RADAR RENDERING (ACCESSIBILITY & LOW-SPEC FALLBACK)
  // -------------------------------------------------------------
  const render2DRadar = useCallback((epochMs: number) => {
    if (renderEngine !== '2d' || !canvas2dRef.current || !motionData) return;
    const canvas = canvas2dRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 800;
    const height = Math.max(500, canvas.parentElement?.clientHeight || 520);

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
      // -----------------------------------------------------------
      // Geocentric Encounter Radar: Earth at center, Lunar Distances
      // -----------------------------------------------------------
      const pxPerLD = Math.min(width, height) / 10;

      // Range Rings: 0.5 LD, 1.0 LD (Moon), 2.0 LD, 3.0 LD, 4.0 LD
      const rings = [0.5, 1.0, 2.0, 3.0, 4.0];
      rings.forEach(rLD => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, rLD * pxPerLD, 0, Math.PI * 2);
        ctx.strokeStyle = rLD === 1.0 ? '#38BDF8' : '#1E293B';
        ctx.lineWidth = rLD === 1.0 ? 1.5 : 1;
        if (rLD === 1.0) ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#64748B';
        ctx.font = '10px monospace';
        ctx.fillText(`${rLD} LD`, centerX + rLD * pxPerLD + 4, centerY - 4);
      });

      // Earth at center
      ctx.beginPath();
      ctx.arc(centerX, centerY, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#1E40AF';
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (showLabels) {
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('Earth', centerX + 12, centerY + 4);
      }

      // Moon position at 1 LD
      if (showMoon) {
        const moonAngle = (epochMs / (27.3 * 86400000)) * Math.PI * 2;
        const moonX = centerX + Math.cos(moonAngle) * pxPerLD;
        const moonY = centerY + Math.sin(moonAngle) * pxPerLD;

        ctx.beginPath();
        ctx.arc(moonX, moonY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#CBD5E1';
        ctx.fill();

        if (showLabels) {
          ctx.fillStyle = '#94A3B8';
          ctx.font = '10px monospace';
          ctx.fillText('Moon (1 LD)', moonX + 6, moonY + 3);
        }
      }

      // Asteroid Position
      const missLD = state.distEarthLunar;
      const relNorm = Math.hypot(state.earthRelativeAU.x, state.earthRelativeAU.y) || 1;
      const astX = centerX + (state.earthRelativeAU.x / relNorm) * missLD * pxPerLD;
      const astY = centerY + (state.earthRelativeAU.y / relNorm) * missLD * pxPerLD;

      // Trajectory Line
      if (showOrbits) {
        const flybyLen = 140;
        const velAngle = Math.atan2(state.velocityVectorKmS.vy, state.velocityVectorKmS.vx);
        ctx.beginPath();
        ctx.moveTo(astX - Math.cos(velAngle) * flybyLen, astY - Math.sin(velAngle) * flybyLen);
        ctx.lineTo(astX + Math.cos(velAngle) * flybyLen, astY + Math.sin(velAngle) * flybyLen);
        ctx.strokeStyle = isPha ? '#EF4444' : '#F59E0B';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Distance Line (Earth to Asteroid)
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

      // Asteroid Marker
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
        ctx.fillText(motionData.asteroid.shortName, astX + 9, astY + 4);
      }
    } else {
      // -----------------------------------------------------------
      // Heliocentric Inner System: Sun at center, AU scale
      // -----------------------------------------------------------
      const pxPerAU = Math.min(width, height) / 4.5;

      // Range Rings: 0.5 AU, 1.0 AU (Earth), 1.52 AU (Mars)
      const auRings = [0.5, 1.0, 1.52, 2.0];
      auRings.forEach(rAU => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, rAU * pxPerAU, 0, Math.PI * 2);
        ctx.strokeStyle = rAU === 1.0 ? '#38BDF8' : rAU === 1.52 ? '#EF4444' : '#1E293B';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = '10px monospace';
        ctx.fillText(`${rAU} AU`, centerX + rAU * pxPerAU + 4, centerY - 4);
      });

      // Sun at center
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#FBBF24';
      ctx.fill();

      if (showLabels) {
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('Sun', centerX + 14, centerY + 4);
      }

      // Earth Position
      const earthPos = calculateMajorPlanetPosition('earth', currentDate);
      const earthX = centerX + earthPos.xAU * pxPerAU;
      const earthY = centerY + earthPos.yAU * pxPerAU;

      ctx.beginPath();
      ctx.arc(earthX, earthY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#1E40AF';
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (showLabels) {
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('Earth', earthX + 8, earthY + 3);
      }

      // Mars Position
      if (showPlanets) {
        const marsPos = calculateMajorPlanetPosition('mars', currentDate);
        const marsX = centerX + marsPos.xAU * pxPerAU;
        const marsY = centerY + marsPos.yAU * pxPerAU;

        ctx.beginPath();
        ctx.arc(marsX, marsY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();

        if (showLabels) {
          ctx.fillStyle = '#FCA5A5';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('Mars', marsX + 7, marsY + 3);
        }
      }

      // Asteroid Position
      const astX = centerX + state.heliocentricAU.x * pxPerAU;
      const astY = centerY + state.heliocentricAU.y * pxPerAU;

      // Distance Line from Earth
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
      ctx.arc(astX, astY, 6, 0, Math.PI * 2);
      ctx.fillStyle = isPha ? '#EF4444' : '#F59E0B';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (showLabels) {
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(motionData.asteroid.shortName, astX + 8, astY + 3);
      }
    }
  }, [renderEngine, motionData, getKeplerianElements, viewPerspective, showLabels, showMoon, showPlanets, showOrbits, showVectors]);

  // Redraw 2D radar on epoch change
  useEffect(() => {
    if (renderEngine === '2d') {
      render2DRadar(simulatedDate.getTime());
    }
  }, [renderEngine, simulatedDate, render2DRadar]);

  // Playback animation loop for 2D Radar Canvas fallback mode
  useEffect(() => {
    if (renderEngine !== '2d' || !isPlaying) return;
    let animId: number;
    let lastTime = performance.now();
    let lastHudTime = 0;

    const tick2D = (now: number) => {
      if (!isDocumentVisible) {
        lastTime = now;
        animId = requestAnimationFrame(tick2D);
        return;
      }

      const deltaSec = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const timeAdvanceMs = deltaSec * speedFactor * 1000;
      simTimeRef.current += timeAdvanceMs;

      render2DRadar(simTimeRef.current);

      if (now - lastHudTime > 100) {
        lastHudTime = now;
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

      animId = requestAnimationFrame(tick2D);
    };

    lastTime = performance.now();
    animId = requestAnimationFrame(tick2D);

    return () => cancelAnimationFrame(animId);
  }, [renderEngine, isPlaying, speedFactor, isDocumentVisible, render2DRadar, getKeplerianElements]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TELEMETRY CONTROLS BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                <Orbit className="w-3.5 h-3.5" />
                Live Motion Observatory
              </span>

              {/* Provenance Badge */}
              {motionData?.provenance ? (
                motionData.provenance.retrievalStatus === 'live' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Live response (JPL SBDB)
                  </span>
                ) : motionData.provenance.retrievalStatus === 'cached' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                    <Database className="w-3.5 h-3.5" />
                    Cached response (JPL Feed)
                  </span>
                ) : motionData.provenance.retrievalStatus === 'archive' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    Verified archive
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    <Orbit className="w-3.5 h-3.5" />
                    Local propagation
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-500/10 text-slate-300 border border-slate-500/30">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Source status unavailable
                </span>
              )}

              <span className="text-xs text-[#A7B4CC] font-mono">ICRF / J2000 Frame</span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight flex items-center gap-2">
                <span>{motionData?.asteroid.name || selectedDes}</span>
                {motionData?.asteroid.isPotentiallyHazardous && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#EF4444]/20 text-[#FCA5A5] border border-[#EF4444]/40 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    Potentially Hazardous
                  </span>
                )}
              </h2>

              <button
                onClick={handleRetryLive}
                disabled={isRefreshing || isLoading}
                className={`px-2.5 py-1 rounded-lg bg-[#050B1A] hover:bg-[#1E293B] text-[#38BDF8] border border-[#1E293B] transition-all flex items-center gap-1.5 ${
                  isRefreshing ? 'cursor-not-allowed opacity-75' : 'cursor-pointer active:scale-95'
                }`}
                title="Trigger genuine live network query to NASA/JPL SBDB"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-[11px] font-mono font-bold">
                  {isRefreshing ? 'Querying...' : 'Retry Live'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Preset Selector & Search Input */}
          <div className="space-y-2">
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

            {/* Custom Search Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchInput.trim()) {
                  handleSelectTarget(searchInput.trim());
                }
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Target designation (e.g. 99942, Eros)..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs font-mono rounded-lg bg-[#050B1A] border border-[#1E293B] text-[#F8FAFC] placeholder-[#64748B] focus:border-[#38BDF8] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/40 text-xs font-mono font-bold cursor-pointer transition-all"
              >
                Track
              </button>
            </form>
          </div>
        </div>

        {/* Mode Switchers: 3D WebGL vs 2D Radar & Perspectives & Camera Focus */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E293B] text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            {/* Perspective Toggle */}
            <div className="flex rounded-xl bg-[#050B1A] p-1 border border-[#1E293B]">
              <button
                onClick={() => {
                  setViewPerspective('heliocentric');
                  if (threeRef.current) {
                    threeRef.current.targetZoom = 85;
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewPerspective === 'heliocentric'
                    ? 'bg-[#38BDF8] text-[#050B1A]'
                    : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                }`}
                title="Sun-centered Solar System orbit view (inner planets and asteroid orbit)"
              >
                Solar System Heliocentric
              </button>
              <button
                onClick={() => {
                  setViewPerspective('encounter');
                  if (threeRef.current) {
                    threeRef.current.targetZoom = 70;
                  }
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  viewPerspective === 'encounter'
                    ? 'bg-[#38BDF8] text-[#050B1A]'
                    : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                }`}
                title="Earth-centered flyby radar geometry (measured in Lunar Distances)"
              >
                Earth Flyby Radar
              </button>
            </div>

            {/* Object Focus Selection (Smooth Tracking) */}
            <div className="flex items-center gap-1.5 bg-[#050B1A] px-2.5 py-1 rounded-xl border border-[#1E293B]">
              <span className="text-[#64748B] flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                Focus:
              </span>
              {(['asteroid', 'earth', 'mars', 'sun'] as FocusedBody[]).map(bodyKey => (
                <button
                  key={bodyKey}
                  onClick={() => handleFocusBody(bodyKey)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize transition-all cursor-pointer ${
                    focusedBody === bodyKey
                      ? 'bg-[#8B5CF6] text-[#F8FAFC]'
                      : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                  }`}
                >
                  {bodyKey}
                </button>
              ))}
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
              Orbits: {showOrbits ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowPlanets(!showPlanets)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                showPlanets ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40' : 'bg-[#050B1A] text-[#64748B] border-[#1E293B]'
              }`}
            >
              Planets: {showPlanets ? 'ON' : 'OFF'}
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

            {/* Moon toggle for Encounter view */}
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

        {webGlNotice && (
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono flex items-center justify-between">
            <span>{webGlNotice}</span>
            <button
              onClick={() => setWebGlNotice(null)}
              className="text-purple-400 hover:text-purple-200 underline text-[11px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadOrbitData(selectedDes, simulatedDate)}
              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold cursor-pointer"
            >
              Retry Live
            </button>
          </div>
        )}
      </div>

      {/* 2. MAIN WORKSPACE: CANVAS (Col Span 2) + TELEMETRY INSPECTOR (Col Span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Orbital Canvas Viewport */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="relative rounded-2xl bg-[#050B1A] border border-[#1E293B] overflow-hidden shadow-2xl h-[520px] min-h-[500px] flex items-center justify-center group"
          >
            {renderEngine === '3d' ? (
              <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />
            ) : (
              <canvas ref={canvas2dRef} className="w-full h-full block" />
            )}

            {/* Overlay Telemetry HUD (Top-Left) */}
            <div className="absolute top-4 left-4 p-3 rounded-xl bg-[#050B1A]/85 backdrop-blur-md border border-[#1E293B] font-mono text-xs space-y-1 pointer-events-none">
              <div className="text-[10px] uppercase text-[#A7B4CC] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                {viewPerspective === 'encounter' ? 'Earth Flyby Radar View' : 'Heliocentric Solar System View'}
              </div>
              <div className="text-sm font-bold text-[#F8FAFC]">
                {motionData?.asteroid.name || selectedDes}
              </div>
              {motionData && (
                <div className="text-[11px] text-[#38BDF8]">
                  Dist to Earth: {formatDist(realtimeDistLD || motionData.stateVector.distEarthLunar, realtimeDistAU || motionData.stateVector.distEarthAU)}
                </div>
              )}
              <div className="text-[10px] text-[#A7B4CC]">
                Physical Scale: <span className="text-[#FDE047] font-semibold">{getAsteroidPhysicalInfo(selectedDes).physicalDiameterText}</span>
              </div>
              <div className="text-[10px] text-[#94A3B8]">
                Target Tracking: <span className="text-[#C084FC] font-bold capitalize">{focusedBody}</span>
              </div>
            </div>

            {/* Top-Right HUD Controls: Reset View & Guide */}
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

            {/* Scientific Scaling & Model Provenance Disclaimer (Bottom-Left) */}
            <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#A7B4CC] bg-[#050B1A]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1E293B] max-w-md hidden sm:block space-y-0.5">
              <div className="text-[#38BDF8] font-bold flex items-center gap-1">
                <Info className="w-3 h-3 text-[#38BDF8]" />
                <span>Scientific Visual Provenance</span>
              </div>
              <p className="text-[9.5px] leading-tight text-[#94A3B8]">
                3D Surface Visualization: Physically grounded topographical model based on radar delay-Doppler and lightcurve inversion profiles; celestial spheres are visually magnified for feature clarity. Orbits and relative velocities follow authentic JPL Keplerian elements.
              </p>
            </div>

            {/* Playback Indicator (Bottom-Right) */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-[#050B1A]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#1E293B] text-[10px] font-mono">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 beacon-pulse' : 'bg-amber-400'}`} />
              <span className="text-[#F8FAFC]">{isPlaying ? 'SIMULATION PLAYING' : 'PAUSED'}</span>
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
          {/* DATA PROVENANCE & RETRIEVAL PIPELINE CARD */}
          <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-xs font-mono font-bold text-[#F8FAFC] uppercase tracking-wider">
                  Data Provenance & Status
                </h3>
              </div>

              {/* Retry Live Button */}
              <button
                onClick={handleRetryLive}
                disabled={isRefreshing || isLoading}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md ${
                  isRefreshing || isLoading
                    ? 'bg-[#1E293B] text-[#64748B] cursor-not-allowed'
                    : 'bg-[#38BDF8] text-[#050B1A] hover:bg-[#38BDF8]/90 cursor-pointer active:scale-95'
                }`}
                title="Initiate genuine live network query to NASA/JPL SBDB"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Querying...' : 'Retry Live'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2.5 text-xs font-mono">
              {/* Selected Object */}
              <div className="flex justify-between items-center py-1 border-b border-[#1E293B]/60">
                <span className="text-[#64748B]">SELECTED OBJECT</span>
                <span className="font-bold text-[#F8FAFC]">
                  {motionData?.asteroid.name || selectedDes}
                </span>
              </div>

              {/* Source Provider */}
              <div className="flex justify-between items-center py-1 border-b border-[#1E293B]/60">
                <span className="text-[#64748B]">SOURCE</span>
                <span className="font-bold text-[#38BDF8] text-right truncate max-w-[210px]" title={motionData?.provenance?.source || 'Source status unavailable'}>
                  {motionData?.provenance?.source || 'Source status unavailable'}
                </span>
              </div>

              {/* Retrieval Status */}
              <div className="flex justify-between items-center py-1 border-b border-[#1E293B]/60">
                <span className="text-[#64748B]">STATUS</span>
                <div>
                  {motionData?.provenance ? (
                    motionData.provenance.retrievalStatus === 'live' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Live response
                      </span>
                    ) : motionData.provenance.retrievalStatus === 'cached' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                        <Database className="w-3 h-3" />
                        Cached response
                      </span>
                    ) : motionData.provenance.retrievalStatus === 'archive' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        Verified archive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        <Orbit className="w-3 h-3" />
                        Local propagation
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-300 border border-slate-500/30">
                      <AlertCircle className="w-3 h-3" />
                      Source status unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Last Successful Retrieval */}
              <div className="flex justify-between items-center py-1 border-b border-[#1E293B]/60">
                <span className="text-[#64748B]">LAST SUCCESSFUL RETRIEVAL</span>
                <span className="text-[#F8FAFC]">
                  {motionData?.provenance?.lastSuccessfulRetrieval
                    ? `${new Date(motionData.provenance.lastSuccessfulRetrieval).toISOString().replace('T', ' ').slice(0, 19)} UTC`
                    : (motionData?.provenance?.retrievalTimestamp
                      ? `${new Date(motionData.provenance.retrievalTimestamp).toISOString().replace('T', ' ').slice(0, 19)} UTC`
                      : 'Unavailable (not recorded by archive)')}
                </span>
              </div>

              {/* Epoch / Reference Time */}
              <div className="flex justify-between items-center py-1 border-b border-[#1E293B]/60">
                <span className="text-[#64748B]">EPOCH / REFERENCE TIME</span>
                <span className="text-[#A7B4CC]">
                  {motionData?.provenance?.epochReference || (motionData?.asteroid?.orbitalElements?.epochJd ? `JD ${motionData.asteroid.orbitalElements.epochJd}` : 'Unspecified')}
                </span>
              </div>

              {/* Last Refresh Attempt */}
              <div className="flex justify-between items-center py-1 border-b border-[#1E293B]/60">
                <span className="text-[#64748B]">LAST REFRESH ATTEMPT</span>
                <span className="text-right">
                  {motionData?.provenance?.lastRefreshAttempt ? (
                    motionData.provenance.lastRefreshAttempt.success ? (
                      <span className="text-emerald-400 font-bold">
                        {new Date(motionData.provenance.lastRefreshAttempt.timestamp).toISOString().replace('T', ' ').slice(11, 19)} UTC — Success
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold" title={motionData.provenance.lastRefreshAttempt.error}>
                        {new Date(motionData.provenance.lastRefreshAttempt.timestamp).toISOString().replace('T', ' ').slice(11, 19)} UTC — Failed
                      </span>
                    )
                  ) : (
                    <span className="text-[#64748B]">Initial session load</span>
                  )}
                </span>
              </div>

              {/* Status Explanation */}
              <div className="pt-1 text-[11px] text-[#A7B4CC] leading-relaxed">
                {motionData?.provenance?.statusExplanation || (
                  motionData?.provenance?.retrievalStatus === 'live'
                    ? 'Live response received directly from NASA/JPL Small-Body Database API.'
                    : motionData?.provenance?.retrievalStatus === 'cached'
                    ? 'Cached response stored from recent live query to prevent duplicate requests.'
                    : motionData?.provenance?.retrievalStatus === 'archive'
                    ? 'Authenticated offline record from NASA JPL Small-Body Database and CNEOS reference catalogs.'
                    : 'Source status unavailable: Provenance metadata was omitted or could not be verified.'
                )}
              </div>
            </div>
          </div>

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
                    <span className="text-[#64748B] block text-[10px]">SEMI-MAJOR AXIS (a)</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {motionData.asteroid.orbitalElements?.semiMajorAxisAU.toFixed(3) || 'N/A'} AU
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Properties, Morphology & Size Benchmark */}
              <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2 text-xs font-mono">
                <div className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider">
                  Physical Scale & Morphology
                </div>
                <div className="space-y-1 text-[#A7B4CC]">
                  <div className="flex justify-between">
                    <span>Physical Diameter:</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {getAsteroidPhysicalInfo(selectedDes).physicalDiameterText}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shape Model:</span>
                    <span className="font-bold text-[#38BDF8] text-right truncate max-w-[190px]" title={getAsteroidPhysicalInfo(selectedDes).shapeModelType}>
                      {getAsteroidPhysicalInfo(selectedDes).shapeModelType.split('(')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotation Period:</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {getAsteroidPhysicalInfo(selectedDes).rotationPeriodText}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spectral Type:</span>
                    <span className="font-bold text-[#A7B4CC]">
                      {getAsteroidPhysicalInfo(selectedDes).spectralType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Photometric Size:</span>
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
                  <div className="flex justify-between">
                    <span>Eccentricity (e):</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {motionData.asteroid.orbitalElements?.eccentricity.toFixed(4) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inclination (i):</span>
                    <span className="font-bold text-[#F8FAFC]">
                      {motionData.asteroid.orbitalElements?.inclinationDeg.toFixed(2) || 'N/A'}°
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
              {isLoading ? 'Loading orbital telemetries from JPL Small-Body Database...' : 'No telemetry loaded.'}
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
