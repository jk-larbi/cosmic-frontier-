import { useState, useEffect, useRef, useMemo, useCallback, type FC } from 'react';
import * as THREE from 'three';
import type { 
  AppPage, 
  ObservatoryCategory, 
  ObservatoryApiResponse,
  LiveDataBadgeStatus
} from '../types';
import { fetchObservatoryObjects } from '../services/astronomyDataService';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import { useReducedMotion, useDocumentVisibility } from '../utils/motion';
import {
  Play,
  Pause,
  RotateCcw,
  Search,
  ExternalLink,
  Sparkles,
  Info,
  Calendar,
  FastForward,
  Rewind,
  Eye,
  Telescope,
  Globe,
  Radio,
  Clock,
  Disc
} from 'lucide-react';

interface LiveCosmicObservatoryProps {
  onNavigate: (page: AppPage) => void;
}

type ScaleMode = 'inner' | 'full' | 'outer' | 'exoplanet' | 'sky';
type RenderEngine = '3d' | '2d';

// Historical & Future Astronomical Milestone Presets
const PRESET_EPOCHS = [
  { label: 'Present (Current UTC)', iso: new Date().toISOString() },
  { label: 'Apophis Super-Close Pass', iso: '2029-04-13T21:46:00.000Z', note: '0.08 Lunar Distances (31,600 km)' },
  { label: 'Space Apps 2026 Epoch', iso: '2026-10-24T00:00:00.000Z', note: 'COSMIC FRONTIER Mission' },
  { label: 'New Horizons Pluto Flyby', iso: '2015-07-14T11:49:00.000Z', note: 'First close-up of Pluto & Charon' },
  { label: "Halley's Next Perihelion", iso: '2061-07-28T00:00:00.000Z', note: 'Next perihelion passage of 1P/Halley' }
];

export const LiveCosmicObservatory: FC<LiveCosmicObservatoryProps> = ({ onNavigate }) => {
  const isReducedMotion = useReducedMotion();
  const isDocumentVisible = useDocumentVisibility();

  // Data state
  const [observatoryData, setObservatoryData] = useState<ObservatoryApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Filter & Search state
  const [selectedCategory, setSelectedCategory] = useState<ObservatoryCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObjectId, setSelectedObjectId] = useState<string>('earth');

  // Visualization state
  const [renderEngine, setRenderEngine] = useState<RenderEngine>('3d');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('inner');
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  // Playback & Timeline state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1 = 1 day/s, 7 = 7 days/s, etc.
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());
  const [dateInputVal, setDateInputVal] = useState<string>(new Date().toISOString().slice(0, 16));

  // Refs for 3D and 2D viewports
  const mount3DRef = useRef<HTMLDivElement | null>(null);
  const canvas2DRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const simulatedTimeRef = useRef<number>(simulatedDate.getTime());

  // Three.js instances ref
  const threeStateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    objectsMap: Map<string, THREE.Group>;
    orbitLinesGroup: THREE.Group;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    controlsActive: boolean;
    isDragging: boolean;
    previousMousePosition: { x: number; y: number };
  } | null>(null);

  // Keep simulatedTimeRef synchronized
  useEffect(() => {
    simulatedTimeRef.current = simulatedDate.getTime();
    setDateInputVal(simulatedDate.toISOString().slice(0, 16));
  }, [simulatedDate]);

  // Fetch astronomical data for the given date
  const loadObservatoryData = useCallback(async (epochDate?: Date) => {
    setIsLoading(true);
    setDataError(null);
    try {
      const dateParam = epochDate ? epochDate.toISOString() : undefined;
      const res = await fetchObservatoryObjects({ date: dateParam });
      if (res.data && res.data.success) {
        setObservatoryData(res.data as unknown as ObservatoryApiResponse);
      } else {
        setDataError('Astronomical telemetry gateway returned unformatted response.');
      }
    } catch (err: unknown) {
      console.error('[LiveCosmicObservatory] Failed to load data:', err);
      setDataError('Could not connect to the astronomical ephemeris gateway.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    loadObservatoryData(simulatedDate);
  }, []);

  // Filtered objects based on category and search
  const filteredObjects = useMemo(() => {
    if (!observatoryData?.objects) return [];
    return observatoryData.objects.filter(obj => {
      const matchesCategory = selectedCategory === 'all' || obj.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || 
        obj.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        obj.designation.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        obj.classification.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [observatoryData, selectedCategory, searchQuery]);

  // Selected object record
  const selectedObject = useMemo(() => {
    if (!observatoryData?.objects) return null;
    return observatoryData.objects.find(o => o.id === selectedObjectId) || observatoryData.objects[0] || null;
  }, [observatoryData, selectedObjectId]);

  // Handle Playback Time Step Animation
  useEffect(() => {
    if (!isPlaying) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const animatePlayback = (now: number) => {
      if (!isDocumentVisible) {
        requestRef.current = requestAnimationFrame(animatePlayback);
        return;
      }

      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Advance simulation: playbackSpeed days per second
      const deltaDays = deltaSec * playbackSpeed;
      const deltaMs = deltaDays * 86400 * 1000;
      simulatedTimeRef.current += deltaMs;

      const newDate = new Date(simulatedTimeRef.current);
      setSimulatedDate(newDate);

      requestRef.current = requestAnimationFrame(animatePlayback);
    };

    requestRef.current = requestAnimationFrame(animatePlayback);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, playbackSpeed, isDocumentVisible]);

  // Refresh data whenever simulation date changes significantly (e.g. paused jump or after 5 days of playback)
  const lastFetchedEpochRef = useRef<number>(simulatedDate.getTime());
  useEffect(() => {
    const diffDays = Math.abs(simulatedDate.getTime() - lastFetchedEpochRef.current) / (86400 * 1000);
    // If stepped or jumped more than 3 days, refresh analytical ephemerides
    if (diffDays >= 3 && !isPlaying) {
      lastFetchedEpochRef.current = simulatedDate.getTime();
      loadObservatoryData(simulatedDate);
    }
  }, [simulatedDate, isPlaying, loadObservatoryData]);

  // Preset Epoch Handler
  const handleSelectPreset = (iso: string) => {
    const newDate = new Date(iso);
    setSimulatedDate(newDate);
    setIsPlaying(false);
    lastFetchedEpochRef.current = newDate.getTime();
    loadObservatoryData(newDate);
  };

  // Jump to specific custom date
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateInputVal(e.target.value);
    const parsed = new Date(e.target.value);
    if (!isNaN(parsed.getTime())) {
      setSimulatedDate(parsed);
      setIsPlaying(false);
      lastFetchedEpochRef.current = parsed.getTime();
      loadObservatoryData(parsed);
    }
  };

  // Step Time helpers
  const handleStepDays = (days: number) => {
    const newTime = simulatedDate.getTime() + days * 86400 * 1000;
    const newDate = new Date(newTime);
    setSimulatedDate(newDate);
    setIsPlaying(false);
    loadObservatoryData(newDate);
  };

  // Keyboard navigation for playback
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      setIsPlaying(prev => !prev);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleStepDays(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleStepDays(-1);
    }
  };

  // =========================================================================
  // 3D THREE.JS VIEWPORT INITIALIZATION & RENDERER
  // =========================================================================
  useEffect(() => {
    if (renderEngine !== '3d' || !mount3DRef.current) return;
    const container = mount3DRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50000);
    camera.position.set(0, 45, 95);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xfff7d6, 2.5, 3000, 0.5);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    // 4. Background Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 2500 + Math.random() * 2000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, transparent: true, opacity: 0.8 });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 5. Groups for Dynamic Celestial Objects & Orbit Lines
    const objectsMap = new Map<string, THREE.Group>();
    const orbitLinesGroup = new THREE.Group();
    scene.add(orbitLinesGroup);

    // 6. Camera Orbit Interaction Setup with smooth inertial easing
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let currentDistance = 95;
    let targetDistance = 95;
    let currentTheta = 0;
    let targetTheta = 0;
    let currentPhi = 0.45;
    let targetPhi = 0.45;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetTheta -= deltaX * 0.007;
      targetPhi = Math.max(0.05, Math.min(Math.PI - 0.05, targetPhi - deltaY * 0.007));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetDistance = Math.max(10, Math.min(1200, targetDistance + e.deltaY * 0.08));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Store state in ref
    threeStateRef.current = {
      scene,
      camera,
      renderer,
      objectsMap,
      orbitLinesGroup,
      raycaster: new THREE.Raycaster(),
      mouse: new THREE.Vector2(),
      controlsActive: true,
      isDragging: false,
      previousMousePosition: { x: 0, y: 0 }
    };

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with camera flight lerp and tab visibility pause
    let animId: number;
    const renderLoop = () => {
      if (isDocumentVisible) {
        const lerpFactor = isReducedMotion ? 1.0 : 0.09;
        currentDistance += (targetDistance - currentDistance) * lerpFactor;
        currentTheta += (targetTheta - currentTheta) * lerpFactor;
        currentPhi += (targetPhi - currentPhi) * lerpFactor;

        const sinPhiRadius = currentDistance * Math.sin(currentPhi);
        camera.position.x = sinPhiRadius * Math.sin(currentTheta);
        camera.position.y = currentDistance * Math.cos(currentPhi);
        camera.position.z = sinPhiRadius * Math.cos(currentTheta);
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(renderLoop);
    };
    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      threeStateRef.current = null;
    };
  }, [renderEngine]);

  // Synchronize 3D Scene Objects whenever observatoryData, scaleMode, or filteredObjects change
  useEffect(() => {
    if (renderEngine !== '3d' || !threeStateRef.current || !observatoryData?.objects) return;
    const { scene, objectsMap, orbitLinesGroup } = threeStateRef.current;

    // Clear existing orbit lines
    while (orbitLinesGroup.children.length > 0) {
      const child = orbitLinesGroup.children[0];
      orbitLinesGroup.remove(child);
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }

    // Determine coordinate scale factor based on scaleMode
    let auScale = 12; // 1 AU = 12 3D units in inner mode
    if (scaleMode === 'full') auScale = 3.5;
    if (scaleMode === 'outer') auScale = 0.35;
    if (scaleMode === 'exoplanet') auScale = 85;
    if (scaleMode === 'sky') auScale = 1.0;

    // Create or update meshes for filtered objects
    const currentObjectIds = new Set(filteredObjects.map(o => o.id));

    // Remove obsolete objects
    for (const [id, grp] of objectsMap.entries()) {
      if (!currentObjectIds.has(id)) {
        scene.remove(grp);
        objectsMap.delete(id);
      }
    }

    // Add or update active objects
    filteredObjects.forEach(obj => {
      let group = objectsMap.get(obj.id);
      if (!group) {
        group = new THREE.Group();
        group.name = obj.id;

        // Base Mesh Sphere
        let meshRadius = 0.9;
        if (obj.id === 'sun') meshRadius = 3.2;
        else if (['jupiter', 'saturn'].includes(obj.id)) meshRadius = 2.0;
        else if (['uranus', 'neptune'].includes(obj.id)) meshRadius = 1.5;
        else if (['ceres', 'vesta', 'eros', 'apophis'].includes(obj.id)) meshRadius = 0.55;
        else if (obj.category === 'exoplanets') meshRadius = 1.1;
        else if (obj.category === 'deep-sky') meshRadius = 1.6;
        else if (obj.category === 'spherex-targets') meshRadius = 1.2;

        const sphereGeo = new THREE.SphereGeometry(meshRadius, 24, 24);
        let mat: THREE.Material;

        if (obj.id === 'sun') {
          mat = new THREE.MeshBasicMaterial({ color: 0xF5C451 });
        } else if (obj.motionType === 'observation-footprint') {
          mat = new THREE.MeshBasicMaterial({ color: obj.color, wireframe: true });
        } else {
          mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(obj.color || '#38BDF8'),
            roughness: 0.6,
            metalness: 0.2
          });
        }

        const sphereMesh = new THREE.Mesh(sphereGeo, mat);
        sphereMesh.name = `${obj.id}-mesh`;
        group.add(sphereMesh);

        // Saturn's Ring System
        if (obj.id === 'saturn') {
          const ringGeo = new THREE.RingGeometry(2.5, 4.2, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xE2C58A,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2;
          group.add(ringMesh);
        }

        scene.add(group);
        objectsMap.set(obj.id, group);
      }

      // Position the object in 3D
      if (obj.heliocentricAU) {
        group.position.set(
          obj.heliocentricAU.x * auScale,
          obj.heliocentricAU.z * auScale,
          obj.heliocentricAU.y * auScale
        );
      } else if (obj.category === 'exoplanets' && obj.orbitalElements) {
        // Exoplanetary local orbit around its parent star at origin (or offset)
        const a = obj.orbitalElements.semiMajorAxisAU || 0.2;
        // Illustrative Keplerian orbit at current time
        const periodDays = obj.exoplanetParams?.orbitalPeriodDays || 30;
        const phase = ((simulatedDate.getTime() / 86400000) % periodDays) / periodDays * Math.PI * 2;
        const xExo = a * Math.cos(phase) * auScale;
        const zExo = a * Math.sin(phase) * auScale;
        group.position.set(xExo, 0, zExo);
      } else if (obj.category === 'deep-sky' || obj.category === 'spherex-targets') {
        // Project onto outer celestial sphere using Right Ascension and Declination
        const raParts = (obj.celestialCoords?.rightAscension || obj.rightAscension || '00h 00m 00s').match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);
        const decParts = (obj.celestialCoords?.declination || obj.declination || '+00° 00′ 00″').match(/([+-]?\d+)°\s*(\d+)′\s*([\d.]+)″/);

        let raHours = 0;
        let decDeg = 0;
        if (raParts) {
          raHours = parseFloat(raParts[1]) + parseFloat(raParts[2]) / 60 + parseFloat(raParts[3]) / 3600;
        }
        if (decParts) {
          const sign = decParts[1].startsWith('-') ? -1 : 1;
          decDeg = sign * (Math.abs(parseFloat(decParts[1])) + parseFloat(decParts[2]) / 60 + parseFloat(decParts[3]) / 3600);
        }

        const sphereDist = 120; // sphere radius
        const raRad = (raHours * 15) * (Math.PI / 180);
        const decRad = decDeg * (Math.PI / 180);

        group.position.set(
          sphereDist * Math.cos(decRad) * Math.cos(raRad),
          sphereDist * Math.sin(decRad),
          sphereDist * Math.cos(decRad) * Math.sin(raRad)
        );
      }

      // Draw Orbit Lines when valid orbital elements exist
      if (showOrbits && obj.orbitalElements && obj.orbitalElements.semiMajorAxisAU > 0) {
        const segments = 128;
        const linePoints: THREE.Vector3[] = [];
        const a = obj.orbitalElements.semiMajorAxisAU * auScale;
        const e = obj.orbitalElements.eccentricity || 0;
        const b = a * Math.sqrt(Math.max(0.0001, 1 - e * e));

        const incRad = (obj.orbitalElements.inclinationDeg || 0) * (Math.PI / 180);
        const nodeRad = (obj.orbitalElements.longitudeOfAscendingNodeDeg || 0) * (Math.PI / 180);
        const periRad = (obj.orbitalElements.argumentOfPerihelionDeg || 0) * (Math.PI / 180);

        for (let s = 0; s <= segments; s++) {
          const theta = (s / segments) * Math.PI * 2;
          const xOrb = a * (Math.cos(theta) - e);
          const yOrb = b * Math.sin(theta);

          // Rotate by argument of perihelion, inclination, and longitude of ascending node
          const cosW = Math.cos(periRad), sinW = Math.sin(periRad);
          const cosN = Math.cos(nodeRad), sinN = Math.sin(nodeRad);
          const cosI = Math.cos(incRad), sinI = Math.sin(incRad);

          const x = (cosW * cosN - sinW * sinN * cosI) * xOrb + (-sinW * cosN - cosW * sinN * cosI) * yOrb;
          const y = (cosW * sinN + sinW * cosN * cosI) * xOrb + (-sinW * sinN + cosW * sinN * cosI) * yOrb;
          const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

          linePoints.push(new THREE.Vector3(x, z, y));
        }

        const orbitGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const lineMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(obj.color || '#38BDF8'),
          transparent: true,
          opacity: obj.id === selectedObjectId ? 0.9 : 0.28
        });
        const orbitLine = new THREE.Line(orbitGeo, lineMat);
        orbitLinesGroup.add(orbitLine);
      }
    });
  }, [renderEngine, observatoryData, filteredObjects, scaleMode, showOrbits, selectedObjectId, simulatedDate]);

  // Focus Camera on Selected Object in 3D
  const handleFocusSelected = () => {
    if (!threeStateRef.current || !selectedObject) return;
    const group = threeStateRef.current.objectsMap.get(selectedObject.id);
    if (!group) return;

    const camera = threeStateRef.current.camera;
    const targetPos = group.position.clone();
    camera.position.set(targetPos.x + 12, targetPos.y + 8, targetPos.z + 18);
    camera.lookAt(targetPos);
  };

  // =========================================================================
  // 2D CANVAS RADAR & CELESTIAL SKY RENDERER
  // =========================================================================
  useEffect(() => {
    if (renderEngine !== '2d' || !canvas2DRef.current || !observatoryData?.objects) return;
    const canvas = canvas2DRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 750;
    const height = 520;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Deep cosmic background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    if (scaleMode === 'sky') {
      // 2D CELESTIAL SPHERE PROJECTION (RA vs Dec Map)
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;

      // Coordinate Grid
      for (let h = 0; h <= 24; h += 4) {
        const x = (h / 24) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`${h}h`, x + 4, 16);
      }

      for (let deg = -60; deg <= 60; deg += 30) {
        const y = ((90 - deg) / 180) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`${deg > 0 ? '+' : ''}${deg}°`, 6, y - 4);
      }

      // Plot Celestial Objects
      filteredObjects.forEach(obj => {
        const raParts = (obj.celestialCoords?.rightAscension || obj.rightAscension || '00h 00m 00s').match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);
        const decParts = (obj.celestialCoords?.declination || obj.declination || '+00° 00′ 00″').match(/([+-]?\d+)°\s*(\d+)′\s*([\d.]+)″/);

        let raHours = 0;
        let decDeg = 0;
        if (raParts) {
          raHours = parseFloat(raParts[1]) + parseFloat(raParts[2]) / 60 + parseFloat(raParts[3]) / 3600;
        }
        if (decParts) {
          const sign = decParts[1].startsWith('-') ? -1 : 1;
          decDeg = sign * (Math.abs(parseFloat(decParts[1])) + parseFloat(decParts[2]) / 60 + parseFloat(decParts[3]) / 3600);
        }

        const x = (raHours / 24) * width;
        const y = ((90 - decDeg) / 180) * height;
        const isSelected = obj.id === selectedObjectId;

        // Draw Marker
        ctx.fillStyle = obj.color || '#38BDF8';
        if (obj.motionType === 'observation-footprint') {
          // Footprint rectangle
          ctx.strokeStyle = obj.color || '#38BDF8';
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.strokeRect(x - 8, y - 6, 16, 12);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, isSelected ? 6 : 4, 0, Math.PI * 2);
          ctx.fill();
        }

        if (showLabels || isSelected) {
          ctx.fillStyle = isSelected ? '#F8FAFC' : '#94A3B8';
          ctx.font = `${isSelected ? 'bold ' : ''}11px JetBrains Mono, monospace`;
          ctx.fillText(obj.name.split(' ')[0], x + 9, y + 4);
        }
      });
    } else {
      // 2D TOP-DOWN ORBITAL RADAR VIEW
      let maxAU = 5.2; // inner mode
      if (scaleMode === 'full') maxAU = 35;
      if (scaleMode === 'outer') maxAU = 1100;
      if (scaleMode === 'exoplanet') maxAU = 0.5;

      const pxPerAU = (Math.min(width, height) * 0.44) / maxAU;

      // Concentric Distance Guide Rings
      const guideRings = scaleMode === 'inner' 
        ? [0.387, 0.723, 1.0, 1.524, 5.2] 
        : scaleMode === 'full' 
        ? [1.0, 5.2, 9.5, 19.2, 30.0] 
        : scaleMode === 'outer'
        ? [30.0, 76.0, 240.0, 500.0, 1000.0]
        : [0.05, 0.1, 0.2, 0.4];

      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      guideRings.forEach(rAU => {
        const rPx = rAU * pxPerAU;
        if (rPx < width / 2) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, rPx, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#64748B';
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.fillText(`${rAU} AU`, centerX + rPx + 4, centerY + 3);
        }
      });

      // Central Star
      ctx.fillStyle = scaleMode === 'exoplanet' ? '#C084FC' : '#F5C451';
      ctx.shadowColor = scaleMode === 'exoplanet' ? '#C084FC' : '#F5C451';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Orbit Tracks
      if (showOrbits) {
        filteredObjects.forEach(obj => {
          if (!obj.orbitalElements || obj.orbitalElements.semiMajorAxisAU <= 0) return;
          const a = obj.orbitalElements.semiMajorAxisAU * pxPerAU;
          const e = obj.orbitalElements.eccentricity || 0;
          const b = a * Math.sqrt(Math.max(0.0001, 1 - e * e));
          const periShift = a * e;

          ctx.save();
          ctx.translate(centerX, centerY);

          // Rotate by node + perihelion
          const angle = ((obj.orbitalElements.longitudeOfAscendingNodeDeg || 0) + (obj.orbitalElements.argumentOfPerihelionDeg || 0)) * (Math.PI / 180);
          ctx.rotate(angle);

          ctx.strokeStyle = obj.color || '#38BDF8';
          ctx.globalAlpha = obj.id === selectedObjectId ? 0.9 : 0.25;
          ctx.lineWidth = obj.id === selectedObjectId ? 2 : 1;

          if (obj.motionType === 'illustrative-exoplanet' || obj.isHypothetical) {
            ctx.setLineDash([4, 4]); // dashed line for illustrative or hypothetical orbits
          } else {
            ctx.setLineDash([]);
          }

          ctx.beginPath();
          ctx.ellipse(-periShift, 0, a, b, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });
      }

      // Draw Object Nodes
      filteredObjects.forEach(obj => {
        let x = centerX;
        let y = centerY;

        if (obj.heliocentricAU) {
          x = centerX + obj.heliocentricAU.x * pxPerAU;
          y = centerY - obj.heliocentricAU.y * pxPerAU; // invert y for canvas
        } else if (obj.category === 'exoplanets' && obj.orbitalElements) {
          const a = obj.orbitalElements.semiMajorAxisAU || 0.1;
          const periodDays = obj.exoplanetParams?.orbitalPeriodDays || 20;
          const phase = ((simulatedDate.getTime() / 86400000) % periodDays) / periodDays * Math.PI * 2;
          x = centerX + a * Math.cos(phase) * pxPerAU;
          y = centerY - a * Math.sin(phase) * pxPerAU;
        }

        const isSelected = obj.id === selectedObjectId;

        ctx.fillStyle = obj.color || '#38BDF8';
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#F8FAFC';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (showLabels || isSelected) {
          ctx.fillStyle = isSelected ? '#F8FAFC' : '#94A3B8';
          ctx.font = `${isSelected ? 'bold ' : ''}11px JetBrains Mono, monospace`;
          ctx.fillText(obj.name.split(' ')[0], x + 8, y + 4);
        }
      });
    }

    ctx.restore();
  }, [renderEngine, observatoryData, filteredObjects, scaleMode, showOrbits, showLabels, selectedObjectId, simulatedDate]);

  // Render Status Badge
  const renderStatusBadge = (status: LiveDataBadgeStatus | string) => {
    switch (status) {
      case 'LIVE DATA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE DATA
          </span>
        );
      case 'PREDICTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30">
            <Clock className="w-3 h-3" />
            PREDICTED
          </span>
        );
      case 'ILLUSTRATIVE MODEL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/30">
            <Disc className="w-3 h-3" />
            ILLUSTRATIVE MODEL
          </span>
        );
      case 'OBSERVATION TARGET':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/30">
            <Telescope className="w-3 h-3" />
            OBSERVATION TARGET
          </span>
        );
      case 'SIMULATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            SIMULATION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1E293B] text-[#94A3B8] border border-[#334155]">
            STATIC RECORD
          </span>
        );
    }
  };

  return (
    <div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Live Cosmic Observatory Workspace"
    >
      {/* 1. OBSERVATORY HEADER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-linear-to-b from-[#0B1630] to-[#070E22] border border-[#1E293B] shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-mono font-semibold uppercase tracking-wider">
                <Telescope className="w-3.5 h-3.5" />
                <span>Live Cosmic Observatory</span>
              </div>
              {observatoryData && renderStatusBadge(observatoryData.statusLabel)}
              <span className="text-[11px] font-mono text-[#94A3B8] px-2.5 py-0.5 rounded-full bg-[#050B1A] border border-[#1E293B]">
                {filteredObjects.length} Objects Loaded
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
              Live Cosmic Observatory
            </h1>
            <p className="text-xs sm:text-sm text-[#A7B4CC] max-w-3xl leading-relaxed">
              Explore the Universe. Discover the Unknown. An interactive motion viewer for all supported astronomical objects across NASA, JPL, IPAC, and international catalogs.
            </p>
          </div>

          {/* Telemetry Clock & Last Retrieval Timestamp */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1 min-w-60">
              <div className="flex items-center justify-between gap-4 text-xs text-[#A7B4CC] font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Simulated Observation Epoch</span>
                </span>
              </div>
              <div className="text-base font-mono font-bold text-[#F8FAFC] tabular-nums">
                {simulatedDate.toUTCString().slice(0, 25)}
              </div>
              <div className="text-[10px] font-mono text-[#64748B]">
                Last Data Sync: {observatoryData?.retrievalTimestamp ? new Date(observatoryData.retrievalTimestamp).toLocaleTimeString() : 'Recent'}
              </div>
            </div>

            <button
              onClick={() => onNavigate('mission-control')}
              className="px-4 py-3 rounded-xl bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8]/50 text-xs font-mono font-semibold text-[#F8FAFC] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Radio className="w-4 h-4 text-[#38BDF8]" />
              <span>Mission Control</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#1E293B]/70">
          {[
            { id: 'all', label: 'All Supported', count: observatoryData?.allAvailableCount || 63 },
            { id: 'solar-system', label: 'Solar System', count: observatoryData?.categories['solar-system'] || 10 },
            { id: 'asteroids-comets', label: 'Asteroids & Comets', count: observatoryData?.categories['asteroids-comets'] || 6 },
            { id: 'distant-tnos', label: 'Distant TNOs & Outer', count: observatoryData?.categories['distant-tnos'] || 5 },
            { id: 'exoplanets', label: 'Exoplanet Systems', count: observatoryData?.categories['exoplanets'] || 16 },
            { id: 'deep-sky', label: 'Galaxies & Stars', count: observatoryData?.categories['deep-sky'] || 22 },
            { id: 'spherex-targets', label: 'SPHEREx Targets', count: observatoryData?.categories['spherex-targets'] || 4 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as ObservatoryCategory)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-xs'
                  : 'bg-[#050B1A] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${selectedCategory === tab.id ? 'bg-[#050B1A]/20 text-[#050B1A]' : 'bg-[#1E293B] text-[#94A3B8]'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN OBSERVATORY WORKSPACE (VIEWPORT + INSPECTOR) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* VIEWPORT & INTERACTIVE CANVAS (Col Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-3">
            {/* Viewport Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Engine Toggle */}
              <div className="flex rounded-lg bg-[#050B1A] p-0.5 border border-[#1E293B] text-xs font-mono">
                <button
                  onClick={() => setRenderEngine('3d')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    renderEngine === '3d' ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-xs' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  3D WebGL
                </button>
                <button
                  onClick={() => setRenderEngine('2d')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    renderEngine === '2d' ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-xs' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  2D Radar
                </button>
              </div>

              {/* Scale Mode Selector */}
              <div className="flex flex-wrap rounded-lg bg-[#050B1A] p-0.5 border border-[#1E293B] text-xs font-mono">
                <button
                  onClick={() => setScaleMode('inner')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    scaleMode === 'inner' ? 'bg-[#0E1B38] text-[#38BDF8] font-bold border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Inner (0-5 AU)
                </button>
                <button
                  onClick={() => setScaleMode('full')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    scaleMode === 'full' ? 'bg-[#0E1B38] text-[#38BDF8] font-bold border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Full (0-35 AU)
                </button>
                <button
                  onClick={() => setScaleMode('outer')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    scaleMode === 'outer' ? 'bg-[#0E1B38] text-[#38BDF8] font-bold border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Outer (1200 AU)
                </button>
                <button
                  onClick={() => setScaleMode('exoplanet')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    scaleMode === 'exoplanet' ? 'bg-[#0E1B38] text-[#C084FC] font-bold border border-[#8B5CF6]/40' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Exo Orbit
                </button>
                <button
                  onClick={() => setScaleMode('sky')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    scaleMode === 'sky' ? 'bg-[#0E1B38] text-[#38BDF8] font-bold border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  Sky View (RA/Dec)
                </button>
              </div>

              {/* Orbits & Labels Toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowOrbits(!showOrbits)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                    showOrbits ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40' : 'bg-[#050B1A] text-[#94A3B8] border-[#1E293B]'
                  }`}
                >
                  Orbits: {showOrbits ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                    showLabels ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40' : 'bg-[#050B1A] text-[#94A3B8] border-[#1E293B]'
                  }`}
                >
                  Labels: {showLabels ? 'ON' : 'OFF'}
                </button>

                <button
                  onClick={handleFocusSelected}
                  className="px-2.5 py-1 rounded-lg bg-[#050B1A] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] flex items-center gap-1 transition-all cursor-pointer"
                  title="Focus camera on selected object"
                >
                  <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Focus</span>
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-xl bg-[#030712] border border-[#1E293B] overflow-hidden shadow-inner h-130 lg:h-145 flex items-center justify-center">
              {renderEngine === '3d' ? (
                <div ref={mount3DRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              ) : (
                <canvas ref={canvas2DRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              )}

              {/* Viewport Info Overlay (Top Left) */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                <div className="px-3 py-1.5 rounded-lg bg-[#050B1A]/90 backdrop-blur-md border border-[#1E293B] text-[11px] font-mono text-[#F8FAFC] space-y-0.5 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                    <span className="font-semibold uppercase tracking-wider text-[#38BDF8]">
                      {scaleMode === 'sky' ? 'Celestial Sphere Projection' : 'Interactive Heliocentric View'}
                    </span>
                  </div>
                  <div className="text-[#94A3B8]">
                    {scaleMode === 'sky'
                      ? 'Geocentric Equatorial Coordinates (RA: 0-24h, Dec: -90° to +90°)'
                      : `Astronomical Scale: ${scaleMode === 'inner' ? 'Inner System (0–5.2 AU)' : scaleMode === 'full' ? 'Full System (0–35 AU)' : scaleMode === 'outer' ? 'Trans-Neptunian (0–1200 AU)' : 'Exoplanet Stellar Frame'}`}
                  </div>
                </div>
              </div>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="absolute inset-0 bg-[#030712]/75 backdrop-blur-xs flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 font-mono text-xs text-[#38BDF8]">
                    <div className="w-8 h-8 rounded-full border-2 border-[#38BDF8] border-t-transparent animate-spin" />
                    <span>Propagating analytical ephemeris state vectors...</span>
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {dataError && (
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                  {dataError}
                </div>
              )}
            </div>

            {/* 3. INTERACTIVE PLAYBACK TIMELINE CONTROLS */}
            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Play, Pause, Step Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                      isPlaying
                        ? 'bg-amber-500 text-[#050B1A] hover:bg-amber-400'
                        : 'bg-[#38BDF8] text-[#050B1A] hover:bg-[#0284C7]'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause Motion' : 'Play Motion'}</span>
                  </button>

                  <button
                    onClick={() => handleStepDays(-1)}
                    className="p-2 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-all cursor-pointer"
                    title="Step backward 1 day"
                  >
                    <Rewind className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleStepDays(1)}
                    className="p-2 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-all cursor-pointer"
                    title="Step forward 1 day"
                  >
                    <FastForward className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSelectPreset(new Date().toISOString())}
                    className="p-2 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] transition-all cursor-pointer"
                    title="Reset to Present (Current UTC)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-[#64748B] hidden sm:inline">Speed:</span>
                  {[
                    { label: '1x', val: 0.05 },
                    { label: '1d/s', val: 1 },
                    { label: '7d/s', val: 7 },
                    { label: '30d/s', val: 30 },
                    { label: '1yr/s', val: 365.25 }
                  ].map(s => (
                    <button
                      key={s.label}
                      onClick={() => setPlaybackSpeed(s.val)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer tabular-nums ${
                        playbackSpeed === s.val
                          ? 'bg-[#0E1B38] text-[#38BDF8] border border-[#38BDF8]/40 font-bold'
                          : 'bg-[#050B1A] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Date Input Selector */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#38BDF8]" />
                  <input
                    type="datetime-local"
                    value={dateInputVal}
                    onChange={handleDateInputChange}
                    className="px-2.5 py-1.5 rounded-lg bg-[#030712] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              {/* Preset Astronomical Milestones */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1E293B]/60">
                <span className="text-[11px] font-mono text-[#64748B]">Key Milestones:</span>
                {PRESET_EPOCHS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => handleSelectPreset(preset.iso)}
                    className="px-2.5 py-1 rounded-md bg-[#0E1B38]/60 hover:bg-[#1E293B] border border-[#1E293B] text-[11px] font-mono text-[#94A3B8] hover:text-[#38BDF8] transition-all cursor-pointer"
                    title={preset.note}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. SELECTED OBJECT INSPECTION PANEL (Col Span 1) */}
        <div className="space-y-4">
          {/* Quick Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search 63 supported astronomical objects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1630] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          {/* Quick Carousel Selector */}
          <div className="p-3 rounded-xl bg-[#0B1630] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] px-1">
              <span>Quick Object Selector</span>
              <span className="tabular-nums">{filteredObjects.length} Available</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {filteredObjects.slice(0, 15).map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedObjectId(o.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedObjectId === o.id
                      ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                      : 'bg-[#050B1A] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#1E293B]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: o.color || '#38BDF8' }} />
                  <span>{o.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Inspector Card */}
          {selectedObject ? (
            <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-5">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedObject.color }} />
                    <span className="text-xs font-mono font-bold text-[#38BDF8]">
                      {selectedObject.categoryLabel}
                    </span>
                  </div>
                  {renderStatusBadge(selectedObject.dataStatus)}
                </div>

                <h3 className="text-xl font-bold font-mono text-[#F8FAFC]">
                  {selectedObject.name}
                </h3>
                <div className="text-xs font-mono text-[#94A3B8]">
                  {selectedObject.designation}
                </div>
              </div>

              {/* Visual Preview */}
              <div className="rounded-xl overflow-hidden border border-[#1E293B] bg-[#050B1A]">
                <AstronomicalImage
                  target={selectedObject}
                  targetType={
                    selectedObject.category === 'solar-system' ? 'planet'
                    : selectedObject.category === 'exoplanets' ? 'exoplanet'
                    : selectedObject.category === 'asteroids-comets' || selectedObject.category === 'distant-tnos' ? 'small-body'
                    : selectedObject.category === 'spherex-targets' ? 'observation'
                    : 'star'
                  }
                  aspectRatio="16/9"
                  showBadge={true}
                  className="w-full h-36 object-cover"
                />
              </div>

              {/* Real-Time / Calculated Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {selectedObject.distSunAU !== undefined && (
                  <div className="p-2.5 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[10px] text-[#64748B]">Dist. to Sun:</span>
                    <div className="font-bold text-[#F8FAFC] mt-0.5 tabular-nums">{selectedObject.distSunAU} AU</div>
                    <div className="text-[10px] text-[#94A3B8]">{selectedObject.distSunMillionKm}M km</div>
                  </div>
                )}

                {selectedObject.distEarthAU !== undefined && (
                  <div className="p-2.5 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[10px] text-[#64748B]">Dist. to Earth:</span>
                    <div className="font-bold text-[#38BDF8] mt-0.5 tabular-nums">{selectedObject.distEarthAU} AU</div>
                    <div className="text-[10px] text-[#94A3B8]">{selectedObject.distEarthLunar} LD</div>
                  </div>
                )}

                {selectedObject.orbitalSpeedKmS !== undefined && (
                  <div className="p-2.5 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[10px] text-[#64748B]">Orbital Speed:</span>
                    <div className="font-bold text-[#F5C451] mt-0.5 tabular-nums">{selectedObject.orbitalSpeedKmS} km/s</div>
                    <div className="text-[10px] text-[#94A3B8]">~{Math.round(selectedObject.orbitalSpeedKmS * 3600).toLocaleString()} km/h</div>
                  </div>
                )}

                {selectedObject.orbitalElements && (
                  <div className="p-2.5 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[10px] text-[#64748B]">Period:</span>
                    <div className="font-bold text-[#F8FAFC] mt-0.5 tabular-nums">
                      {selectedObject.orbitalElements.orbitalPeriodYears} yrs
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      e = {selectedObject.orbitalElements.eccentricity}
                    </div>
                  </div>
                )}

                {selectedObject.celestialCoords?.distanceLightYears && (
                  <div className="p-2.5 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[10px] text-[#64748B]">Distance:</span>
                    <div className="font-bold text-[#38BDF8] mt-0.5 tabular-nums">
                      {selectedObject.celestialCoords.distanceLightYears.toLocaleString()} ly
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      {selectedObject.celestialCoords.constellation || 'Catalog'}
                    </div>
                  </div>
                )}

                {selectedObject.celestialCoords?.distanceMly && (
                  <div className="p-2.5 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[10px] text-[#64748B]">Extragalactic Dist:</span>
                    <div className="font-bold text-[#38BDF8] mt-0.5 tabular-nums">
                      {selectedObject.celestialCoords.distanceMly} Mly
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      z = {selectedObject.celestialCoords.redshift}
                    </div>
                  </div>
                )}
              </div>

              {/* Sky Coordinates (RA / Dec) */}
              {(selectedObject.rightAscension || selectedObject.celestialCoords?.rightAscension) && (
                <div className="p-3 rounded-lg bg-[#050B1A] border border-[#1E293B] space-y-1 text-xs font-mono">
                  <div className="text-[10px] text-[#64748B] flex items-center justify-between">
                    <span>Equatorial Coordinates (J2000):</span>
                    <span>{selectedObject.coordinateFrame}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-[#F8FAFC]">
                    <span>RA: {selectedObject.celestialCoords?.rightAscension || selectedObject.rightAscension}</span>
                    <span>Dec: {selectedObject.celestialCoords?.declination || selectedObject.declination}</span>
                  </div>
                </div>
              )}

              {/* Educational Description */}
              <p className="text-xs text-[#A7B4CC] leading-relaxed p-3 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                {selectedObject.description}
              </p>

              {/* Mandatory Scientific Transparency Disclaimer */}
              <div className="p-3 rounded-lg bg-linear-to-r from-[#050B1A] to-[#0E1B38] border border-[#38BDF8]/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#38BDF8]">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Scientific Modeling Notice</span>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed italic">
                  {selectedObject.scientificDisclaimer}
                </p>
              </div>

              {/* Source Attribution */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] pt-1 border-t border-[#1E293B]">
                <span>Source: {selectedObject.source}</span>
                <a
                  href={selectedObject.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#38BDF8] hover:underline flex items-center gap-1"
                >
                  <span>Catalog</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Cross-Module Navigation Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => onNavigate('universe')}
                  className="py-2.5 px-3 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8] text-xs font-mono font-semibold text-[#38BDF8] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>3D Universe</span>
                </button>

                <button
                  onClick={() => onNavigate('ai-guide')}
                  className="py-2.5 px-3 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] hover:border-amber-400 text-xs font-mono font-semibold text-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Guide</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-[#0B1630] border border-[#1E293B] text-xs font-mono text-[#94A3B8]">
              Select an astronomical object to inspect its orbital telemetry.
            </div>
          )}
        </div>
      </div>

      {/* 5. SCIENTIFIC TRANSPARENCY & ORBITAL LEGEND DRAWER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-mono text-[#F8FAFC]">
              Observatory Legend & Astronomical Reference Standards
            </h3>
            <p className="text-xs text-[#94A3B8]">
              How celestial motion, coordinates, and distances are scientifically modeled in this observatory.
            </p>
          </div>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="text-xs font-mono text-[#38BDF8] hover:underline cursor-pointer"
          >
            {showLegend ? 'Hide Technical Details' : 'Show Technical Details'}
          </button>
        </div>

        {showLegend && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-[#1E293B] text-xs font-mono text-[#A7B4CC]">
            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
              <span className="font-bold text-[#F8FAFC]">Orbital Path Conventions</span>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-[#38BDF8]" />
                  <span>Solid Line: Confirmed analytical Keplerian orbit (NASA/JPL SSD).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 border-t border-dashed border-[#8B5CF6]" />
                  <span>Dashed Line: Illustrative exoplanetary orbit or theoretical model.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Point Marker: Celestial sphere coordinate (RA/Dec).</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
              <span className="font-bold text-[#F8FAFC]">Distance Scale Conversions</span>
              <ul className="space-y-1.5 text-[11px]">
                <li>• 1 AU (Astronomical Unit) = 149,597,870.7 km (Earth-Sun mean)</li>
                <li>• 1 LD (Lunar Distance) = 384,400.0 km (Earth-Moon mean)</li>
                <li>• 1 Light-Year (ly) = 9.461 × 10¹² km (~63,241 AU)</li>
                <li>• 1 Megaparsec (Mpc) = 3.26 million ly (extragalactic scale)</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2">
              <span className="font-bold text-[#F8FAFC]">Visual Magnification Notice</span>
              <p className="text-[11px] leading-relaxed">
                Celestial body radii are enlarged for visibility against interplanetary distances. Orbital radii, eccentricities, speeds, and simulation timing strictly maintain astronomical Keplerian ratios.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
