import { useState, useEffect, useRef, useMemo, useCallback, type FC } from 'react';
import * as THREE from 'three';
import type { 
  AppPage, 
  ObservatoryCategory, 
  ObservatoryApiResponse,
  ObservatoryObject,
  LiveDataBadgeStatus
} from '../types';
import { fetchObservatoryObjects } from '../services/astronomyDataService';
import { DEFAULT_OBSERVATORY_SNAPSHOT } from '../data/observatorySnapshot';
import { AstronomicalImage } from './astronomy-images/AstronomicalImage';
import { useReducedMotion, useDocumentVisibility } from '../utils/motion';
import {
  loadPlanetTexture,
  createSunTexture,
  NASA_JPL_TEXTURE_MAPS
} from '../utils/planetTextureGenerator';
import {
  propagateElementsClient,
  type KeplerianElements
} from '../utils/orbitalMotion';
import {
  createAsteroidGeometry,
  createAsteroidMaterial,
  updateAsteroidTumble,
  getAsteroidPhysicalInfo
} from '../utils/asteroidMeshGenerator';
import {
  VERIFIED_NEO_PRESETS,
  VERIFIED_FALLBACK_APPROACHES
} from '../data/verifiedAsteroidPresets';
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
  Disc,
  RefreshCw,
  Compass,
  Crosshair,
  Layers,
  ShieldAlert,
  Orbit,
  ArrowRight
} from 'lucide-react';

interface LiveCosmicObservatoryProps {
  onNavigate: (page: AppPage) => void;
}

type ScaleMode = 'inner' | 'full' | 'outer' | 'exoplanet' | 'sky';
type RenderEngine = '3d' | '2d';
type CameraViewPreset = 'perspective' | 'top-down' | 'edge-on';

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

  // Data state — initialize immediately with verified baseline snapshot (zero blank screens)
  const [observatoryData, setObservatoryData] = useState<ObservatoryApiResponse>(DEFAULT_OBSERVATORY_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(false);
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

  // Collapsible inspector panel & UI interaction state
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('perspective');
  const [sceneReadyEpoch, setSceneReadyEpoch] = useState<number>(0);

  // Fast refs for 60fps Three.js interaction loop
  const selectedObjectIdRef = useRef<string>(selectedObjectId);
  selectedObjectIdRef.current = selectedObjectId;

  const isInfoPanelOpenRef = useRef<boolean>(isInfoPanelOpen);
  isInfoPanelOpenRef.current = isInfoPanelOpen;

  const showLabelsRef = useRef<boolean>(showLabels);
  showLabelsRef.current = showLabels;

  // Refs for 3D and 2D viewports
  const mount3DRef = useRef<HTMLDivElement | null>(null);
  const canvas2DRef = useRef<HTMLCanvasElement | null>(null);

  // State refs accessed by 60fps render loop to prevent React re-render storms
  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  const scaleModeRef = useRef<ScaleMode>(scaleMode);
  scaleModeRef.current = scaleMode;

  const simulatedTimeRef = useRef<number>(simulatedDate.getTime());
  const lastFetchedEpochRef = useRef<number>(simulatedDate.getTime());

  // Quick lookup map for objects accessed in 60fps render loop
  const objectsDataMapRef = useRef<Map<string, ObservatoryObject>>(new Map());

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
    currentDistance: number;
    targetDistance: number;
    currentTheta: number;
    targetTheta: number;
    currentPhi: number;
    targetPhi: number;
    lookAtCurrent: THREE.Vector3;
    lookAtTarget: THREE.Vector3;
    focusedObjectId: string | null;
  } | null>(null);

  // Keep simulatedTimeRef synchronized with external date changes
  useEffect(() => {
    simulatedTimeRef.current = simulatedDate.getTime();
    setDateInputVal(simulatedDate.toISOString().slice(0, 16));
  }, [simulatedDate]);

  // Fetch astronomical data for the given date (non-blocking progressive sync)
  const loadObservatoryData = useCallback(async (epochDate?: Date) => {
    setIsLoading(true);
    setDataError(null);
    try {
      const dateParam = epochDate ? epochDate.toISOString() : undefined;
      const res = await fetchObservatoryObjects({ date: dateParam });
      if (res.data && res.data.success) {
        setObservatoryData(res.data as unknown as ObservatoryApiResponse);
      } else {
        // Keep existing snapshot active, do not discard working data
        setDataError('Astronomical telemetry gateway returned unformatted response. Preserving active scene.');
      }
    } catch (err: unknown) {
      console.warn('[LiveCosmicObservatory] Ephemeris refresh failed, retaining active baseline:', err);
      setDataError('Could not reach astronomical ephemeris gateway. Retaining verified Keplerian calculations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial non-blocking background data load
  useEffect(() => {
    loadObservatoryData(simulatedDate);
  }, []);

  // Filtered objects based on category and search
  const filteredObjects = useMemo(() => {
    if (!observatoryData?.objects) return [];
    const searchClean = searchQuery.trim().toLowerCase();
    return observatoryData.objects.filter(obj => {
      const matchesCategory = selectedCategory === 'all' || obj.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchClean) return true;
      const nameMatch = typeof obj.name === 'string' && obj.name.toLowerCase().includes(searchClean);
      const desMatch = typeof obj.designation === 'string' && obj.designation.toLowerCase().includes(searchClean);
      const classMatch = typeof obj.classification === 'string' && obj.classification.toLowerCase().includes(searchClean);
      return nameMatch || desMatch || classMatch;
    });
  }, [observatoryData, selectedCategory, searchQuery]);

  // Update object data lookup map for the 60fps render loop
  useEffect(() => {
    const map = new Map<string, ObservatoryObject>();
    if (observatoryData?.objects) {
      observatoryData.objects.forEach(o => map.set(o.id, o));
    }
    objectsDataMapRef.current = map;
  }, [observatoryData]);

  // Selected object record
  const selectedObject = useMemo(() => {
    if (!observatoryData?.objects) return null;
    return observatoryData.objects.find(o => o.id === selectedObjectId) || observatoryData.objects[0] || null;
  }, [observatoryData, selectedObjectId]);

  // Real-time telemetry calculations for selected object during continuous scrubbing/playback
  const realtimeSelectedState = useMemo(() => {
    if (!selectedObject?.orbitalElements) return null;
    const kepler: KeplerianElements = {
      a: selectedObject.orbitalElements.semiMajorAxisAU,
      e: selectedObject.orbitalElements.eccentricity || 0,
      i: selectedObject.orbitalElements.inclinationDeg || 0,
      node: selectedObject.orbitalElements.longitudeOfAscendingNodeDeg || 0,
      peri: selectedObject.orbitalElements.argumentOfPerihelionDeg || 0,
      M0: selectedObject.orbitalElements.meanAnomalyDeg || 0,
      epochJd: selectedObject.orbitalElements.epochJd || 2451545.0,
      periodYears: selectedObject.orbitalElements.orbitalPeriodYears,
      meanMotionDegDay: selectedObject.orbitalElements.meanMotionDegDay
    };
    return propagateElementsClient(kepler, simulatedDate);
  }, [selectedObject, simulatedDate]);

  // Sourced close-approach encounter records for asteroids & small bodies
  const selectedCloseApproach = useMemo(() => {
    if (!selectedObject) return null;
    const targetDes = (selectedObject.designation || selectedObject.id || '').trim().toLowerCase();
    if (!targetDes) return null;
    
    // Check verified presets
    for (const [key, preset] of Object.entries(VERIFIED_NEO_PRESETS)) {
      const pKey = key.toLowerCase();
      const pName = ((preset.fullName || preset.name || preset.shortName || '') as string).toLowerCase();
      if (pKey === targetDes || (pName && pName.includes(targetDes)) || (targetDes && targetDes.includes(pKey))) {
        if (preset.closeApproach) return preset.closeApproach;
      }
    }
    // Check fallback approaches
    for (const app of VERIFIED_FALLBACK_APPROACHES) {
      const aDes = ((app.designation || '') as string).toLowerCase();
      const aName = ((app.fullName || app.designation || '') as string).toLowerCase();
      if (aDes === targetDes || (aName && aName.includes(targetDes)) || (targetDes && aDes && targetDes.includes(aDes))) {
        return app;
      }
    }
    return null;
  }, [selectedObject]);

  // Procedural & physical profile for small bodies
  const selectedPhysicalInfo = useMemo(() => {
    if (!selectedObject) return null;
    return getAsteroidPhysicalInfo(selectedObject.designation || selectedObject.id);
  }, [selectedObject]);

  // Autocomplete suggestions for quick search
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !observatoryData?.objects) return [];
    const q = searchQuery.toLowerCase().trim();
    return observatoryData.objects.filter(o => {
      const nameMatch = typeof o.name === 'string' && o.name.toLowerCase().includes(q);
      const desMatch = typeof o.designation === 'string' && o.designation.toLowerCase().includes(q);
      const classMatch = typeof o.classification === 'string' && o.classification.toLowerCase().includes(q);
      return nameMatch || desMatch || classMatch;
    }).slice(0, 8);
  }, [searchQuery, observatoryData]);

  // Handle selecting an autocomplete suggestion
  const handleSelectSuggestion = (objId: string) => {
    setSelectedObjectId(objId);
    setIsSearchFocused(false);
    setSearchQuery('');
    if (threeStateRef.current) {
      threeStateRef.current.focusedObjectId = objId;
      const grp = threeStateRef.current.objectsMap.get(objId);
      if (grp) {
        threeStateRef.current.lookAtTarget.copy(grp.position);
      }
    }
  };

  // Camera view angle presets
  const handleSetCameraAngle = (angle: CameraViewPreset) => {
    setCameraPreset(angle);
    if (!threeStateRef.current) return;
    if (angle === 'top-down') {
      threeStateRef.current.targetPhi = 0.04;
      threeStateRef.current.targetTheta = 0;
    } else if (angle === 'edge-on') {
      threeStateRef.current.targetPhi = Math.PI / 2;
      threeStateRef.current.targetTheta = 0;
    } else {
      threeStateRef.current.targetPhi = 0.45;
      threeStateRef.current.targetTheta = 0;
    }
  };

  // Preset Epoch Handler (smooth jump without scene reconstruction)
  const handleSelectPreset = (iso: string) => {
    const newDate = new Date(iso);
    if (isNaN(newDate.getTime())) return;
    setSimulatedDate(newDate);
    simulatedTimeRef.current = newDate.getTime();
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
      simulatedTimeRef.current = parsed.getTime();
      setIsPlaying(false);
      lastFetchedEpochRef.current = parsed.getTime();
      loadObservatoryData(parsed);
    }
  };

  // Step Time helpers
  const handleStepDays = (days: number) => {
    const newTime = simulatedTimeRef.current + days * 86400 * 1000;
    const newDate = new Date(newTime);
    simulatedTimeRef.current = newTime;
    setSimulatedDate(newDate);
    setDateInputVal(newDate.toISOString().slice(0, 16));
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
  // 3D THREE.JS VIEWPORT INITIALIZATION & UNIFIED 60FPS RENDER LOOP
  // =========================================================================
  useEffect(() => {
    if (renderEngine !== '3d' || !mount3DRef.current) return;
    const container = mount3DRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02040A); // Cinematic deep space void

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50000);
    camera.position.set(0, 45, 95);

    // 2. Renderer
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

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);
    } catch (err: unknown) {
      console.warn('[LiveCosmicObservatory] WebGL initialization failed, switching to 2D radar:', err);
      setRenderEngine('2d');
      return;
    }

    // 3. Lighting (Sun is primary illumination source)
    const ambientLight = new THREE.AmbientLight(0x1E293B, 0.45);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xFFF9E6, 2.6, 4000, 0.4);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const fillLight = new THREE.DirectionalLight(0x38BDF8, 0.15);
    fillLight.position.set(50, 70, 50);
    scene.add(fillLight);

    // 4. Restrained, Cinematic Multi-Tier Starfield
    const starGroup = new THREE.Group();

    // Tier 1: Distant microscopic stars (2500 points)
    const distantStarGeo = new THREE.BufferGeometry();
    const distantCount = 2500;
    const distantPositions = new Float32Array(distantCount * 3);
    for (let i = 0; i < distantCount * 3; i += 3) {
      const radius = 2200 + Math.random() * 2500;
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
      opacity: 0.65 
    });
    starGroup.add(new THREE.Points(distantStarGeo, distantStarMat));

    // Tier 2: Prominent navigation stars with spectral colors (250 points)
    const brightStarGeo = new THREE.BufferGeometry();
    const brightCount = 250;
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
      const radius = 2000 + Math.random() * 2000;
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
      size: 2.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.90
    });
    starGroup.add(new THREE.Points(brightStarGeo, brightStarMat));

    // Tier 3: Subtle galactic plane dust band (1000 points)
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyCount = 1000;
    const galaxyPositions = new Float32Array(galaxyCount * 3);
    for (let i = 0; i < galaxyCount * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2400 + Math.random() * 1600;
      const spread = (Math.random() - 0.5) * 220;
      galaxyPositions[i] = Math.cos(angle) * r;
      galaxyPositions[i + 1] = spread;
      galaxyPositions[i + 2] = Math.sin(angle) * r;
    }
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
    const galaxyMat = new THREE.PointsMaterial({
      color: 0x94A3B8,
      size: 2.5,
      transparent: true,
      opacity: 0.15
    });
    starGroup.add(new THREE.Points(galaxyGeo, galaxyMat));

    scene.add(starGroup);

    // 5. Groups for Dynamic Celestial Objects & Orbit Lines
    const objectsMap = new Map<string, THREE.Group>();
    const orbitLinesGroup = new THREE.Group();
    scene.add(orbitLinesGroup);

    // Dynamic 3D Targeting Reticle for Selected Object
    const reticleGroup = new THREE.Group();
    reticleGroup.name = 'selection-reticle';
    reticleGroup.visible = false;

    // Reticle inner primary ring
    const reticleRingGeo = new THREE.RingGeometry(1.3, 1.45, 48);
    const reticleRingMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    reticleGroup.add(new THREE.Mesh(reticleRingGeo, reticleRingMat));

    // Reticle outer dashed/bracket ring
    const reticleOuterGeo = new THREE.RingGeometry(2.0, 2.12, 48, 1, 0, Math.PI * 1.85);
    const reticleOuterMat = new THREE.MeshBasicMaterial({
      color: 0x0284C7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    const reticleOuterMesh = new THREE.Mesh(reticleOuterGeo, reticleOuterMat);
    reticleGroup.add(reticleOuterMesh);

    // Precision 4-axis crosshair ticks
    const tickMat = new THREE.LineBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.95
    });
    const tickPoints = [
      new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(0, 2.3, 0),
      new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(0, -2.3, 0),
      new THREE.Vector3(1.5, 0, 0), new THREE.Vector3(2.3, 0, 0),
      new THREE.Vector3(-1.5, 0, 0), new THREE.Vector3(-2.3, 0, 0)
    ];
    const tickGeo = new THREE.BufferGeometry().setFromPoints(tickPoints);
    reticleGroup.add(new THREE.LineSegments(tickGeo, tickMat));

    scene.add(reticleGroup);

    // 6. Camera Orbit Interaction Setup with smooth inertial easing & Raycaster selection
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let clickStartX = 0;
    let clickStartY = 0;
    let clickStartTime = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      clickStartX = e.clientX;
      clickStartY = e.clientY;
      clickStartTime = performance.now();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !threeStateRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      threeStateRef.current.targetTheta -= deltaX * 0.007;
      threeStateRef.current.targetPhi = Math.max(0.05, Math.min(Math.PI - 0.05, threeStateRef.current.targetPhi - deltaY * 0.007));
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;
      const moveDist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);
      const pressDuration = performance.now() - clickStartTime;

      // Click detected (not a pan or rotate drag)
      if (moveDist < 7 && pressDuration < 380 && threeStateRef.current) {
        const rect = domElement.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        threeStateRef.current.raycaster.setFromCamera(
          new THREE.Vector2(mouseX, mouseY),
          threeStateRef.current.camera
        );
        const candidateMeshes: { mesh: THREE.Object3D; id: string }[] = [];
        threeStateRef.current.objectsMap.forEach((grp, id) => {
          grp.traverse(child => {
            if (child instanceof THREE.Mesh && !child.name.includes('corona') && !child.name.includes('ring')) {
              candidateMeshes.push({ mesh: child, id });
            }
          });
        });
        const intersects = threeStateRef.current.raycaster.intersectObjects(
          candidateMeshes.map(c => c.mesh),
          false
        );
        if (intersects.length > 0) {
          const hitMesh = intersects[0].object;
          const match = candidateMeshes.find(c => c.mesh === hitMesh);
          if (match) {
            setSelectedObjectId(match.id);
            threeStateRef.current.focusedObjectId = match.id;
            const targetGrp = threeStateRef.current.objectsMap.get(match.id);
            if (targetGrp) {
              threeStateRef.current.lookAtTarget.copy(targetGrp.position);
            }
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!threeStateRef.current) return;
      threeStateRef.current.targetDistance = Math.max(8, Math.min(1800, threeStateRef.current.targetDistance + e.deltaY * 0.08));
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
      previousMousePosition: { x: 0, y: 0 },
      currentDistance: 95,
      targetDistance: 95,
      currentTheta: 0,
      targetTheta: 0,
      currentPhi: 0.45,
      targetPhi: 0.45,
      lookAtCurrent: new THREE.Vector3(0, 0, 0),
      lookAtTarget: new THREE.Vector3(0, 0, 0),
      focusedObjectId: null
    };

    // Trigger scene population immediately
    setSceneReadyEpoch(prev => prev + 1);

    // Responsive Resize Handler with ResizeObserver
    const handleResize = () => {
      if (!container || !threeStateRef.current) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      threeStateRef.current.camera.aspect = w / h;
      threeStateRef.current.camera.updateProjectionMatrix();
      threeStateRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('[LiveCosmicObservatory] WebGL context lost, switching to 2D radar fallback.');
      setRenderEngine('2d');
    };
    domElement.addEventListener('webglcontextlost', handleContextLost, false);

    // Single Unified 60fps Animation & Keplerian Propagation Loop
    let animId: number;
    let lastFrameTime = performance.now();
    let lastHudUpdate = 0;

    const renderLoop = (now: number) => {
      if (isDocumentVisible && threeStateRef.current) {
        // Safe capped delta time (prevents speed explosion on tab focus or frame stalls)
        const deltaSec = Math.min((now - lastFrameTime) / 1000, 0.1);
        lastFrameTime = now;

        const threeState = threeStateRef.current;
        const currentScale = scaleModeRef.current;

        let auScale = 12;
        if (currentScale === 'full') auScale = 3.5;
        else if (currentScale === 'outer') auScale = 0.35;
        else if (currentScale === 'exoplanet') auScale = 85;
        else if (currentScale === 'sky') auScale = 1.0;

        // Advance simulation time if playing
        if (isPlayingRef.current) {
          const deltaMs = deltaSec * playbackSpeedRef.current * 86400 * 1000;
          simulatedTimeRef.current += deltaMs;

          // Throttle React state updates to ~10Hz to prevent React re-render storms
          if (now - lastHudUpdate > 100) {
            lastHudUpdate = now;
            const currentSimDate = new Date(simulatedTimeRef.current);
            setSimulatedDate(currentSimDate);
            setDateInputVal(currentSimDate.toISOString().slice(0, 16));
          }
        }

        const simDate = new Date(simulatedTimeRef.current);

        // Smooth real-time Keplerian orbital positioning for all active celestial objects
        for (const [id, grp] of threeState.objectsMap.entries()) {
          const obj = objectsDataMapRef.current.get(id);
          if (!obj) continue;

          if (obj.orbitalElements && obj.orbitalElements.semiMajorAxisAU > 0) {
            // Analytical Keplerian solver (accurate, zero network delay, smooth 60fps)
            const kepler: KeplerianElements = {
              a: obj.orbitalElements.semiMajorAxisAU,
              e: obj.orbitalElements.eccentricity || 0,
              i: obj.orbitalElements.inclinationDeg || 0,
              node: obj.orbitalElements.longitudeOfAscendingNodeDeg || 0,
              peri: obj.orbitalElements.argumentOfPerihelionDeg || 0,
              M0: obj.orbitalElements.meanAnomalyDeg || 0,
              epochJd: obj.orbitalElements.epochJd || 2451545.0,
              periodYears: obj.orbitalElements.orbitalPeriodYears,
              meanMotionDegDay: obj.orbitalElements.meanMotionDegDay
            };
            const state = propagateElementsClient(kepler, simDate);
            grp.position.set(
              state.heliocentricAU.x * auScale,
              state.heliocentricAU.z * auScale,
              state.heliocentricAU.y * auScale
            );
          } else if (obj.category === 'exoplanets' && obj.orbitalElements) {
            // Smooth Keplerian phase for exoplanet around host star
            const a = (obj.orbitalElements.semiMajorAxisAU || 0.2) * auScale;
            const periodDays = obj.exoplanetParams?.orbitalPeriodDays || 30;
            const phase = ((simulatedTimeRef.current / 86400000) % periodDays) / periodDays * Math.PI * 2;
            grp.position.set(a * Math.cos(phase), 0, a * Math.sin(phase));
          }

          // Believable axial rotation and tumbling
          if (!isReducedMotion) {
            const mesh = grp.getObjectByName(`${id}-mesh`) as THREE.Mesh | undefined;
            if (mesh && mesh.userData?.isSmallBody) {
              updateAsteroidTumble(mesh, deltaSec, mesh.userData.designation || id);
            } else {
              grp.rotation.y += deltaSec * 0.35;
            }
          }

          // Dynamic billboard label visibility
          const label = grp.getObjectByName(`${id}-label`);
          if (label) {
            label.visible = showLabelsRef.current;
          }
        }

        // Smooth camera lerp (no snapping, no fighting)
        const lerpFactor = isReducedMotion ? 1.0 : 0.08;
        threeState.currentDistance += (threeState.targetDistance - threeState.currentDistance) * lerpFactor;
        threeState.currentTheta += (threeState.targetTheta - threeState.currentTheta) * lerpFactor;
        threeState.currentPhi += (threeState.targetPhi - threeState.currentPhi) * lerpFactor;

        // Smooth camera target tracking if focused on a specific object
        if (threeState.focusedObjectId) {
          const focusedGroup = threeState.objectsMap.get(threeState.focusedObjectId);
          if (focusedGroup) {
            threeState.lookAtTarget.copy(focusedGroup.position);
          }
        }

        threeState.lookAtCurrent.lerp(threeState.lookAtTarget, lerpFactor);

        const sinPhiRadius = threeState.currentDistance * Math.sin(threeState.currentPhi);
        camera.position.x = threeState.lookAtCurrent.x + sinPhiRadius * Math.sin(threeState.currentTheta);
        camera.position.y = threeState.lookAtCurrent.y + threeState.currentDistance * Math.cos(threeState.currentPhi);
        camera.position.z = threeState.lookAtCurrent.z + sinPhiRadius * Math.cos(threeState.currentTheta);
        camera.lookAt(threeState.lookAtCurrent);

        // Update 3D Targeting Reticle position & tracking
        const activeSelectedId = selectedObjectIdRef.current;
        const targetGroup = threeState.objectsMap.get(activeSelectedId);
        if (targetGroup) {
          reticleGroup.visible = true;
          reticleGroup.position.copy(targetGroup.position);
          reticleGroup.quaternion.copy(camera.quaternion);
          const distToTarget = camera.position.distanceTo(targetGroup.position);
          const dynamicScale = Math.max(0.65, Math.min(distToTarget * 0.045, 120));
          reticleOuterMesh.rotation.z += deltaSec * 0.6;
          const pulse = 1.0 + Math.sin(now * 0.005) * 0.04;
          reticleGroup.scale.set(dynamicScale * pulse, dynamicScale * pulse, dynamicScale * pulse);
        } else {
          reticleGroup.visible = false;
        }

        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('webglcontextlost', handleContextLost);

      // Deep GPU resource disposal to prevent WebGL context exhaustion & memory leaks
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
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      threeStateRef.current = null;
    };
  }, [renderEngine, isDocumentVisible, isReducedMotion]);

  // Synchronize 3D Scene Objects & Stable Orbit Lines (runs ONLY when objects or scale mode change, NOT on every frame)
  useEffect(() => {
    if (renderEngine !== '3d' || !threeStateRef.current || !observatoryData?.objects) return;
    const { scene, objectsMap, orbitLinesGroup } = threeStateRef.current;

    // Clear existing orbit lines cleanly
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
    else if (scaleMode === 'outer') auScale = 0.35;
    else if (scaleMode === 'exoplanet') auScale = 85;
    else if (scaleMode === 'sky') auScale = 1.0;

    const currentObjectIds = new Set(filteredObjects.map(o => o.id));

    // Remove obsolete objects
    for (const [id, grp] of objectsMap.entries()) {
      if (!currentObjectIds.has(id)) {
        scene.remove(grp);
        objectsMap.delete(id);
      }
    }

    // Add or reuse active object groups
    filteredObjects.forEach(obj => {
      let group = objectsMap.get(obj.id);
      if (!group) {
        group = new THREE.Group();
        group.name = obj.id;

        // Base Mesh Sizing
        let meshRadius = 0.9;
        if (obj.id === 'sun') meshRadius = 3.2;
        else if (['jupiter', 'saturn'].includes(obj.id)) meshRadius = 2.0;
        else if (['uranus', 'neptune'].includes(obj.id)) meshRadius = 1.5;
        else if (['ceres', 'vesta', 'eros', 'apophis'].includes(obj.id)) meshRadius = 0.65;
        else if (obj.category === 'exoplanets') meshRadius = 1.1;
        else if (obj.category === 'deep-sky') meshRadius = 1.6;
        else if (obj.category === 'spherex-targets') meshRadius = 1.2;

        const isSmallBody = obj.category === 'asteroids-comets' ||
                            obj.category === 'distant-tnos' ||
                            ['ceres', 'vesta', 'eros', 'apophis', 'halley', 'churyumov', 'bennu', 'ryugu', 'toutatis'].includes((obj.id || '').toLowerCase());

        let sphereGeo: THREE.BufferGeometry;
        let mat: THREE.Material;

        if (isSmallBody) {
          const isPha = (typeof obj.classification === 'string' && obj.classification.toLowerCase().includes('hazardous')) ||
            ['apophis', '99942', 'bennu', '101955', 'toutatis', '4179'].includes((obj.id || '').toLowerCase());
          // Authentic procedural 3D asteroid geometry with craters & ridges
          sphereGeo = createAsteroidGeometry(obj.designation || obj.id, meshRadius);
          mat = createAsteroidMaterial(obj.designation || obj.id, isPha);
        } else if (obj.id === 'sun') {
          sphereGeo = new THREE.SphereGeometry(meshRadius, 32, 32);
          const sunTex = createSunTexture();
          mat = new THREE.MeshBasicMaterial({ map: sunTex });

          // Solar coronal halos with additive blending
          const coronaGeo = new THREE.SphereGeometry(3.6, 24, 24);
          const coronaMat = new THREE.MeshBasicMaterial({
            color: 0xFDE047,
            transparent: true,
            opacity: 0.32,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
          });
          group.add(new THREE.Mesh(coronaGeo, coronaMat));

          const outerCoronaGeo = new THREE.SphereGeometry(4.8, 24, 24);
          const outerCoronaMat = new THREE.MeshBasicMaterial({
            color: 0xF97316,
            transparent: true,
            opacity: 0.18,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
          });
          group.add(new THREE.Mesh(outerCoronaGeo, outerCoronaMat));
        } else if (obj.motionType === 'observation-footprint') {
          sphereGeo = new THREE.SphereGeometry(meshRadius, 32, 32);
          mat = new THREE.MeshBasicMaterial({ color: obj.color, wireframe: true });
        } else if (obj.category === 'solar-system' && NASA_JPL_TEXTURE_MAPS[obj.id]) {
          sphereGeo = new THREE.SphereGeometry(meshRadius, 32, 32);
          const stdMat = new THREE.MeshStandardMaterial({
            roughness: 0.7,
            metalness: 0.1
          });
          const initialTex = loadPlanetTexture(obj.id, (loadedTex) => {
            stdMat.map = loadedTex;
            stdMat.needsUpdate = true;
          });
          stdMat.map = initialTex;
          mat = stdMat;
        } else {
          sphereGeo = new THREE.SphereGeometry(meshRadius, 32, 32);
          mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(obj.color || '#38BDF8'),
            roughness: 0.65,
            metalness: 0.15
          });
        }

        const sphereMesh = new THREE.Mesh(sphereGeo, mat);
        sphereMesh.name = `${obj.id}-mesh`;
        sphereMesh.userData = { isSmallBody, designation: obj.designation || obj.id };
        group.add(sphereMesh);

        // 3D Billboard Label Sprite
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 256;
        labelCanvas.height = 64;
        const lctx = labelCanvas.getContext('2d');
        if (lctx) {
          lctx.clearRect(0, 0, 256, 64);
          lctx.fillStyle = obj.id === selectedObjectId ? '#38BDF8' : '#94A3B8';
          lctx.font = `${obj.id === selectedObjectId ? 'bold ' : 'normal '}22px monospace`;
          lctx.textAlign = 'center';
          lctx.textBaseline = 'middle';
          lctx.fillText(obj.name.split(' ')[0], 128, 32);
        }
        const labelTex = new THREE.CanvasTexture(labelCanvas);
        const labelMat = new THREE.SpriteMaterial({
          map: labelTex,
          transparent: true,
          opacity: 0.85,
          depthTest: false
        });
        const labelSprite = new THREE.Sprite(labelMat);
        labelSprite.name = `${obj.id}-label`;
        labelSprite.scale.set(5.5, 1.4, 1);
        labelSprite.position.set(0, meshRadius + 1.2, 0);
        labelSprite.visible = showLabels;
        group.add(labelSprite);

        // Saturn's Ring System
        if (obj.id === 'saturn') {
          const ringGeo = new THREE.RingGeometry(2.5, 4.2, 48);
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
      } else {
        const existingLabel = group.getObjectByName(`${obj.id}-label`);
        if (existingLabel) {
          existingLabel.visible = showLabels;
        }
      }

      // Initial Cartesian position
      if (obj.heliocentricAU) {
        group.position.set(
          obj.heliocentricAU.x * auScale,
          obj.heliocentricAU.z * auScale,
          obj.heliocentricAU.y * auScale
        );
      } else if (obj.category === 'deep-sky' || obj.category === 'spherex-targets') {
        // Project onto celestial sphere using Right Ascension and Declination
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

        const sphereDist = 120;
        const raRad = (raHours * 15) * (Math.PI / 180);
        const decRad = decDeg * (Math.PI / 180);

        group.position.set(
          sphereDist * Math.cos(decRad) * Math.cos(raRad),
          sphereDist * Math.sin(decRad),
          sphereDist * Math.cos(decRad) * Math.sin(raRad)
        );
      }

      // Draw Orbit Lines once when valid orbital elements exist (cached, zero garbage collection thrash)
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

          const cosW = Math.cos(periRad), sinW = Math.sin(periRad);
          const cosN = Math.cos(nodeRad), sinN = Math.sin(nodeRad);
          const cosI = Math.cos(incRad), sinI = Math.sin(incRad);

          const x = (cosW * cosN - sinW * sinN * cosI) * xOrb + (-sinW * cosN - cosW * sinN * cosI) * yOrb;
          const y = (cosW * sinN + sinW * cosN * cosI) * xOrb + (-sinW * sinN + cosW * sinN * cosI) * yOrb;
          const z = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

          linePoints.push(new THREE.Vector3(x, z, y));
        }

        const orbitGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const isSelected = obj.id === selectedObjectId;
        const lineMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(isSelected ? '#38BDF8' : (obj.color || '#64748B')),
          transparent: true,
          opacity: isSelected ? 0.85 : 0.28
        });
        const orbitLine = new THREE.Line(orbitGeo, lineMat);
        orbitLinesGroup.add(orbitLine);
      }
    });
  }, [renderEngine, observatoryData, filteredObjects, scaleMode, showOrbits, selectedObjectId, sceneReadyEpoch]);

  // Focus Camera Smoothly on Selected Object
  const handleFocusSelected = () => {
    if (!threeStateRef.current || !selectedObject) return;
    const group = threeStateRef.current.objectsMap.get(selectedObject.id);
    if (!group) return;

    threeStateRef.current.focusedObjectId = selectedObject.id;
    threeStateRef.current.lookAtTarget.copy(group.position);

    // Frame object comfortably
    let focusDist = 28;
    if (selectedObject.id === 'sun') focusDist = 45;
    else if (['jupiter', 'saturn'].includes(selectedObject.id)) focusDist = 20;
    else if (scaleMode === 'outer') focusDist = 18;
    else if (scaleMode === 'exoplanet') focusDist = 22;

    threeStateRef.current.targetDistance = focusDist;
  };

  // Reset Camera View Smoothly to Default
  const handleResetView = () => {
    if (!threeStateRef.current) return;
    threeStateRef.current.focusedObjectId = null;
    threeStateRef.current.lookAtTarget.set(0, 0, 0);
    threeStateRef.current.targetTheta = 0;
    threeStateRef.current.targetPhi = 0.45;
    threeStateRef.current.targetDistance = scaleMode === 'outer' ? 240 : scaleMode === 'full' ? 140 : 95;
    setCameraPreset('perspective');
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
    ctx.fillStyle = '#02040A';
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
        ctx.font = '10px monospace';
        ctx.fillText(`${h}h`, x + 4, 16);
      }

      for (let deg = -60; deg <= 60; deg += 30) {
        const y = ((90 - deg) / 180) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = '10px monospace';
        ctx.fillText(`${deg > 0 ? '+' : ''}${deg}°`, 6, y - 4);
      }

      // Plot Objects on Sky Grid
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

        ctx.fillStyle = obj.color || '#38BDF8';
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 5.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#F8FAFC';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (showLabels || isSelected) {
          ctx.fillStyle = isSelected ? '#F8FAFC' : '#94A3B8';
          ctx.font = `${isSelected ? 'bold ' : ''}10px monospace`;
          ctx.fillText(obj.name.split(' ')[0], x + 6, y - 2);
        }
      });
    } else {
      // 2D RADAR HELIOCENTRIC PROJECTION
      let pxPerAU = Math.min(width, height) / 12;
      if (scaleMode === 'full') pxPerAU = Math.min(width, height) / 75;
      else if (scaleMode === 'outer') pxPerAU = Math.min(width, height) / 1800;
      else if (scaleMode === 'exoplanet') pxPerAU = Math.min(width, height) / 1.2;

      // Range Rings
      const ringDistances = scaleMode === 'inner' ? [1, 2, 3, 5] : scaleMode === 'full' ? [5, 10, 20, 30] : [100, 300, 600, 1000];
      ringDistances.forEach(rAU => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, rAU * pxPerAU, 0, Math.PI * 2);
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#64748B';
        ctx.font = '10px monospace';
        ctx.fillText(`${rAU} AU`, centerX + rAU * pxPerAU + 4, centerY - 4);
      });

      // Sun at Center
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#F5C451';
      ctx.fill();

      // Draw Orbit Lines
      if (showOrbits) {
        filteredObjects.forEach(obj => {
          if (!obj.orbitalElements || obj.orbitalElements.semiMajorAxisAU <= 0) return;
          const a = obj.orbitalElements.semiMajorAxisAU * pxPerAU;
          const e = obj.orbitalElements.eccentricity || 0;
          const b = a * Math.sqrt(Math.max(0.0001, 1 - e * e));
          const periShift = a * e;

          ctx.save();
          ctx.translate(centerX, centerY);
          const angle = ((obj.orbitalElements.longitudeOfAscendingNodeDeg || 0) + (obj.orbitalElements.argumentOfPerihelionDeg || 0)) * (Math.PI / 180);
          ctx.rotate(angle);

          ctx.strokeStyle = obj.id === selectedObjectId ? '#38BDF8' : (obj.color || '#38BDF8');
          ctx.globalAlpha = obj.id === selectedObjectId ? 0.85 : 0.25;
          ctx.lineWidth = obj.id === selectedObjectId ? 1.5 : 1;

          if (obj.motionType === 'illustrative-exoplanet' || obj.isHypothetical) {
            ctx.setLineDash([4, 4]);
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

        if (obj.orbitalElements && obj.orbitalElements.semiMajorAxisAU > 0) {
          const kepler: KeplerianElements = {
            a: obj.orbitalElements.semiMajorAxisAU,
            e: obj.orbitalElements.eccentricity || 0,
            i: obj.orbitalElements.inclinationDeg || 0,
            node: obj.orbitalElements.longitudeOfAscendingNodeDeg || 0,
            peri: obj.orbitalElements.argumentOfPerihelionDeg || 0,
            M0: obj.orbitalElements.meanAnomalyDeg || 0,
            epochJd: obj.orbitalElements.epochJd || 2451545.0,
            periodYears: obj.orbitalElements.orbitalPeriodYears,
            meanMotionDegDay: obj.orbitalElements.meanMotionDegDay
          };
          const state = propagateElementsClient(kepler, simulatedDate);
          x = centerX + state.heliocentricAU.x * pxPerAU;
          y = centerY - state.heliocentricAU.y * pxPerAU;
        } else if (obj.heliocentricAU) {
          x = centerX + obj.heliocentricAU.x * pxPerAU;
          y = centerY - obj.heliocentricAU.y * pxPerAU;
        }

        const isSelected = obj.id === selectedObjectId;

        ctx.fillStyle = obj.color || '#38BDF8';
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 5.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#F8FAFC';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (showLabels || isSelected) {
          ctx.fillStyle = isSelected ? '#F8FAFC' : '#94A3B8';
          ctx.font = `${isSelected ? 'bold ' : ''}10px monospace`;
          ctx.fillText(obj.name.split(' ')[0], x + 6, y + 3);
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
                {filteredObjects.length} Objects Active
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
              Live Cosmic Observatory
            </h1>
            <p className="text-xs sm:text-sm text-[#A7B4CC] max-w-3xl leading-relaxed">
              Explore the Universe. Discover the Unknown. High-precision analytical orbital viewer for all supported astronomical objects across NASA, JPL, IPAC, and international ephemeris catalogues.
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
                Last Data Sync: {observatoryData?.retrievalTimestamp ? new Date(observatoryData.retrievalTimestamp).toLocaleTimeString() : 'Verified Baseline'}
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
      <div className={`grid grid-cols-1 ${isInfoPanelOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 items-start transition-all duration-300`}>
        {/* VIEWPORT & INTERACTIVE CANVAS */}
        <div className={`${isInfoPanelOpen ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4 transition-all duration-300`}>
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
                {(['inner', 'full', 'outer', 'exoplanet', 'sky'] as ScaleMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setScaleMode(mode);
                      if (threeStateRef.current) {
                        if (mode === 'outer') threeStateRef.current.targetDistance = 240;
                        else if (mode === 'full') threeStateRef.current.targetDistance = 140;
                        else if (mode === 'exoplanet') threeStateRef.current.targetDistance = 60;
                        else if (mode === 'sky') threeStateRef.current.targetDistance = 160;
                        else threeStateRef.current.targetDistance = 90;
                      }
                    }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer capitalize ${
                      scaleMode === mode ? 'bg-[#0E1B38] text-[#38BDF8] font-bold border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {mode === 'inner' ? 'Inner (0-5 AU)' : mode === 'full' ? 'Full (0-35 AU)' : mode === 'outer' ? 'Outer (1200 AU)' : mode === 'exoplanet' ? 'Exo Orbit' : 'Sky View'}
                  </button>
                ))}
              </div>

              {/* Camera Perspective Angle Presets */}
              <div className="hidden sm:flex rounded-lg bg-[#050B1A] p-0.5 border border-[#1E293B] text-xs font-mono">
                <button
                  onClick={() => handleSetCameraAngle('perspective')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    cameraPreset === 'perspective' ? 'bg-[#0E1B38] text-[#38BDF8] font-bold border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                  title="3D Perspective view"
                >
                  Perspective
                </button>
                <button
                  onClick={() => handleSetCameraAngle('top-down')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    cameraPreset === 'top-down' ? 'bg-[#0E1B38] text-[#38BDF8] font-bold border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                  title="Top-down Ecliptic North Pole view"
                >
                  Top-Down
                </button>
                <button
                  onClick={() => handleSetCameraAngle('edge-on')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    cameraPreset === 'edge-on' ? 'bg-[#0E1B38] text-[#38BDF8] font-bold border border-[#38BDF8]/40' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                  title="Edge-on orbital plane view"
                >
                  Edge-On
                </button>
              </div>

              {/* Display Layer & Camera Controls */}
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
                  title="Focus camera smoothly on selected object"
                >
                  <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Focus</span>
                </button>

                <button
                  onClick={handleResetView}
                  className="px-2.5 py-1 rounded-lg bg-[#050B1A] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-1 transition-all cursor-pointer"
                  title="Reset camera vantage point to system center"
                >
                  <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                    isInfoPanelOpen ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40' : 'bg-[#050B1A] text-[#94A3B8] hover:text-[#F8FAFC] border-[#1E293B]'
                  }`}
                  title={isInfoPanelOpen ? 'Collapse inspector panel for full widescreen 3D' : 'Open inspector panel'}
                >
                  <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span className="hidden sm:inline">Inspector: {isInfoPanelOpen ? 'OPEN' : 'COLLAPSED'}</span>
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-xl bg-[#02040A] border border-[#1E293B] overflow-hidden shadow-inner h-130 lg:h-145 flex items-center justify-center">
              {renderEngine === '3d' ? (
                <div ref={mount3DRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              ) : (
                <canvas ref={canvas2DRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              )}

              {/* Floating Re-Open Inspector Button when Collapsed */}
              {!isInfoPanelOpen && (
                <button
                  onClick={() => setIsInfoPanelOpen(true)}
                  className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#050B1A]/90 hover:bg-[#0E1B38] backdrop-blur-md border border-[#38BDF8]/40 hover:border-[#38BDF8] text-xs font-mono font-semibold text-[#38BDF8] shadow-lg transition-all cursor-pointer z-10"
                  title="Expand object telemetry inspector"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Inspect Object ({selectedObject?.name.split(' ')[0] || 'Selected'})</span>
                </button>
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

              {/* Non-Blocking Subtle Loading Pill (Does not obstruct scene or controls) */}
              {isLoading && (
                <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#050B1A]/85 backdrop-blur-md border border-[#1E293B] text-[11px] font-mono text-[#38BDF8] shadow-lg animate-pulse pointer-events-none">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#38BDF8]" />
                  <span>Syncing ephemeris...</span>
                </div>
              )}

              {/* Non-Intrusive Error Notice with Retry */}
              {dataError && (
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#050B1A]/90 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{dataError}</span>
                  </div>
                  <button
                    onClick={() => loadObservatoryData(simulatedDate)}
                    className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold cursor-pointer transition-all"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {/* 3. INTERACTIVE PLAYBACK TIMELINE CONTROLS */}
            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Play, Pause, Step Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                      isPlaying
                        ? 'bg-amber-500 text-[#050B1A] hover:bg-amber-400'
                        : 'bg-[#38BDF8] text-[#050B1A] hover:bg-[#0284C7]'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause Motion' : 'Play Motion'}</span>
                  </button>

                  <button
                    onClick={() => handleStepDays(-30)}
                    className="px-2 py-2 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] text-[11px] font-mono text-[#94A3B8] hover:text-[#F8FAFC] transition-all cursor-pointer"
                    title="Step backward 30 days (1 month)"
                  >
                    -30d
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
                    onClick={() => handleStepDays(30)}
                    className="px-2 py-2 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] text-[11px] font-mono text-[#94A3B8] hover:text-[#F8FAFC] transition-all cursor-pointer"
                    title="Step forward 30 days (1 month)"
                  >
                    +30d
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
                    { label: '0.1x', val: 0.1 },
                    { label: '1d/s', val: 1 },
                    { label: '7d/s', val: 7 },
                    { label: '30d/s', val: 30 },
                    { label: '1yr/s', val: 365.25 }
                  ].map(s => (
                    <button
                      key={s.label}
                      onClick={() => setPlaybackSpeed(s.val)}
                      className={`px-2 py-1 rounded-md text-xs font-mono transition-all cursor-pointer tabular-nums ${
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

              {/* Continuous Timeline Scrubber (2000 - 2065) */}
              <div className="space-y-1 pt-1 border-t border-[#1E293B]/60">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                  <span>Timeline Scrubbing</span>
                  <span className="text-[#38BDF8] font-bold">{simulatedDate.getUTCFullYear()} ({simulatedDate.toISOString().slice(0, 10)})</span>
                  <span>2000 – 2065</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#64748B]">2000</span>
                  <input
                    type="range"
                    min={new Date('2000-01-01').getTime()}
                    max={new Date('2065-01-01').getTime()}
                    value={simulatedDate.getTime()}
                    onChange={(e) => {
                      const time = Number(e.target.value);
                      const newDate = new Date(time);
                      setSimulatedDate(newDate);
                      simulatedTimeRef.current = time;
                      setDateInputVal(newDate.toISOString().slice(0, 16));
                      setIsPlaying(false);
                    }}
                    className="w-full h-1.5 bg-[#030712] rounded-lg appearance-none cursor-pointer accent-[#38BDF8] border border-[#1E293B]"
                    aria-label="Simulation timeline scrubber"
                  />
                  <span className="text-[10px] font-mono text-[#64748B]">2065</span>
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
          {/* Quick Search Input with Autocomplete Suggestions */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search 63 supported astronomical objects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1630] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
            />

            {/* Autocomplete Dropdown List */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-xl bg-[#050B1A]/95 backdrop-blur-md border border-[#38BDF8]/40 shadow-2xl z-30 max-h-64 overflow-y-auto space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-mono text-[#64748B] uppercase tracking-wider flex justify-between">
                  <span>Suggested Matches</span>
                  <span>{searchSuggestions.length} Found</span>
                </div>
                {searchSuggestions.map(s => (
                  <button
                    key={s.id}
                    onMouseDown={() => handleSelectSuggestion(s.id)}
                    className="w-full px-2.5 py-2 rounded-lg text-left text-xs font-mono hover:bg-[#0E1B38] transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color || '#38BDF8' }} />
                      <span className="font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] truncate">{s.name}</span>
                      <span className="text-[10px] text-[#64748B] truncate">({s.designation})</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] shrink-0 uppercase">
                      {s.category.replace('-', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            )}
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

              {/* Real-Time / Calculated Telemetry Grid (Continuously updated as time advances) */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {selectedObject.distSunAU !== undefined && (
                  <div className="p-2.5 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[10px] text-[#64748B]">Dist. to Sun:</span>
                    <div className="font-bold text-[#F8FAFC] mt-0.5 tabular-nums">
                      {realtimeSelectedState ? realtimeSelectedState.distSunAU.toFixed(3) : selectedObject.distSunAU} AU
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      {realtimeSelectedState ? (realtimeSelectedState.distSunAU * 149.598).toFixed(1) : selectedObject.distSunMillionKm}M km
                    </div>
                  </div>
                )}

                {selectedObject.distEarthAU !== undefined && (
                  <div className="p-2.5 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[10px] text-[#64748B]">Dist. to Earth:</span>
                    <div className="font-bold text-[#38BDF8] mt-0.5 tabular-nums">
                      {realtimeSelectedState ? realtimeSelectedState.distEarthAU.toFixed(3) : selectedObject.distEarthAU} AU
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      {realtimeSelectedState ? realtimeSelectedState.distEarthLunar.toFixed(1) : selectedObject.distEarthLunar} LD
                    </div>
                  </div>
                )}

                {selectedObject.orbitalSpeedKmS !== undefined && (
                  <div className="p-2.5 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[10px] text-[#64748B]">Orbital Speed:</span>
                    <div className="font-bold text-[#F5C451] mt-0.5 tabular-nums">
                      {realtimeSelectedState ? realtimeSelectedState.orbitalSpeedKmS : selectedObject.orbitalSpeedKmS} km/s
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">
                      ~{Math.round((realtimeSelectedState ? realtimeSelectedState.orbitalSpeedKmS : selectedObject.orbitalSpeedKmS) * 3600).toLocaleString()} km/h
                    </div>
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

                {realtimeSelectedState && (
                  <div className="col-span-2 p-2.5 rounded-lg bg-[#050B1A] border border-[#1E293B]">
                    <span className="text-[10px] text-[#64748B]">Heliocentric Position Vector (J2000):</span>
                    <div className="font-bold text-[#F8FAFC] mt-0.5 tabular-nums text-[11px] flex items-center justify-between">
                      <span>X: {realtimeSelectedState.heliocentricAU.x >= 0 ? '+' : ''}{realtimeSelectedState.heliocentricAU.x.toFixed(4)} AU</span>
                      <span>Y: {realtimeSelectedState.heliocentricAU.y >= 0 ? '+' : ''}{realtimeSelectedState.heliocentricAU.y.toFixed(4)} AU</span>
                      <span>Z: {realtimeSelectedState.heliocentricAU.z >= 0 ? '+' : ''}{realtimeSelectedState.heliocentricAU.z.toFixed(4)} AU</span>
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

              {/* Physical Dimensions & Morphology */}
              <div className="p-3.5 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between text-[#38BDF8] font-bold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Orbit className="w-3.5 h-3.5" />
                    <span>Physical Dimensions & Morphology</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1E293B] text-[#94A3B8]">
                    {selectedObject.classification}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-[#030712] border border-[#1E293B]/70">
                    <span className="text-[10px] text-[#64748B]">Diameter:</span>
                    <div className="font-bold text-[#F8FAFC] truncate">
                      {selectedPhysicalInfo?.physicalDiameterText || (selectedObject.radiusKm ? `${typeof selectedObject.radiusKm === 'number' ? (selectedObject.radiusKm * 2).toLocaleString() : selectedObject.radiusKm} km` : 'Not available')}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#030712] border border-[#1E293B]/70">
                    <span className="text-[10px] text-[#64748B]">Rotation Period:</span>
                    <div className="font-bold text-[#F8FAFC] truncate">
                      {selectedPhysicalInfo?.rotationPeriodText || 'Not available'}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#030712] border border-[#1E293B]/70">
                    <span className="text-[10px] text-[#64748B]">Spectral Class / Type:</span>
                    <div className="font-bold text-[#38BDF8] truncate">
                      {selectedPhysicalInfo?.spectralType || (selectedObject.category === 'solar-system' ? 'Major Planet' : 'Not available')}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#030712] border border-[#1E293B]/70">
                    <span className="text-[10px] text-[#64748B]">Geometric Albedo:</span>
                    <div className="font-bold text-[#F5C451] tabular-nums">
                      {selectedPhysicalInfo?.albedo !== undefined ? selectedPhysicalInfo.albedo.toFixed(3) : 'Not available'}
                    </div>
                  </div>
                </div>
                {selectedPhysicalInfo?.morphologyDescription && (
                  <p className="text-[10px] text-[#94A3B8] leading-relaxed italic border-t border-[#1E293B]/60 pt-1.5">
                    {selectedPhysicalInfo.morphologyDescription}
                  </p>
                )}
              </div>

              {/* Sourced Close-Approach Encounter & Planetary Defense */}
              {selectedCloseApproach && (
                <div className="p-4 rounded-xl bg-linear-to-b from-[#050B1A] to-[#0E1B38] border border-amber-500/40 space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>CNEOS Close-Approach Telemetry</span>
                    </div>
                    {selectedCloseApproach.isPotentiallyHazardous && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        PHA (Potentially Hazardous)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-[#030712] border border-[#1E293B]">
                      <span className="text-[10px] text-[#64748B]">Approach Date:</span>
                      <div className="font-bold text-[#F8FAFC]">
                        {selectedCloseApproach.closeApproachDate}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#030712] border border-[#1E293B]">
                      <span className="text-[10px] text-[#64748B]">Nominal Distance:</span>
                      <div className="font-bold text-amber-300">
                        {selectedCloseApproach.missDistanceKm.toLocaleString()} km
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        {selectedCloseApproach.missDistanceLunar.toFixed(2)} LD ({selectedCloseApproach.missDistanceAU.toFixed(6)} AU)
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#030712] border border-[#1E293B]">
                      <span className="text-[10px] text-[#64748B]">Relative Velocity (v_rel):</span>
                      <div className="font-bold text-[#F5C451]">
                        {selectedCloseApproach.relativeVelocityKmS} km/s
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        ~{Math.round(selectedCloseApproach.relativeVelocityKmS * 3600).toLocaleString()} km/h
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#030712] border border-[#1E293B]">
                      <span className="text-[10px] text-[#64748B]">Distance Uncertainty Range:</span>
                      <div className="font-bold text-[#F8FAFC]">
                        {selectedCloseApproach.distMinKm.toLocaleString()} - {selectedCloseApproach.distMaxKm.toLocaleString()} km
                      </div>
                    </div>
                  </div>

                  {selectedCloseApproach.impactRisk && (
                    <div className="p-2 rounded-lg bg-[#030712] border border-[#1E293B] space-y-1">
                      <div className="text-[10px] text-[#64748B] flex items-center justify-between">
                        <span>Sentry Risk Assessment:</span>
                        <a
                          href={selectedCloseApproach.impactRisk.sentryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#38BDF8] hover:underline flex items-center gap-1"
                        >
                          <span>Sentry Portal</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="text-[11px] text-[#F8FAFC] leading-relaxed">
                        {selectedCloseApproach.impactRisk.assessment}
                      </p>
                    </div>
                  )}

                  <div className="text-[10px] text-[#94A3B8] leading-relaxed bg-[#030712]/50 p-2 rounded-lg border border-[#1E293B]/40">
                    <span className="font-bold text-[#64748B]">PHA Criteria: </span>
                    Absolute magnitude H ≤ 22.0 (estimated diameter ≥ 140 m) and Earth MOID ≤ 0.05 AU (7.48M km / 19.5 LD).
                  </div>

                  <button
                    onClick={() => onNavigate('asteroid-motion')}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View in Asteroid Motion Viewer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Authentic NASA/JPL Surface Texture Map Provenance */}
              {NASA_JPL_TEXTURE_MAPS[selectedObject.id] && (
                <div className="p-3 rounded-lg bg-[#050B1A] border border-sky-500/30 text-[11px] text-[#94A3B8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono uppercase text-[10px] text-sky-400 font-bold">
                      Surface Map • NASA/JPL
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                      {NASA_JPL_TEXTURE_MAPS[selectedObject.id].mission}
                    </span>
                  </div>
                  <p className="text-white text-xs">{NASA_JPL_TEXTURE_MAPS[selectedObject.id].credit}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
                    <span>{NASA_JPL_TEXTURE_MAPS[selectedObject.id].projection}</span>
                    <a
                      href={NASA_JPL_TEXTURE_MAPS[selectedObject.id].sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline"
                    >
                      JPL Map Source
                    </a>
                  </div>
                </div>
              )}

              {/* Mandatory Scientific Transparency Disclaimer */}
              <div className="p-3 rounded-lg bg-linear-to-r from-[#050B1A] to-[#0E1B38] border border-[#38BDF8]/30 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#38BDF8]">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Scientific Modeling & Provenance</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[10px] font-mono text-[#A7B4CC]">
                  <div className="flex justify-between border-b border-[#1E293B]/60 pb-0.5">
                    <span className="text-[#64748B]">Coordinate Frame:</span>
                    <span>{selectedObject.coordinateFrame || 'ICRF / J2000 Heliocentric Ecliptic'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1E293B]/60 pb-0.5">
                    <span className="text-[#64748B]">Reference Epoch:</span>
                    <span>{selectedObject.calculationEpoch || 'J2000.0 (JD 2451545.0)'}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1E293B]/60 pb-0.5">
                    <span className="text-[#64748B]">Computation Method:</span>
                    <span>
                      {selectedObject.motionType === 'analytical-ephemeris'
                        ? 'NASA/JPL Standish (1992) analytical perturbation elements'
                        : selectedObject.motionType === 'keplerian-orbit'
                        ? 'Two-body osculating Keplerian propagation'
                        : 'Direct catalog reference coordinates'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Measurement Uncertainty:</span>
                    <span className="italic text-[#94A3B8]">Not available</span>
                  </div>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed italic pt-1 border-t border-[#1E293B]/60">
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

                {selectedObject.category === 'asteroids-comets' || selectedCloseApproach ? (
                  <button
                    onClick={() => onNavigate('asteroid-motion')}
                    className="py-2.5 px-3 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-amber-500/40 hover:border-amber-400 text-xs font-mono font-semibold text-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Orbit className="w-3.5 h-3.5" />
                    <span>Motion Viewer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('ai-guide')}
                    className="py-2.5 px-3 rounded-lg bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] hover:border-amber-400 text-xs font-mono font-semibold text-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI Guide</span>
                  </button>
                )}
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

export default LiveCosmicObservatory;
