import { useState, useEffect, useRef, useMemo, type FC } from 'react';
import * as THREE from 'three';
import type { AppPage, LiveEphemerisObject, LiveEphemerisResponse, LiveDataBadgeStatus } from '../types';
import { fetchLiveEphemeris } from '../services/liveSpaceService';
import { 
  Orbit, 
  Globe, 
  RotateCcw, 
  Play, 
  Pause, 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  ChevronRight, 
  Info, 
  Calendar,
  Radio,
  Sliders,
  Maximize2
} from 'lucide-react';

interface LiveSpaceObservatoryProps {
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

export const LiveSpaceObservatory: FC<LiveSpaceObservatoryProps> = ({ onNavigate }) => {
  // Live Ephemeris Data State
  const [ephemData, setEphemData] = useState<LiveEphemerisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string>('earth');

  // Time & Clock State
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timeZoneMode, setTimeZoneMode] = useState<'UTC' | 'LOCAL'>('UTC');
  const [selectedEpochDate, setSelectedEpochDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isLiveEpoch, setIsLiveEpoch] = useState<boolean>(true);

  // Visualization Controls
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [webGlSupported] = useState<boolean>(isWebGLAvailable());
  const [scaleMode, setScaleMode] = useState<'inner' | 'outer'>('inner');
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'planets' | 'small-bodies'>('all');
  const [detailMode, setDetailMode] = useState<'beginner' | 'advanced'>('beginner');

  // Canvas Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);
  const objects3DMap = useRef<Map<string, THREE.Object3D>>(new Map());

  // Camera Interaction State for 3D
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraSphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 75,
    theta: Math.PI / 4,
    phi: Math.PI / 3
  });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // 2D Pan & Zoom State
  const [pan2D, setPan2D] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom2D, setZoom2D] = useState<number>(1);
  const is2DPanningRef = useRef<boolean>(false);
  const dragStart2DRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch ephemeris data
  const loadEphemeris = async (dateStr?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchLiveEphemeris({ date: dateStr });
      setEphemData(data);
    } catch (err: any) {
      console.error('Failed to load ephemeris:', err);
      setError('Unable to load live ephemeris from NASA/JPL. Please verify connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEphemeris(isLiveEpoch ? undefined : selectedEpochDate);
  }, [isLiveEpoch, selectedEpochDate]);

  // Handle Epoch Presets
  const handleEpochPreset = (preset: 'live' | 'solstice' | 'apophis2029' | 'halley2061') => {
    if (preset === 'live') {
      setIsLiveEpoch(true);
      setSelectedEpochDate(new Date().toISOString().slice(0, 10));
    } else if (preset === 'solstice') {
      setIsLiveEpoch(false);
      setSelectedEpochDate('2026-12-21');
    } else if (preset === 'apophis2029') {
      setIsLiveEpoch(false);
      setSelectedEpochDate('2029-04-13');
    } else if (preset === 'halley2061') {
      setIsLiveEpoch(false);
      setSelectedEpochDate('2061-07-28');
    }
  };

  // Filtered objects list
  const filteredObjects = useMemo(() => {
    if (!ephemData?.objects) return [];
    if (categoryFilter === 'planets') {
      return ephemData.objects.filter(o => o.classification.includes('Planet') || o.id === 'sun' || o.id === 'moon');
    }
    if (categoryFilter === 'small-bodies') {
      return ephemData.objects.filter(o => 
        o.classification.includes('Asteroid') || 
        o.classification.includes('Comet') || 
        o.classification.includes('Dwarf') || 
        o.classification.includes('TNO')
      );
    }
    return ephemData.objects;
  }, [ephemData, categoryFilter]);

  const selectedObject: LiveEphemerisObject | undefined = useMemo(() => {
    if (!ephemData?.objects) return undefined;
    return ephemData.objects.find(o => o.id === selectedObjectId) || ephemData.objects[0];
  }, [ephemData, selectedObjectId]);

  // Three.js Scene Setup
  useEffect(() => {
    if (viewMode !== '3d' || !webGlSupported || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b1a);
    sceneRef.current = scene;

    // Starfield Background
    const starsCount = 2000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 1200;
      starPos[i + 1] = (Math.random() - 0.5) * 1200;
      starPos[i + 2] = (Math.random() - 0.5) * 1200;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 1.2, transparent: true, opacity: 0.65 });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Ecliptic Reference Grid
    const gridHelper = new THREE.GridHelper(120, 24, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const sunLight = new THREE.PointLight(0xfffaed, 2.5, 500);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Slow illustrative rotation when simulating
      if (isSimulating) {
        cameraSphericalRef.current.theta += delta * 0.05;
        updateCameraPosition();
      }

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [viewMode, webGlSupported]);

  // Update Camera position from spherical coordinates
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta) + cameraTargetRef.current.x;
    const y = radius * Math.cos(phi) + cameraTargetRef.current.y;
    const z = radius * Math.sin(phi) * Math.cos(theta) + cameraTargetRef.current.z;
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(cameraTargetRef.current);
  };

  // Populate Objects & Orbit Paths in 3D Scene
  useEffect(() => {
    if (viewMode !== '3d' || !sceneRef.current || !ephemData?.objects) return;

    const scene = sceneRef.current;
    objects3DMap.current.forEach(obj => scene.remove(obj));
    objects3DMap.current.clear();

    const scaleFactor = scaleMode === 'inner' ? 18 : 2.5;

    ephemData.objects.forEach(obj => {
      const group = new THREE.Group();

      // Convert Helocentric (X, Y, Z in AU) to 3D Scene Units
      // Note: In Three.js, Y is typically up, so we map Ecliptic Z to Y, and Y to Z
      const posX = obj.heliocentricAU.x * scaleFactor;
      const posY = obj.heliocentricAU.z * scaleFactor;
      const posZ = obj.heliocentricAU.y * scaleFactor;

      // 1. Sphere Mesh
      let sphereSize = 1.0;
      if (obj.id === 'sun') sphereSize = 2.8;
      else if (obj.classification.includes('Gas Giant')) sphereSize = 1.8;
      else if (obj.classification.includes('Ice Giant')) sphereSize = 1.4;
      else if (obj.classification.includes('Terrestrial')) sphereSize = 0.9;
      else if (obj.id === 'moon') sphereSize = 0.45;
      else sphereSize = 0.55;

      const sphereGeo = new THREE.SphereGeometry(sphereSize, 24, 24);
      let sphereMat: THREE.Material;

      if (obj.id === 'sun') {
        sphereMat = new THREE.MeshBasicMaterial({ color: 0xf5c451 });
      } else {
        sphereMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(obj.color),
          roughness: 0.6,
          metalness: 0.1
        });
      }

      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(posX, posY, posZ);
      group.add(sphereMesh);

      // Selected Object Highlight Halo
      if (obj.id === selectedObjectId) {
        const haloGeo = new THREE.RingGeometry(sphereSize * 1.5, sphereSize * 1.8, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.set(posX, posY, posZ);
        halo.rotation.x = Math.PI / 2;
        group.add(halo);
      }

      // 2. Orbit Loop Geometry
      if (showOrbits && obj.orbitalElements && obj.orbitalElements.semiMajorAxisAU > 0) {
        const a = obj.orbitalElements.semiMajorAxisAU;
        const e = obj.orbitalElements.eccentricity;
        const iRad = (obj.orbitalElements.inclinationDeg || 0) * (Math.PI / 180);
        const nodeRad = (obj.orbitalElements.longitudeOfAscendingNodeDeg || 0) * (Math.PI / 180);
        const periRad = (obj.orbitalElements.argumentOfPerihelionDeg || 0) * (Math.PI / 180);

        const pointsCount = 120;
        const orbitPoints: THREE.Vector3[] = [];

        for (let step = 0; step <= pointsCount; step++) {
          const E = (step / pointsCount) * Math.PI * 2;
          const xOrb = a * (Math.cos(E) - e);
          const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

          const cosW = Math.cos(periRad), sinW = Math.sin(periRad);
          const cosN = Math.cos(nodeRad), sinN = Math.sin(nodeRad);
          const cosI = Math.cos(iRad), sinI = Math.sin(iRad);

          const xEcl = (cosW * cosN - sinW * sinN * cosI) * xOrb + (-sinW * cosN - cosW * sinN * cosI) * yOrb;
          const yEcl = (cosW * sinN + sinW * cosN * cosI) * xOrb + (-sinW * sinN + cosW * cosN * cosI) * yOrb;
          const zEcl = (sinW * sinI) * xOrb + (cosW * sinI) * yOrb;

          orbitPoints.push(new THREE.Vector3(xEcl * scaleFactor, zEcl * scaleFactor, yEcl * scaleFactor));
        }

        const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(obj.color),
          transparent: true,
          opacity: obj.id === selectedObjectId ? 0.75 : 0.25
        });
        const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
        group.add(orbitLine);
      }

      scene.add(group);
      objects3DMap.current.set(obj.id, group);
    });
  }, [viewMode, ephemData, scaleMode, showOrbits, selectedObjectId]);

  // Focus Camera on Selected Object
  const handleFocusSelected = () => {
    if (!selectedObject) return;
    const scaleFactor = scaleMode === 'inner' ? 18 : 2.5;
    const targetX = selectedObject.heliocentricAU.x * scaleFactor;
    const targetY = selectedObject.heliocentricAU.z * scaleFactor;
    const targetZ = selectedObject.heliocentricAU.y * scaleFactor;

    cameraTargetRef.current.set(targetX, targetY, targetZ);
    cameraSphericalRef.current.radius = Math.max(15, cameraSphericalRef.current.radius * 0.5);
    updateCameraPosition();
  };

  // Reset Camera
  const handleResetCamera = () => {
    cameraTargetRef.current.set(0, 0, 0);
    cameraSphericalRef.current = {
      radius: scaleMode === 'inner' ? 75 : 160,
      theta: Math.PI / 4,
      phi: Math.PI / 3
    };
    updateCameraPosition();
  };

  // 3D Mouse Event Handlers
  const handle3DMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handle3DMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    cameraSphericalRef.current.theta -= deltaX * 0.008;
    cameraSphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, cameraSphericalRef.current.phi - deltaY * 0.008));
    updateCameraPosition();
  };

  const handle3DMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handle3DWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    cameraSphericalRef.current.radius = Math.max(10, Math.min(450, cameraSphericalRef.current.radius * zoomFactor));
    updateCameraPosition();
  };

  // 2D Canvas Renderer
  useEffect(() => {
    if (viewMode !== '2d' || !canvas2DRef.current || !ephemData?.objects) return;

    const canvas = canvas2DRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 800;
    const height = 550;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#050B1A';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2 + pan2D.x;
    const centerY = height / 2 + pan2D.y;
    const pxPerAU = (scaleMode === 'inner' ? 110 : 12) * zoom2D;

    // Draw Distance AU Rings
    const ringDistances = scaleMode === 'inner' ? [0.39, 0.72, 1.0, 1.52, 2.77, 5.2] : [1, 5, 10, 20, 30, 40, 50];
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);

    ringDistances.forEach(distAU => {
      const rPx = distAU * pxPerAU;
      ctx.beginPath();
      ctx.arc(centerX, centerY, rPx, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '10px monospace';
      ctx.fillText(`${distAU} AU`, centerX + rPx + 4, centerY - 4);
    });

    ctx.setLineDash([]);

    // Draw Orbits
    if (showOrbits) {
      ephemData.objects.forEach(obj => {
        if (!obj.orbitalElements || obj.orbitalElements.semiMajorAxisAU <= 0) return;
        const a = obj.orbitalElements.semiMajorAxisAU;
        const e = obj.orbitalElements.eccentricity;
        const periRad = (obj.orbitalElements.argumentOfPerihelionDeg || 0) * (Math.PI / 180);
        const nodeRad = (obj.orbitalElements.longitudeOfAscendingNodeDeg || 0) * (Math.PI / 180);

        ctx.strokeStyle = obj.id === selectedObjectId ? obj.color : `${obj.color}33`;
        ctx.lineWidth = obj.id === selectedObjectId ? 1.5 : 1;
        ctx.beginPath();

        const steps = 100;
        for (let s = 0; s <= steps; s++) {
          const E = (s / steps) * Math.PI * 2;
          const xOrb = a * (Math.cos(E) - e);
          const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E);

          const cosW = Math.cos(periRad), sinW = Math.sin(periRad);
          const cosN = Math.cos(nodeRad), sinN = Math.sin(nodeRad);

          const xEcl = (cosW * cosN - sinW * sinN) * xOrb + (-sinW * cosN - cosW * sinN) * yOrb;
          const yEcl = (cosW * sinN + sinW * cosN) * xOrb + (-sinW * sinN + cosW * cosN) * yOrb;

          const screenX = centerX + xEcl * pxPerAU;
          const screenY = centerY - yEcl * pxPerAU;

          if (s === 0) ctx.moveTo(screenX, screenY);
          else ctx.lineTo(screenX, screenY);
        }
        ctx.stroke();
      });
    }

    // Draw Objects
    ephemData.objects.forEach(obj => {
      const screenX = centerX + obj.heliocentricAU.x * pxPerAU;
      const screenY = centerY - obj.heliocentricAU.y * pxPerAU;

      // Draw Marker
      const isSelected = obj.id === selectedObjectId;
      let radius = obj.id === 'sun' ? 6 : (obj.classification.includes('Gas') ? 5 : 3.5);

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fillStyle = obj.color;
      ctx.fill();

      // Label
      if (showLabels) {
        ctx.fillStyle = isSelected ? '#38BDF8' : '#F8FAFC';
        ctx.font = isSelected ? 'bold 11px monospace' : '10px monospace';
        ctx.fillText(obj.name.split(' ')[0], screenX + radius + 4, screenY + 3);
      }
    });
  }, [viewMode, ephemData, scaleMode, showOrbits, showLabels, selectedObjectId, pan2D, zoom2D]);

  // 2D Pan handlers
  const handle2DMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    is2DPanningRef.current = true;
    dragStart2DRef.current = { x: e.clientX - pan2D.x, y: e.clientY - pan2D.y };
  };

  const handle2DMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!is2DPanningRef.current) return;
    setPan2D({
      x: e.clientX - dragStart2DRef.current.x,
      y: e.clientY - dragStart2DRef.current.y
    });
  };

  const handle2DMouseUp = () => {
    is2DPanningRef.current = false;
  };

  const handle2DWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom2D(prev => Math.max(0.2, Math.min(6, prev * factor)));
  };

  // Status Badge Rendering Helper
  const renderBadge = (status: LiveDataBadgeStatus) => {
    switch (status) {
      case 'LIVE DATA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE DATA
          </span>
        );
      case 'RECENT DATA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
            RECENT DATA (CACHED)
          </span>
        );
      case 'PREDICTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#8B5CF6]/10 text-[#C084FC] border border-[#8B5CF6]/30">
            PREDICTED EPHEMERIS
          </span>
        );
      case 'SIMULATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30">
            SIMULATION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            UNAVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Live Telemetry Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-b from-[#0B1630] to-[#050B1A] border border-[#1E293B] shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                NASA JPL Horizons Astrometry
              </span>
              {ephemData && renderBadge(ephemData.statusLabel)}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC] font-mono">
              Live Space Observatory
            </h1>
            <p className="text-sm text-[#A7B4CC] max-w-2xl leading-relaxed">
              Real-time monitoring of celestial bodies and planetary state vectors in our Solar System. Powered by mathematical ephemeris propagation from NASA/JPL Solar System Dynamics.
            </p>
          </div>

          {/* Real-Time Clocks & Telemetry */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-1">
              <div className="flex items-center justify-between gap-3 text-xs text-[#A7B4CC] font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                  {timeZoneMode === 'UTC' ? 'Universal Coordinated Time (UTC)' : 'Local Display Time'}
                </span>
                <button
                  onClick={() => setTimeZoneMode(prev => prev === 'UTC' ? 'LOCAL' : 'UTC')}
                  className="text-[10px] text-[#38BDF8] hover:underline"
                >
                  Switch to {timeZoneMode === 'UTC' ? 'Local' : 'UTC'}
                </button>
              </div>
              <div className="text-lg font-mono font-bold text-[#F8FAFC]">
                {timeZoneMode === 'UTC' 
                  ? currentTime.toUTCString().slice(17, 25) + ' UTC'
                  : currentTime.toLocaleTimeString()}
              </div>
              <div className="text-[11px] font-mono text-[#A7B4CC]">
                {timeZoneMode === 'UTC' ? currentTime.toUTCString().slice(0, 16) : currentTime.toLocaleDateString()}
              </div>
            </div>

            <button
              onClick={() => loadEphemeris(isLiveEpoch ? undefined : selectedEpochDate)}
              disabled={isLoading}
              className="px-4 py-3 rounded-2xl bg-[#0E1B38] hover:bg-[#1E293B] border border-[#1E293B] hover:border-[#38BDF8]/50 text-xs font-mono font-bold text-[#F8FAFC] transition-all flex items-center justify-center gap-2 group"
              title="Refresh current planetary ephemeris"
            >
              <RefreshCw className={`w-4 h-4 text-[#38BDF8] ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metadata Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#1E293B] text-xs font-mono">
          <div>
            <span className="text-[#A7B4CC]">Coordinate Frame:</span>
            <div className="font-bold text-[#F8FAFC] truncate">ICRF / J2000 Ecliptic</div>
          </div>
          <div>
            <span className="text-[#A7B4CC]">Calculation Epoch:</span>
            <div className="font-bold text-[#38BDF8] truncate">
              {ephemData ? ephemData.epoch.slice(0, 16).replace('T', ' ') + ' UTC' : 'Syncing...'}
            </div>
          </div>
          <div>
            <span className="text-[#A7B4CC]">Julian Date:</span>
            <div className="font-bold text-[#F8FAFC] truncate">
              {ephemData ? `JD ${ephemData.julianDate}` : '...'}
            </div>
          </div>
          <div>
            <span className="text-[#A7B4CC]">Monitored Bodies:</span>
            <div className="font-bold text-[#F8FAFC]">
              {ephemData ? `${ephemData.totalObjects} tracked objects` : '18 tracked objects'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Earth Approach Cross-Promotion Callout Banner */}
      <div 
        onClick={() => onNavigate('asteroid-watch')}
        className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-[#0B1630] via-[#101F42] to-[#0B1630] border border-[#38BDF8]/30 hover:border-[#38BDF8] shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-wider">
                Live Asteroid Watch Feed
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                CNEOS Active
              </span>
            </div>
            <p className="text-xs text-[#F8FAFC] mt-0.5 font-medium">
              Upcoming Earth Close-Approaches: Track miss distances in Lunar Distances (LD) and inspection data for near-Earth asteroids.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#38BDF8] shrink-0">
          <span>Open Earth Approach Monitor</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* 3. Controls & Epoch Selection Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0B1630] border border-[#1E293B] flex flex-wrap items-center justify-between gap-4">
        {/* Epoch Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[#A7B4CC] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
            Epoch:
          </span>
          <button
            onClick={() => handleEpochPreset('live')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              isLiveEpoch
                ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow-sm'
                : 'bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC]'
            }`}
          >
            Live (Now)
          </button>
          <button
            onClick={() => handleEpochPreset('solstice')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              !isLiveEpoch && selectedEpochDate === '2026-12-21'
                ? 'bg-[#8B5CF6] text-white font-bold shadow-sm'
                : 'bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC]'
            }`}
          >
            Dec 2026 Solstice
          </button>
          <button
            onClick={() => handleEpochPreset('apophis2029')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              !isLiveEpoch && selectedEpochDate === '2029-04-13'
                ? 'bg-[#F5C451] text-[#050B1A] font-bold shadow-sm'
                : 'bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC]'
            }`}
          >
            Apophis 2029 Encounter
          </button>
          <button
            onClick={() => handleEpochPreset('halley2061')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              !isLiveEpoch && selectedEpochDate === '2061-07-28'
                ? 'bg-[#34D399] text-[#050B1A] font-bold shadow-sm'
                : 'bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC]'
            }`}
          >
            Halley 2061 Perihelion
          </button>
        </div>

        {/* View & Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* 3D vs 2D Switch */}
          <div className="flex rounded-lg bg-[#050B1A] p-0.5 border border-[#1E293B]">
            <button
              onClick={() => setViewMode('3d')}
              disabled={!webGlSupported}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                viewMode === '3d'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              } ${!webGlSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D Space</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                viewMode === '2d'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>2D Map</span>
            </button>
          </div>

          {/* Scale Mode Toggle */}
          <button
            onClick={() => setScaleMode(prev => prev === 'inner' ? 'outer' : 'inner')}
            className="px-3 py-1.5 rounded-lg bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] flex items-center gap-1.5"
            title="Switch between Inner Solar System (0-5 AU) and Outer Solar System (0-50 AU)"
          >
            <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{scaleMode === 'inner' ? 'Inner System (0–5 AU)' : 'Outer System (0–50 AU)'}</span>
          </button>

          {/* Orbit Toggles */}
          <button
            onClick={() => setShowOrbits(!showOrbits)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              showOrbits
                ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40'
                : 'bg-[#050B1A] text-[#A7B4CC] border-[#1E293B]'
            }`}
          >
            Orbits: {showOrbits ? 'ON' : 'OFF'}
          </button>

          {/* Label Toggle */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              showLabels
                ? 'bg-[#0E1B38] text-[#38BDF8] border-[#38BDF8]/40'
                : 'bg-[#050B1A] text-[#A7B4CC] border-[#1E293B]'
            }`}
          >
            Labels: {showLabels ? 'ON' : 'OFF'}
          </button>

          {/* Reset Camera */}
          <button
            onClick={viewMode === '3d' ? handleResetCamera : () => { setPan2D({ x: 0, y: 0 }); setZoom2D(1); }}
            className="p-1.5 rounded-lg bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Scientific Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-[#0B1630]/70 border border-[#1E293B] text-xs font-mono text-[#A7B4CC] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#F8FAFC]">Scientific Honesty Notice:</strong> The positions shown are computed from verified J2000 state vectors and orbital elements. Intermediate motion is smoothly interpolated for visualization. This interactive observatory is an astronomical computational model, not a live optical camera video stream. Celestial sizes are magnified for readability.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300">
          {error}
        </div>
      )}

      {/* 5. Main Visualizer and Details Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Visualizer Canvas Area (Col Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-3xl bg-[#050B1A] border border-[#1E293B] overflow-hidden shadow-2xl h-[550px] flex items-center justify-center">
            {viewMode === '3d' && webGlSupported ? (
              <div
                ref={mountRef}
                onMouseDown={handle3DMouseDown}
                onMouseMove={handle3DMouseMove}
                onMouseUp={handle3DMouseUp}
                onWheel={handle3DWheel}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />
            ) : (
              <canvas
                ref={canvas2DRef}
                onMouseDown={handle2DMouseDown}
                onMouseMove={handle2DMouseMove}
                onMouseUp={handle2DMouseUp}
                onWheel={handle2DWheel}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />
            )}

            {/* Floating Visualizer Overlay Controls */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <button
                onClick={handleFocusSelected}
                className="px-3 py-1.5 rounded-xl bg-[#050B1A]/80 backdrop-blur-md border border-[#38BDF8]/40 hover:border-[#38BDF8] text-xs font-mono text-[#38BDF8] flex items-center gap-1.5 shadow-md"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Focus: {selectedObject?.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-mono flex items-center gap-1.5 shadow-md ${
                  isSimulating
                    ? 'bg-[#F5C451]/20 text-[#F5C451] border-[#F5C451]/50'
                    : 'bg-[#050B1A]/80 text-[#A7B4CC] border-[#1E293B]'
                }`}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? 'Pause Motion' : 'Simulate Motion'}</span>
              </button>
            </div>

            {/* Bottom Scale Indicator */}
            <div className="absolute bottom-4 left-4 z-10 text-[11px] font-mono text-[#A7B4CC] bg-[#050B1A]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-[#1E293B]">
              <span>Viewing: {scaleMode === 'inner' ? 'Inner System (0–5.2 AU)' : 'Extended Solar System (0–50 AU)'}</span>
            </div>

            <div className="absolute bottom-4 right-4 z-10 text-[11px] font-mono text-[#A7B4CC] bg-[#050B1A]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-[#1E293B]">
              <span>Drag to Rotate | Wheel to Zoom</span>
            </div>
          </div>

          {/* Quick Object Selection Ribbon */}
          <div className="p-4 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A7B4CC] font-bold">
                Select Monitored Celestial Body
              </span>
              <div className="flex items-center gap-1 text-xs font-mono">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-md ${categoryFilter === 'all' ? 'bg-[#38BDF8] text-[#050B1A] font-bold' : 'text-[#A7B4CC]'}`}
                >
                  All ({ephemData?.objects.length || 18})
                </button>
                <button
                  onClick={() => setCategoryFilter('planets')}
                  className={`px-2.5 py-1 rounded-md ${categoryFilter === 'planets' ? 'bg-[#38BDF8] text-[#050B1A] font-bold' : 'text-[#A7B4CC]'}`}
                >
                  Planets & Moon
                </button>
                <button
                  onClick={() => setCategoryFilter('small-bodies')}
                  className={`px-2.5 py-1 rounded-md ${categoryFilter === 'small-bodies' ? 'bg-[#38BDF8] text-[#050B1A] font-bold' : 'text-[#A7B4CC]'}`}
                >
                  Small Bodies & TNOs
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {filteredObjects.map(obj => {
                const isSelected = obj.id === selectedObjectId;
                return (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjectId(obj.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono shrink-0 transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-[#0E1B38] text-[#F8FAFC] border-[#38BDF8] shadow-md'
                        : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border-[#1E293B]'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: obj.color }} 
                    />
                    <span className="font-bold">{obj.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Object Details Panel (Col Span 1) */}
        <div className="space-y-6">
          {selectedObject ? (
            <div className="p-6 rounded-3xl bg-[#0B1630] border border-[#1E293B] shadow-2xl space-y-6">
              {/* Header */}
              <div className="space-y-2 border-b border-[#1E293B] pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#38BDF8] font-bold uppercase tracking-wider">
                    {selectedObject.classification}
                  </span>
                  <div className="flex rounded-md bg-[#050B1A] p-0.5 border border-[#1E293B] text-[10px] font-mono">
                    <button
                      onClick={() => setDetailMode('beginner')}
                      className={`px-2 py-0.5 rounded ${detailMode === 'beginner' ? 'bg-[#38BDF8] text-[#050B1A] font-bold' : 'text-[#A7B4CC]'}`}
                    >
                      Beginner
                    </button>
                    <button
                      onClick={() => setDetailMode('advanced')}
                      className={`px-2 py-0.5 rounded ${detailMode === 'advanced' ? 'bg-[#38BDF8] text-[#050B1A] font-bold' : 'text-[#A7B4CC]'}`}
                    >
                      Advanced
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span 
                    className="w-4 h-4 rounded-full shrink-0" 
                    style={{ backgroundColor: selectedObject.color }} 
                  />
                  <h3 className="text-2xl font-bold font-mono text-[#F8FAFC]">
                    {selectedObject.name}
                  </h3>
                </div>
                <div className="text-xs font-mono text-[#A7B4CC]">
                  Designation: {selectedObject.designation}
                </div>
              </div>

              {/* Beginner Summary View */}
              {detailMode === 'beginner' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3">
                    <div className="text-xs font-mono text-[#A7B4CC] uppercase font-bold">
                      Current Orbital Metrics
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[#A7B4CC]">Dist. from Sun:</span>
                        <div className="text-base font-bold text-[#F8FAFC] mt-0.5">
                          {selectedObject.distSunAU} AU
                        </div>
                        <div className="text-[11px] text-[#A7B4CC]">
                          {selectedObject.distSunMillionKm}M km
                        </div>
                      </div>

                      <div>
                        <span className="text-[#A7B4CC]">Dist. from Earth:</span>
                        <div className="text-base font-bold text-[#38BDF8] mt-0.5">
                          {selectedObject.distEarthAU} AU
                        </div>
                        <div className="text-[11px] text-[#A7B4CC]">
                          {selectedObject.distEarthLunar} LD ({selectedObject.distEarthMillionKm}M km)
                        </div>
                      </div>

                      <div>
                        <span className="text-[#A7B4CC]">Orbital Speed:</span>
                        <div className="text-base font-bold text-[#F5C451] mt-0.5">
                          {selectedObject.orbitalSpeedKmS} km/s
                        </div>
                        <div className="text-[11px] text-[#A7B4CC]">
                          {Math.round(selectedObject.orbitalSpeedKmS * 3600).toLocaleString()} km/h
                        </div>
                      </div>

                      <div>
                        <span className="text-[#A7B4CC]">Orbital Period:</span>
                        <div className="text-base font-bold text-[#F8FAFC] mt-0.5">
                          {selectedObject.orbitalElements.orbitalPeriodYears} yrs
                        </div>
                        <div className="text-[11px] text-[#A7B4CC]">
                          ~{Math.round(selectedObject.orbitalElements.orbitalPeriodYears * 365.25)} days
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plain Language Summary */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono uppercase text-[#A7B4CC] font-bold">
                      What is this body?
                    </div>
                    <p className="text-xs text-[#F8FAFC] leading-relaxed bg-[#050B1A] p-4 rounded-2xl border border-[#1E293B]">
                      {selectedObject.educationalSummary}
                    </p>
                  </div>
                </div>
              ) : (
                /* Advanced Astrometry View */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-3 font-mono text-xs">
                    <div className="text-[#A7B4CC] uppercase font-bold text-[11px]">
                      J2000 Keplerian Elements
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#A7B4CC]">Semi-Major Axis (a):</span>
                        <div className="text-[#F8FAFC] font-bold">{selectedObject.orbitalElements.semiMajorAxisAU} AU</div>
                      </div>
                      <div>
                        <span className="text-[#A7B4CC]">Eccentricity (e):</span>
                        <div className="text-[#F8FAFC] font-bold">{selectedObject.orbitalElements.eccentricity}</div>
                      </div>
                      <div>
                        <span className="text-[#A7B4CC]">Inclination (i):</span>
                        <div className="text-[#F8FAFC] font-bold">{selectedObject.orbitalElements.inclinationDeg}°</div>
                      </div>
                      <div>
                        <span className="text-[#A7B4CC]">Asc. Node (Ω):</span>
                        <div className="text-[#F8FAFC] font-bold">{selectedObject.orbitalElements.longitudeOfAscendingNodeDeg}°</div>
                      </div>
                      <div>
                        <span className="text-[#A7B4CC]">Arg. of Perihelion (ω):</span>
                        <div className="text-[#F8FAFC] font-bold">{selectedObject.orbitalElements.argumentOfPerihelionDeg}°</div>
                      </div>
                      <div>
                        <span className="text-[#A7B4CC]">Mean Anomaly (M):</span>
                        <div className="text-[#F8FAFC] font-bold">{selectedObject.orbitalElements.meanAnomalyDeg}°</div>
                      </div>
                    </div>
                  </div>

                  {/* Celestial Coordinates */}
                  <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-2 font-mono text-xs">
                    <div className="text-[#A7B4CC] uppercase font-bold text-[11px]">
                      Equatorial Astrometry (from Earth)
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A7B4CC]">Right Ascension (α):</span>
                      <span className="font-bold text-[#38BDF8]">{selectedObject.rightAscension}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A7B4CC]">Declination (δ):</span>
                      <span className="font-bold text-[#38BDF8]">{selectedObject.declination}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#A7B4CC]">Heliocentric (X, Y, Z):</span>
                      <span className="font-bold text-[#F8FAFC]">
                        ({selectedObject.heliocentricAU.x}, {selectedObject.heliocentricAU.y}, {selectedObject.heliocentricAU.z}) AU
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Source Verification Link */}
              <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono">
                <span className="text-[11px] text-[#A7B4CC]">Source: {selectedObject.source}</span>
                <a
                  href={selectedObject.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#38BDF8] hover:underline flex items-center gap-1"
                >
                  <span>Horizons Record</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#0B1630] border border-[#1E293B] text-center text-xs text-[#A7B4CC] font-mono">
              Select an object to inspect orbital ephemeris.
            </div>
          )}
        </div>
      </div>

      {/* 6. Educational Section: Celestial Motion & Orbits Explained (Section 10) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1630] border border-[#1E293B] space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-[#38BDF8] font-bold">
            Beginner's Astronomy Guide
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#F8FAFC]">
            Understanding Celestial Motion & Ephemerides
          </h2>
          <p className="text-xs text-[#A7B4CC] leading-relaxed">
            Every planetary position in this observatory is governed by the universal laws of gravitation. Here is how it works:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
          <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-2">
            <h4 className="font-mono font-bold text-[#38BDF8] text-sm">
              1. What is an Orbit?
            </h4>
            <p className="text-[#A7B4CC]">
              An orbit is the curved path of a celestial object around a star or planet under the influence of gravity. According to Kepler's First Law, all planets travel in <strong>ellipses</strong> with the Sun at one focus, meaning their distance from the Sun changes continuously.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-2">
            <h4 className="font-mono font-bold text-[#F5C451] text-sm">
              2. Why Speeds Differ
            </h4>
            <p className="text-[#A7B4CC]">
              Objects closer to the Sun experience far stronger gravitational pull and must travel much faster to stay in orbit. Mercury races around at <strong>~47.4 km/s</strong>, Earth moves at <strong>~29.8 km/s</strong>, while distant Neptune glides at only <strong>~5.4 km/s</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-2">
            <h4 className="font-mono font-bold text-[#8B5CF6] text-sm">
              3. Calculated vs Observed
            </h4>
            <p className="text-[#A7B4CC]">
              An <strong>ephemeris</strong> is a table of calculated positions. Because planetary motions follow known gravitational formulas with extreme precision, astronomers can accurately predict where planets were thousands of years ago and where they will be centuries into the future.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
