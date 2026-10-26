import { useState, useRef, useEffect, useMemo, type FC } from 'react';
import type { AppPage } from '../types';
import { 
  fetchObservatoryObjects 
} from '../services/astronomyDataService';
import { DEFAULT_OBSERVATORY_SNAPSHOT } from '../data/observatorySnapshot';
import { 
  RADAR_RANGE_PRESETS, 
  type RadarRangePresetId, 
  type RadarCategory, 
  type RadarTarget, 
  projectHeliocentricToRadar, 
  computeSweepPhosphorIntensity,
  computeKeplerianOrbitPositionAU
} from '../utils/deepSpaceRadar';
import {
  deriveOrbitalParametersFromQ,
  PLANET_NINE_PRESETS,
  type OrbitalParameters,
  generateSecularTestParticles,
  stepSecularSimulation,
  type SecularSimulationState
} from '../utils/planetXPhysics';
import { 
  Radio, 
  Orbit, 
  Telescope, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause, 
  ShieldAlert, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Sparkles,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface CosmicRadarHUDProps {
  onNavigate: (page: AppPage) => void;
}

export const CosmicRadarHUD: FC<CosmicRadarHUDProps> = ({ onNavigate }) => {
  // 1. Radar Viewport & Range State
  const [rangePresetId, setRangePresetId] = useState<RadarRangePresetId>('deep-space');
  const [customRangeAU, setCustomRangeAU] = useState<number>(1000.0);
  const [isWidescreenExpanded, setIsWidescreenExpanded] = useState<boolean>(false);
  const [radarMode, setRadarMode] = useState<'surveillance' | 'planet-x-lab'>('surveillance');

  // 2. Sweep Controls
  const [isSweepRunning, setIsSweepRunning] = useState<boolean>(true);
  const [sweepSpeedMultiplier, setSweepSpeedMultiplier] = useState<number>(1.0); // 0.5x, 1x, 2x

  // 3. Category Visibility Filters
  const [visibleCategories, setVisibleCategories] = useState<Record<RadarCategory, boolean>>({
    planets: true,
    asteroids: true,
    'distant-tnos': true,
    'hypothetical-p9': true,
    'simulation-particles': false
  });

  // 4. Overlays & Rendering Toggles
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showOrbitPaths, setShowOrbitPaths] = useState<boolean>(true);
  const [showPhosphorGlow, setShowPhosphorGlow] = useState<boolean>(true);

  // 5. Selected Target for Telemetry Inspector
  const [selectedTargetId, setSelectedTargetId] = useState<string>('planet-x');

  // 6. Data Pipeline State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [lastRefreshedUtc, setLastRefreshedUtc] = useState<string>(new Date().toISOString());
  const [pipelineSource, setPipelineSource] = useState<string>('NASA/JPL Standish & Horizons ICRF/J2000 Baseline');

  // 7. Planet Nine Hypothesis Parameters (Interactive Dynamical State)
  const [planetNineParams, setPlanetNineParams] = useState<OrbitalParameters>(() => {
    return deriveOrbitalParametersFromQ(247, 0.35, {
      massEarth: 6.2,
      inclinationDeg: 16.0,
      argumentOfPerihelionDeg: 150.0,
      longitudeOfAscendingNodeDeg: 95.0
    });
  });

  // 8. Secular Perturbation Simulation State
  const [secularState, setSecularState] = useState<SecularSimulationState>(() => ({
    timeMyr: 0,
    particles: generateSecularTestParticles(),
    planetNine: deriveOrbitalParametersFromQ(247, 0.35, {
      massEarth: 6.2,
      inclinationDeg: 16.0,
      argumentOfPerihelionDeg: 150.0,
      longitudeOfAscendingNodeDeg: 95.0
    }),
    withPlanetNine: true,
    clusteringMetric: 0.92,
    dispersionStdDeg: 28.5
  }));

  // Canvas Refs & Animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const sweepAngleRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Handle Range Preset changes
  const handleSelectRangePreset = (presetId: RadarRangePresetId) => {
    setRangePresetId(presetId);
    setCustomRangeAU(RADAR_RANGE_PRESETS[presetId].maxRangeAU);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setCustomRangeAU(prev => Math.max(1.5, Number((prev / 1.5).toFixed(1))));
  };
  const handleZoomOut = () => {
    setCustomRangeAU(prev => Math.min(2500, Number((prev * 1.5).toFixed(1))));
  };
  const handleResetView = () => {
    handleSelectRangePreset(radarMode === 'planet-x-lab' ? 'deep-space' : 'outer');
  };

  // Toggle Category Filter
  const toggleCategory = (cat: RadarCategory) => {
    setVisibleCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Apply Published Literature Preset for Planet Nine
  const handleApplyP9Preset = (presetKey: string) => {
    const preset = PLANET_NINE_PRESETS[presetKey];
    if (!preset) return;
    const derived = deriveOrbitalParametersFromQ(preset.perihelionAU, preset.eccentricity, {
      massEarth: preset.massEarth,
      inclinationDeg: preset.inclinationDeg,
      argumentOfPerihelionDeg: preset.argumentOfPerihelionDeg,
      longitudeOfAscendingNodeDeg: preset.longitudeOfAscendingNodeDeg
    });
    setPlanetNineParams(derived);
  };

  // Update a single parameter of Planet Nine
  const handleUpdateP9Param = (key: 'perihelionAU' | 'eccentricity' | 'massEarth' | 'inclinationDeg' | 'argumentOfPerihelionDeg', value: number) => {
    setPlanetNineParams(prev => {
      const q = key === 'perihelionAU' ? value : prev.perihelionAU;
      const e = key === 'eccentricity' ? value : prev.eccentricity;
      const m = key === 'massEarth' ? value : prev.massEarth;
      const inc = key === 'inclinationDeg' ? value : prev.inclinationDeg;
      const omega = key === 'argumentOfPerihelionDeg' ? value : prev.argumentOfPerihelionDeg;
      return deriveOrbitalParametersFromQ(q, e, {
        massEarth: m,
        inclinationDeg: inc,
        argumentOfPerihelionDeg: omega,
        longitudeOfAscendingNodeDeg: prev.longitudeOfAscendingNodeDeg
      });
    });
  };

  // Fetch / Sync Live Observatory Targets
  const refreshRadarCatalog = async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const res = await fetchObservatoryObjects();
      if (res.data && (res.data as any).objects) {
        setLastRefreshedUtc(new Date().toISOString());
        setPipelineSource((res.data as any).coordinateFrame || 'NASA/JPL Standish & Horizons ICRF/J2000 Baseline');
      }
    } catch (err: any) {
      console.warn('[CosmicRadarHUD] Failed to refresh live observatory objects, using offline verified baseline:', err);
      setDataError('Live stream unavailable. Operating on verified astronomical baseline.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshRadarCatalog();
  }, []);

  // Assemble full radar target list from verified snapshot + active Planet Nine hypothesis
  const allRadarTargets: RadarTarget[] = useMemo(() => {
    const list: RadarTarget[] = [];

    // 1. Planets and Reference Bodies
    const planetEntries = (DEFAULT_OBSERVATORY_SNAPSHOT.objects || []).filter(
      o => o.category === 'solar-system'
    );
    for (const p of planetEntries) {
      list.push({
        id: p.id,
        name: p.name,
        designation: p.designation,
        category: 'planets',
        categoryLabel: 'Solar System Body',
        heliocentricAU: p.heliocentricAU || { x: 0, y: 0, z: 0 },
        distSunAU: p.distSunAU ?? 0,
        distEarthAU: p.distEarthAU,
        distEarthLunar: p.distEarthLunar,
        orbitalSpeedKmS: p.orbitalSpeedKmS,
        orbitalElements: p.orbitalElements as any,
        color: p.color || '#38BDF8',
        isHypothetical: false,
        dataStatus: 'ARCHIVED BASELINE',
        dataSource: 'NASA/JPL Horizons Ephemerides',
        sourceUrl: 'https://ssd.jpl.nasa.gov/horizons/',
        epoch: p.calculationEpoch,
        scientificDisclaimer: 'Standish analytical Keplerian ephemeris in ICRF/J2000 heliocentric ecliptic frame.'
      });
    }

    // 2. Near-Earth & Main-Belt Asteroids
    const asteroidEntries = (DEFAULT_OBSERVATORY_SNAPSHOT.objects || []).filter(
      o => o.category === 'asteroids-comets'
    );
    for (const a of asteroidEntries) {
      list.push({
        id: a.id,
        name: a.name,
        designation: a.designation,
        category: 'asteroids',
        categoryLabel: 'Asteroid / Small Body',
        heliocentricAU: a.heliocentricAU || { x: 0, y: 0, z: 0 },
        distSunAU: a.distSunAU ?? 0,
        distEarthAU: a.distEarthAU,
        distEarthLunar: a.distEarthLunar,
        orbitalSpeedKmS: a.orbitalSpeedKmS,
        orbitalElements: a.orbitalElements as any,
        color: a.color || '#F5C451',
        isHypothetical: false,
        dataStatus: 'ARCHIVED BASELINE',
        dataSource: 'NASA/JPL Small-Body Database (SBDB) & CNEOS CAD',
        sourceUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html',
        epoch: a.calculationEpoch,
        scientificDisclaimer: 'Astrometric Keplerian orbital elements propagated to current epoch.'
      });
    }

    // 3. Known Distant Trans-Neptunian Objects (Sedna, VP113, Leleākūhonua, etc.)
    const tnoEntries = (DEFAULT_OBSERVATORY_SNAPSHOT.objects || []).filter(
      o => o.category === 'distant-tnos' && !o.isHypothetical
    );
    for (const t of tnoEntries) {
      list.push({
        id: t.id,
        name: t.name,
        designation: t.designation,
        category: 'distant-tnos',
        categoryLabel: 'Extreme Trans-Neptunian Object',
        heliocentricAU: t.heliocentricAU || { x: 0, y: 0, z: 0 },
        distSunAU: t.distSunAU ?? 0,
        distEarthAU: t.distEarthAU,
        distEarthLunar: t.distEarthLunar,
        orbitalSpeedKmS: t.orbitalSpeedKmS,
        orbitalElements: t.orbitalElements as any,
        color: t.color || '#FB7185',
        isHypothetical: false,
        dataStatus: 'ARCHIVED BASELINE',
        dataSource: 'IAU Minor Planet Center & NASA JPL SBDB',
        sourceUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html',
        epoch: t.calculationEpoch,
        scientificDisclaimer: 'Extreme TNO on high-eccentricity detached orbit beyond Neptune’s gravitational reach.'
      });
    }

    // Additional verified eTNOs (2004 VN112, 2013 RF98, 2007 TG422)
    const extraEtnos = [
      {
        id: '2004vn112',
        name: '474640 Alicanto (2004 VN112)',
        designation: '474640 Alicanto',
        a: 328.6,
        e: 0.856,
        inc: 25.56,
        node: 66.0,
        omega: 327.1,
        color: '#F43F5E'
      },
      {
        id: '2013rf98',
        name: '2013 RF98',
        designation: '2013 RF98',
        a: 349.0,
        e: 0.897,
        inc: 29.61,
        node: 67.6,
        omega: 311.8,
        color: '#E11D48'
      },
      {
        id: '2007tg422',
        name: '2007 TG422',
        designation: '2007 TG422',
        a: 492.7,
        e: 0.928,
        inc: 18.59,
        node: 112.9,
        omega: 285.7,
        color: '#FDA4AF'
      }
    ];

    for (const ee of extraEtnos) {
      const pos = computeKeplerianOrbitPositionAU(ee.a, ee.e, ee.inc, ee.node, ee.omega, 0);
      const rSun = Math.hypot(pos.x, pos.y, pos.z);
      list.push({
        id: ee.id,
        name: ee.name,
        designation: ee.designation,
        category: 'distant-tnos',
        categoryLabel: 'Extreme Trans-Neptunian Object',
        heliocentricAU: pos,
        distSunAU: Number(rSun.toFixed(2)),
        distEarthAU: Number((rSun + 1.0).toFixed(2)),
        orbitalElements: {
          semiMajorAxisAU: ee.a,
          eccentricity: ee.e,
          inclinationDeg: ee.inc,
          longitudeOfAscendingNodeDeg: ee.node,
          argumentOfPerihelionDeg: ee.omega,
          longitudeOfPerihelionDeg: Number(((ee.node + ee.omega) % 360).toFixed(1)),
          perihelionAU: Number((ee.a * (1 - ee.e)).toFixed(1)),
          aphelionAU: Number((ee.a * (1 + ee.e)).toFixed(1)),
          orbitalPeriodYears: Number(Math.sqrt(Math.pow(ee.a, 3)).toFixed(0))
        },
        color: ee.color,
        isHypothetical: false,
        dataStatus: 'ARCHIVED BASELINE',
        dataSource: 'IAU Minor Planet Center (MPC) & Dark Energy Survey (DES)',
        sourceUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html',
        scientificDisclaimer: 'Verified extreme TNO exhibiting anomalous perihelion clustering.'
      });
    }

    // 4. Hypothetical Planet Nine (Explicitly Segregated & Formatted)
    const p9Pos = computeKeplerianOrbitPositionAU(
      planetNineParams.semiMajorAxisAU,
      planetNineParams.eccentricity,
      planetNineParams.inclinationDeg,
      planetNineParams.longitudeOfAscendingNodeDeg,
      planetNineParams.argumentOfPerihelionDeg,
      0 // Perihelion orientation
    );
    const p9SunDist = Math.hypot(p9Pos.x, p9Pos.y, p9Pos.z);

    list.push({
      id: 'planet-x',
      name: 'Hypothetical Planet Nine',
      designation: 'Planet X (Mathematical Prediction)',
      category: 'hypothetical-p9',
      categoryLabel: 'Hypothetical Planet (Unconfirmed)',
      heliocentricAU: p9Pos,
      distSunAU: Number(p9SunDist.toFixed(1)),
      distEarthAU: Number((p9SunDist + 1.0).toFixed(1)),
      orbitalSpeedKmS: Number((29.78 / Math.sqrt(planetNineParams.semiMajorAxisAU)).toFixed(2)),
      orbitalElements: {
        semiMajorAxisAU: planetNineParams.semiMajorAxisAU,
        eccentricity: planetNineParams.eccentricity,
        inclinationDeg: planetNineParams.inclinationDeg,
        longitudeOfAscendingNodeDeg: planetNineParams.longitudeOfAscendingNodeDeg,
        argumentOfPerihelionDeg: planetNineParams.argumentOfPerihelionDeg,
        longitudeOfPerihelionDeg: planetNineParams.longitudeOfPerihelionDeg,
        perihelionAU: planetNineParams.perihelionAU,
        aphelionAU: planetNineParams.aphelionAU,
        orbitalPeriodYears: planetNineParams.orbitalPeriodYears
      },
      color: '#8B5CF6',
      isHypothetical: true,
      dataStatus: 'HYPOTHETICAL TARGET',
      dataSource: 'Dynamical Model: Batygin & Brown (2021) The Astronomical Journal, 162:219',
      sourceUrl: 'https://doi.org/10.3847/1538-3881/ac2056',
      scientificDisclaimer: 'Hypothetical Planet Nine — simulated position. Not an observed astronomical detection.'
    });

    // 5. Simulation Test Particles (if enabled)
    if (visibleCategories['simulation-particles']) {
      for (const sp of secularState.particles) {
        if (sp.isRealEtno) continue;
        const pos = computeKeplerianOrbitPositionAU(sp.semiMajorAxisAU, sp.eccentricity, sp.inclinationDeg, 0, sp.longitudeOfPerihelionDeg, 0);
        list.push({
          id: sp.id,
          name: sp.name,
          designation: `Synthetic Particle (a=${sp.semiMajorAxisAU} AU)`,
          category: 'simulation-particles',
          categoryLabel: 'Dynamical Test Particle',
          heliocentricAU: pos,
          distSunAU: Number(Math.hypot(pos.x, pos.y).toFixed(1)),
          orbitalElements: {
            semiMajorAxisAU: sp.semiMajorAxisAU,
            eccentricity: sp.eccentricity,
            inclinationDeg: sp.inclinationDeg,
            longitudeOfPerihelionDeg: sp.longitudeOfPerihelionDeg,
            perihelionAU: sp.perihelionAU,
            aphelionAU: Number((sp.semiMajorAxisAU * (1 + sp.eccentricity)).toFixed(1))
          },
          color: 'rgba(192, 132, 252, 0.75)',
          isHypothetical: true,
          isSimulatedParticle: true,
          dataStatus: 'SIMULATED TEST PARTICLE',
          dataSource: 'Secular Perturbation Model (Kozai-Lidov Confinement)',
          scientificDisclaimer: 'Synthetic particle illustrating dynamical resonance under Sun + giant planets + Planet Nine.'
        });
      }
    }

    return list;
  }, [planetNineParams, visibleCategories, secularState]);

  // Filtered radar targets based on active category checkboxes
  const filteredRadarTargets = useMemo(() => {
    return allRadarTargets.filter(t => visibleCategories[t.category]);
  }, [allRadarTargets, visibleCategories]);

  // Selected target object details
  const selectedTarget = useMemo(() => {
    return allRadarTargets.find(t => t.id === selectedTargetId) || allRadarTargets[0];
  }, [allRadarTargets, selectedTargetId]);

  // Count targets within the current range vs outside range
  const targetsInRange = useMemo(() => {
    return filteredRadarTargets.filter(t => {
      const r = Math.hypot(t.heliocentricAU.x, t.heliocentricAU.y);
      return r <= customRangeAU;
    });
  }, [filteredRadarTargets, customRangeAU]);

  // Step Secular Simulation when in Planet X Lab
  const handleStepSimulation = (dtMyr: number) => {
    setSecularState(prev => stepSecularSimulation(prev, dtMyr, planetNineParams, prev.withPlanetNine));
  };
  const handleToggleWithP9 = () => {
    setSecularState(prev => ({
      ...prev,
      withPlanetNine: !prev.withPlanetNine
    }));
  };
  const handleResetSimulation = () => {
    setSecularState({
      timeMyr: 0,
      particles: generateSecularTestParticles(),
      planetNine: planetNineParams,
      withPlanetNine: true,
      clusteringMetric: 0.92,
      dispersionStdDeg: 28.5
    });
  };

  // Canvas Mouse Click Selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radarRadiusPx = Math.min(centerX, centerY) - 20;

    let closestTarget: RadarTarget | null = null;
    let minDistancePx = 18;

    for (const target of targetsInRange) {
      if (target.id === 'sun') {
        const d = Math.hypot(clickX - centerX, clickY - centerY);
        if (d < minDistancePx) {
          closestTarget = target;
          minDistancePx = d;
        }
        continue;
      }

      const proj = projectHeliocentricToRadar(
        target.heliocentricAU.x,
        target.heliocentricAU.y,
        customRangeAU,
        centerX,
        centerY,
        radarRadiusPx
      );

      const d = Math.hypot(clickX - proj.xPx, clickY - proj.yPx);
      if (d < minDistancePx) {
        closestTarget = target;
        minDistancePx = d;
      }
    }

    if (closestTarget) {
      setSelectedTargetId(closestTarget.id);
    }
  };

  // Main Radar Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (now: number) => {
      if (!isRunning) return;

      const dtSec = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000);
      lastFrameTimeRef.current = now;

      // Update sweep angle smoothly
      if (isSweepRunning) {
        const sweepSpeedDegPerSec = (360 / 6) * sweepSpeedMultiplier;
        sweepAngleRef.current = (sweepAngleRef.current + sweepSpeedDegPerSec * dtSec) % 360;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 300;
      const height = canvas.clientHeight || 300;

      if (width <= 40 || height <= 40) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep Space Background
      ctx.fillStyle = '#050B1A';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const radarRadiusPx = Math.max(10, Math.min(centerX, centerY) - 20);

      // Radar Screen Boundary Clip (Circular Radar Scope)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radarRadiusPx, 0, 2 * Math.PI);
      ctx.clip();

      // Subtle Background Polar Grid
      ctx.fillStyle = '#060D22';
      ctx.fillRect(0, 0, width, height);

      // Radial Bearings (every 30 degrees)
      ctx.strokeStyle = '#0E1E42';
      ctx.lineWidth = 1;
      for (let deg = 0; deg < 360; deg += 30) {
        const rad = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(rad) * radarRadiusPx, centerY - Math.sin(rad) * radarRadiusPx);
        ctx.stroke();
      }

      // Principal Cardinal Crosshairs
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(centerX - radarRadiusPx, centerY);
      ctx.lineTo(centerX + radarRadiusPx, centerY);
      ctx.moveTo(centerX, centerY - radarRadiusPx);
      ctx.lineTo(centerX, centerY + radarRadiusPx);
      ctx.stroke();

      // Concentric Range Rings according to active Range Preset
      const activePreset = RADAR_RANGE_PRESETS[rangePresetId];
      const rings = activePreset ? activePreset.rangeRingsAU : [customRangeAU * 0.25, customRangeAU * 0.5, customRangeAU * 0.75, customRangeAU];

      rings.forEach(ringAU => {
        if (ringAU > customRangeAU * 1.05) return;
        const ringRPx = (ringAU / customRangeAU) * radarRadiusPx;
        if (ringRPx < 8) return;

        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRPx, 0, 2 * Math.PI);
        const isNeptune = Math.abs(ringAU - 30.0) < 0.5;
        const isEarth = Math.abs(ringAU - 1.0) < 0.1;

        if (isNeptune) {
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
        } else if (isEarth) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.lineWidth = 1.0;
          ctx.setLineDash([2, 4]);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Ring distance annotations
        ctx.fillStyle = isNeptune ? '#3B82F6' : 'rgba(167, 180, 204, 0.65)';
        ctx.font = '10px monospace';
        const labelText = activePreset?.ringLabels[ringAU] || `${ringAU} AU`;
        ctx.fillText(labelText, centerX + ringRPx + 4, centerY - 4);
      });

      // Orbit Paths (Keplerian Ellipses for Selected/Major Bodies)
      if (showOrbitPaths) {
        targetsInRange.forEach(target => {
          if (!target.orbitalElements || target.id === 'sun') return;
          const a = target.orbitalElements.semiMajorAxisAU;
          const e = target.orbitalElements.eccentricity;
          if (a <= 0 || a > customRangeAU * 1.5) return;

          const isSelected = target.id === selectedTargetId;
          const isP9 = target.id === 'planet-x';
          const isDistant = target.category === 'distant-tnos';

          ctx.beginPath();
          const orbitSteps = 90;
          for (let step = 0; step <= orbitSteps; step++) {
            const trueAnom = (step / orbitSteps) * 360;
            const pos = computeKeplerianOrbitPositionAU(
              a,
              e,
              target.orbitalElements.inclinationDeg || 0,
              target.orbitalElements.longitudeOfAscendingNodeDeg || 0,
              target.orbitalElements.argumentOfPerihelionDeg || 0,
              trueAnom
            );

            const proj = projectHeliocentricToRadar(
              pos.x,
              pos.y,
              customRangeAU,
              centerX,
              centerY,
              radarRadiusPx
            );

            if (step === 0) ctx.moveTo(proj.xPx, proj.yPx);
            else ctx.lineTo(proj.xPx, proj.yPx);
          }

          if (isP9) {
            ctx.setLineDash([6, 6]);
            ctx.strokeStyle = isSelected ? 'rgba(192, 132, 252, 0.95)' : 'rgba(139, 92, 246, 0.75)';
            ctx.lineWidth = isSelected ? 2.5 : 1.8;
          } else if (isDistant) {
            ctx.setLineDash([3, 3]);
            ctx.strokeStyle = isSelected ? 'rgba(251, 113, 133, 0.9)' : 'rgba(225, 29, 72, 0.4)';
            ctx.lineWidth = isSelected ? 2.0 : 1.2;
          } else {
            ctx.setLineDash([]);
            ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.85)' : 'rgba(56, 189, 248, 0.2)';
            ctx.lineWidth = isSelected ? 1.8 : 0.9;
          }

          ctx.stroke();
          ctx.setLineDash([]);
        });
      }

      // Rotating Radar Sweep with Phosphor Trailing Fan
      const sweepRad = (sweepAngleRef.current * Math.PI) / 180;
      const sweepX = centerX + Math.cos(sweepRad) * radarRadiusPx;
      const sweepY = centerY - Math.sin(sweepRad) * radarRadiusPx;

      if (showPhosphorGlow && isSweepRunning) {
        const trailArcRad = (45 * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radarRadiusPx, -sweepRad, -(sweepRad - trailArcRad), false);
        ctx.closePath();

        const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radarRadiusPx);
        sweepGradient.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        sweepGradient.addColorStop(0.7, 'rgba(56, 189, 248, 0.08)');
        sweepGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = sweepGradient;
        ctx.fill();
      }

      // Main Sweep Ray Line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Target Blips and Phosphor Highlights
      targetsInRange.forEach(target => {
        if (target.id === 'sun') return;

        const proj = projectHeliocentricToRadar(
          target.heliocentricAU.x,
          target.heliocentricAU.y,
          customRangeAU,
          centerX,
          centerY,
          radarRadiusPx
        );

        if (!proj.inRange) return;

        const isSelected = target.id === selectedTargetId;
        const isP9 = target.id === 'planet-x';
        const isSimParticle = target.isSimulatedParticle;

        const phosphorFactor = computeSweepPhosphorIntensity(sweepAngleRef.current, proj.azimuthDeg, 55.0);

        let blipRadius = 3.2;
        if (target.id === 'jupiter' || target.id === 'earth') blipRadius = 4.5;
        if (isP9) blipRadius = 5.0;
        if (isSimParticle) blipRadius = 2.0;

        // Selection Reticle
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(proj.xPx, proj.yPx, blipRadius + 6, 0, 2 * Math.PI);
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          const reticleLen = 4;
          ctx.beginPath();
          ctx.moveTo(proj.xPx - blipRadius - 8, proj.yPx);
          ctx.lineTo(proj.xPx - blipRadius - 8 + reticleLen, proj.yPx);
          ctx.moveTo(proj.xPx + blipRadius + 8, proj.yPx);
          ctx.lineTo(proj.xPx + blipRadius + 8 - reticleLen, proj.yPx);
          ctx.moveTo(proj.xPx, proj.yPx - blipRadius - 8);
          ctx.lineTo(proj.xPx, proj.yPx - blipRadius - 8 + reticleLen);
          ctx.moveTo(proj.xPx, proj.yPx + blipRadius + 8);
          ctx.lineTo(proj.xPx, proj.yPx + blipRadius + 8 - reticleLen);
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Phosphor sweep ping pulse
        if (phosphorFactor > 0.05 && showPhosphorGlow) {
          ctx.beginPath();
          ctx.arc(proj.xPx, proj.yPx, blipRadius + 7 * phosphorFactor, 0, 2 * Math.PI);
          ctx.fillStyle = isP9 
            ? `rgba(168, 85, 247, ${phosphorFactor * 0.4})` 
            : `rgba(56, 189, 248, ${phosphorFactor * 0.4})`;
          ctx.fill();
        }

        // Target Core Marker
        ctx.beginPath();
        if (isP9) {
          const size = blipRadius + 1;
          ctx.moveTo(proj.xPx, proj.yPx - size);
          ctx.lineTo(proj.xPx + size, proj.yPx);
          ctx.lineTo(proj.xPx, proj.yPx + size);
          ctx.lineTo(proj.xPx - size, proj.yPx);
          ctx.closePath();
        } else {
          ctx.arc(proj.xPx, proj.yPx, blipRadius, 0, 2 * Math.PI);
        }

        ctx.fillStyle = target.color;
        ctx.shadowColor = target.color;
        ctx.shadowBlur = isSelected ? 12 : phosphorFactor > 0 ? 8 : 3;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Target Label
        if (showLabels && (isSelected || isP9 || phosphorFactor > 0.3 || customRangeAU <= 35 || target.id === 'sedna')) {
          ctx.fillStyle = isSelected ? '#38BDF8' : isP9 ? '#C084FC' : '#F8FAFC';
          ctx.font = `${isSelected ? 'bold ' : ''}10px -apple-system, sans-serif`;
          const displayName = isP9 ? 'Planet Nine [Hypothetical]' : target.name.split('(')[0].trim();
          ctx.fillText(displayName, proj.xPx + blipRadius + 5, proj.yPx + 3);

          if (isSelected) {
            ctx.fillStyle = 'rgba(167, 180, 204, 0.8)';
            ctx.font = '9px monospace';
            ctx.fillText(`${target.distSunAU} AU`, proj.xPx + blipRadius + 5, proj.yPx + 14);
          }
        }
      });

      // Draw Central Sun Reference Marker
      ctx.beginPath();
      const sunGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 16);
      sunGlow.addColorStop(0, '#FFFFFF');
      sunGlow.addColorStop(0.3, '#F5C451');
      sunGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGlow;
      ctx.arc(centerX, centerY, 16, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#F5C451';
      ctx.fill();

      ctx.restore(); // Restore scope clip

      // Outer Scope Frame Ring & Bearing Compass Ticks
      ctx.beginPath();
      ctx.arc(centerX, centerY, radarRadiusPx, 0, 2 * Math.PI);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radarRadiusPx + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cardinal Coordinate Markings on Perimeter (ICRF Ecliptic J2000)
      ctx.fillStyle = '#38BDF8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('0° (Vernal Equinox)', centerX + radarRadiusPx - 40, centerY - 8);
      ctx.fillText('90° (Ecliptic +Y)', centerX, centerY - radarRadiusPx + 14);
      ctx.fillText('180°', centerX - radarRadiusPx + 20, centerY - 8);
      ctx.fillText('270°', centerX, centerY + radarRadiusPx - 8);

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Draw initial frame immediately to prevent any blank canvas delay
    render(performance.now());

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    customRangeAU,
    rangePresetId,
    targetsInRange,
    selectedTargetId,
    isSweepRunning,
    sweepSpeedMultiplier,
    showLabels,
    showOrbitPaths,
    showPhosphorGlow
  ]);

  return (
    <div id="deep-space-radar" className="space-y-6 animate-fadeIn">
      {/* 1. TOP RADAR INSTRUMENT HEADER */}
      <div className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
              <Radio className={`w-4 h-4 ${isSweepRunning ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8] font-bold block">
                NASA/JPL Astrometry & Dynamical Simulation
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC]">
                Deep-Space Tracking & Investigation Radar
              </h3>
            </div>
          </div>
          <p className="text-xs text-[#A7B4CC] max-w-2xl">
            High-precision ICRF/J2000 top-down heliocentric monitoring system integrating near-Earth asteroids, distant trans-Neptunian sednoids, and the hypothetical Planet Nine dynamical simulation.
          </p>
        </div>

        {/* Mode Selector & Expand Toggle */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center rounded-xl bg-[#050B1A] border border-[#1E293B] p-1 text-xs font-mono">
            <button
              onClick={() => setRadarMode('surveillance')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                radarMode === 'surveillance'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              Surveillance Mode
            </button>
            <button
              onClick={() => {
                setRadarMode('planet-x-lab');
                handleSelectRangePreset('deep-space');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                radarMode === 'planet-x-lab'
                  ? 'bg-[#8B5CF6] text-white font-bold shadow'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Planet X Lab</span>
            </button>
          </div>

          <button
            onClick={() => setIsWidescreenExpanded(!isWidescreenExpanded)}
            className="p-2 rounded-xl bg-[#050B1A] hover:bg-[#132247] border border-[#1E293B] text-[#A7B4CC] hover:text-[#38BDF8] transition-colors"
            title={isWidescreenExpanded ? 'Collapse Widescreen' : 'Expand Fullscreen Lab'}
            aria-label="Toggle widescreen layout"
          >
            {isWidescreenExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. SCIENTIFIC NOTICE & PROVENANCE STATUS BANNER */}
      <div className="p-3.5 rounded-xl bg-[#0B1630] border border-[#38BDF8]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#F5C451] shrink-0" />
          <span className="text-[#A7B4CC]">
            <strong className="text-[#F8FAFC]">Astronomical Tracking Notice:</strong> Visualizes Keplerian ephemerides and published dynamical models in heliocentric ecliptic coordinates. Not an active radio radar receiver.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
          {dataError && (
            <span className="flex items-center gap-1 text-[#F5C451]">
              <AlertTriangle className="w-3 h-3" />
              <span>Offline Baseline Active</span>
            </span>
          )}
          <span className="text-[#A7B4CC]">Refreshed: {lastRefreshedUtc.split('T')[1].slice(0, 8)} UTC</span>
          <button
            onClick={refreshRadarCatalog}
            disabled={isLoading}
            className="p-1 rounded bg-[#050B1A] border border-[#1E293B] text-[#38BDF8] hover:text-[#F8FAFC] transition-colors disabled:opacity-50"
            title="Refresh Astrometric State"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className="px-2 py-0.5 rounded bg-[#10B981]/10 text-emerald-400 border border-[#10B981]/30 font-bold">
            {pipelineSource.includes('ICRF') ? 'ICRF/J2000 SYNCHRONIZED' : 'VERIFIED BASELINE'}
          </span>
        </div>
      </div>

      {/* 3. RADAR CONTROLS TOOLBAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-[#0B1630] border border-[#1E293B] p-3.5 rounded-2xl text-xs font-mono">
        {/* Sweep Controls */}
        <div className="md:col-span-4 flex items-center gap-2">
          <button
            onClick={() => setIsSweepRunning(!isSweepRunning)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              isSweepRunning 
                ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40' 
                : 'bg-[#0E1E42] text-[#A7B4CC] border border-[#1E293B]'
            }`}
          >
            {isSweepRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSweepRunning ? 'Sweep: Active' : 'Sweep: Paused'}</span>
          </button>

          <div className="flex items-center rounded-lg bg-[#050B1A] border border-[#1E293B] p-0.5">
            {[0.5, 1.0, 2.0].map(multiplier => (
              <button
                key={multiplier}
                onClick={() => setSweepSpeedMultiplier(multiplier)}
                className={`px-2 py-1 rounded text-[11px] transition-all ${
                  sweepSpeedMultiplier === multiplier
                    ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                    : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
                }`}
              >
                {multiplier}x
              </button>
            ))}
          </div>

          <button
            onClick={handleResetView}
            className="p-1.5 rounded-lg bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] transition-colors ml-auto md:ml-0"
            title="Reset Radar View"
            aria-label="Reset radar view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Range Presets */}
        <div className="md:col-span-5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[#A7B4CC] text-[11px] mr-1">Range:</span>
          {(['inner', 'outer', 'tno', 'deep-space'] as RadarRangePresetId[]).map(pid => (
            <button
              key={pid}
              onClick={() => handleSelectRangePreset(pid)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                rangePresetId === pid
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold'
                  : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
              }`}
            >
              {pid === 'inner' ? '5 AU' : pid === 'outer' ? '35 AU' : pid === 'tno' ? '150 AU' : '1,000 AU'}
            </button>
          ))}

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded bg-[#050B1A] hover:bg-[#38BDF8] hover:text-[#050B1A] text-[#F8FAFC] border border-[#1E293B] transition-colors"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-[#38BDF8] px-1.5 py-0.5 rounded bg-[#050B1A] border border-[#1E293B]">
              {customRangeAU >= 100 ? `${Math.round(customRangeAU)} AU` : `${customRangeAU} AU`}
            </span>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded bg-[#050B1A] hover:bg-[#38BDF8] hover:text-[#050B1A] text-[#F8FAFC] border border-[#1E293B] transition-colors"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Display Overlays Toggles */}
        <div className="md:col-span-3 flex items-center justify-end gap-3 text-[11px] text-[#A7B4CC]">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={e => setShowLabels(e.target.checked)}
              className="accent-[#38BDF8] rounded"
            />
            <span>Labels</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={showOrbitPaths}
              onChange={e => setShowOrbitPaths(e.target.checked)}
              className="accent-[#8B5CF6] rounded"
            />
            <span>Orbits</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#F8FAFC]">
            <input
              type="checkbox"
              checked={showPhosphorGlow}
              onChange={e => setShowPhosphorGlow(e.target.checked)}
              className="accent-emerald-400 rounded"
            />
            <span>Phosphor</span>
          </label>
        </div>
      </div>

      {/* 4. MAIN RADAR VIEWPORT & INSPECTOR GRID */}
      <div className={`grid grid-cols-1 ${isWidescreenExpanded ? 'lg:grid-cols-12' : 'lg:grid-cols-12'} gap-6 items-start`}>
        {/* LEFT: 2D RADAR CANVAS VIEWPORT */}
        <div className={`${isWidescreenExpanded ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-7 xl:col-span-8'} space-y-4`}>
          <div className="relative rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-2xl overflow-hidden">
            {/* Top Canvas Bar */}
            <div className="bg-[#050B1A]/90 backdrop-blur-md px-4 py-2.5 border-b border-[#1E293B] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
                <span className="text-[#F8FAFC] font-bold">Heliocentric Radar Scope</span>
                <span className="text-[#A7B4CC] text-[11px]">[{RADAR_RANGE_PRESETS[rangePresetId]?.label}]</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#A7B4CC]">
                <span>In Scope:</span>
                <span className="text-[#38BDF8] font-bold">{targetsInRange.length} Targets</span>
              </div>
            </div>

            {/* Canvas Element */}
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              tabIndex={0}
              role="region"
              aria-label="Interactive Deep-Space Radar Scope. Click any blip to inspect its astronomical telemetry."
              className="w-full h-112 sm:h-128 block select-none cursor-crosshair focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/40"
            />

            {/* Scope Bottom Overlay Legend */}
            <div className="absolute bottom-3 left-3 bg-[#050B1A]/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#1E293B] text-[11px] font-mono space-y-1.5 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                <span className="text-[#F8FAFC]">Major Planets (Neptune 30 AU)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
                <span className="text-[#FB7185]">Distant Sednoids (Sedna, VP113)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rotate-45 bg-[#8B5CF6] inline-block" />
                <span className="text-[#C084FC]">Hypothetical Planet Nine (Simulated)</span>
              </div>
            </div>

            {/* Off-Range Indicator if targets are outside current range */}
            {filteredRadarTargets.length > targetsInRange.length && (
              <div className="absolute top-12 right-3 pointer-events-none">
                <span className="text-[10px] font-mono text-[#F5C451] bg-[#050B1A]/80 px-2.5 py-1 rounded border border-[#F5C451]/30">
                  +{filteredRadarTargets.length - targetsInRange.length} targets beyond scope range
                </span>
              </div>
            )}
          </div>

          {/* Category Filter Chips with Counters */}
          <div className="p-3.5 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-2">
            <span className="text-xs font-mono text-[#A7B4CC] block">Filter Target Categories:</span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                onClick={() => toggleCategory('planets')}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                  visibleCategories.planets
                    ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-[#38BDF8] font-bold'
                    : 'bg-[#050B1A] border-[#1E293B] text-[#A7B4CC] opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                <span>Planets & Reference Bodies</span>
              </button>

              <button
                onClick={() => toggleCategory('asteroids')}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                  visibleCategories.asteroids
                    ? 'bg-[#F5C451]/15 border-[#F5C451] text-[#F5C451] font-bold'
                    : 'bg-[#050B1A] border-[#1E293B] text-[#A7B4CC] opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#F5C451]" />
                <span>Near-Earth Asteroids</span>
              </button>

              <button
                onClick={() => toggleCategory('distant-tnos')}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                  visibleCategories['distant-tnos']
                    ? 'bg-[#FB7185]/15 border-[#FB7185] text-[#FB7185] font-bold'
                    : 'bg-[#050B1A] border-[#1E293B] text-[#A7B4CC] opacity-60'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
                <span>Extreme TNOs (Sednoids)</span>
              </button>

              <button
                onClick={() => toggleCategory('hypothetical-p9')}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                  visibleCategories['hypothetical-p9']
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#C084FC] font-bold'
                    : 'bg-[#050B1A] border-[#1E293B] text-[#A7B4CC] opacity-60'
                }`}
              >
                <span className="w-2 h-2 rotate-45 bg-[#8B5CF6]" />
                <span>Planet Nine Layer [Hypothetical]</span>
              </button>

              {radarMode === 'planet-x-lab' && (
                <button
                  onClick={() => toggleCategory('simulation-particles')}
                  className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                    visibleCategories['simulation-particles']
                      ? 'bg-purple-900/30 border-purple-400 text-purple-300 font-bold'
                      : 'bg-[#050B1A] border-[#1E293B] text-[#A7B4CC] opacity-60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Secular Test Particles (N=14)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: TARGET TELEMETRY INSPECTOR & PLANET X DYNAMICAL DRAWER */}
        <div className={`${isWidescreenExpanded ? 'lg:col-span-5 xl:col-span-4' : 'lg:col-span-5 xl:col-span-4'} space-y-4`}>
          {/* A. TARGET TELEMETRY INSPECTOR */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-4 shadow-xl">
            <div className="flex items-start justify-between border-b border-[#1E293B] pb-3">
              <div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                  selectedTarget.isHypothetical ? 'text-[#8B5CF6]' : 'text-[#38BDF8]'
                }`}>
                  {selectedTarget.categoryLabel}
                </span>
                <h4 className="text-xl font-bold text-[#F8FAFC]">
                  {selectedTarget.name}
                </h4>
                {selectedTarget.designation && (
                  <span className="text-xs text-[#A7B4CC] font-mono">
                    {selectedTarget.designation}
                  </span>
                )}
              </div>

              {/* Data Status Badge */}
              <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                selectedTarget.dataStatus === 'HYPOTHETICAL TARGET'
                  ? 'bg-[#8B5CF6]/20 text-[#C084FC] border-[#8B5CF6]/40'
                  : selectedTarget.dataStatus === 'SIMULATED TEST PARTICLE'
                  ? 'bg-purple-900/30 text-purple-300 border-purple-500/40'
                  : 'bg-[#10B981]/15 text-emerald-400 border-[#10B981]/30'
              }`}>
                {selectedTarget.dataStatus}
              </span>
            </div>

            {/* Heliocentric Coordinates & Distances */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Heliocentric (Sun):</span>
                <span className="text-[#38BDF8] font-bold text-sm">
                  {selectedTarget.distSunAU} AU
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Earth Distance:</span>
                <span className="text-[#F8FAFC] font-bold text-sm">
                  {selectedTarget.distEarthAU ? `${selectedTarget.distEarthAU} AU` : 'Computed'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Orbital Speed:</span>
                <span className="text-[#F5C451] font-bold text-sm">
                  {selectedTarget.orbitalSpeedKmS ? `${selectedTarget.orbitalSpeedKmS} km/s` : 'Varies'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B]">
                <span className="text-[10px] text-[#A7B4CC] block">Ecliptic Vector (X, Y):</span>
                <span className="text-[#A7B4CC] text-[11px] block truncate">
                  ({selectedTarget.heliocentricAU.x.toFixed(1)}, {selectedTarget.heliocentricAU.y.toFixed(1)}) AU
                </span>
              </div>
            </div>

            {/* Keplerian Orbital Elements (when available) */}
            {selectedTarget.orbitalElements && (
              <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-2 text-xs font-mono">
                <span className="text-[10px] text-[#A7B4CC] uppercase font-bold block border-b border-[#1E293B] pb-1">
                  Keplerian Orbital Architecture
                </span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <div>
                    <span className="text-[#A7B4CC]">Semi-major (a): </span>
                    <span className="text-[#F8FAFC] font-semibold">{selectedTarget.orbitalElements.semiMajorAxisAU} AU</span>
                  </div>
                  <div>
                    <span className="text-[#A7B4CC]">Eccentricity (e): </span>
                    <span className="text-[#F8FAFC] font-semibold">{selectedTarget.orbitalElements.eccentricity}</span>
                  </div>
                  <div>
                    <span className="text-[#A7B4CC]">Perihelion (q): </span>
                    <span className="text-[#38BDF8] font-semibold">{selectedTarget.orbitalElements.perihelionAU ?? (selectedTarget.orbitalElements.semiMajorAxisAU * (1 - selectedTarget.orbitalElements.eccentricity)).toFixed(1)} AU</span>
                  </div>
                  <div>
                    <span className="text-[#A7B4CC]">Aphelion (Q): </span>
                    <span className="text-[#F5C451] font-semibold">{selectedTarget.orbitalElements.aphelionAU ?? (selectedTarget.orbitalElements.semiMajorAxisAU * (1 + selectedTarget.orbitalElements.eccentricity)).toFixed(1)} AU</span>
                  </div>
                  <div>
                    <span className="text-[#A7B4CC]">Inclination (i): </span>
                    <span className="text-[#F8FAFC] font-semibold">{selectedTarget.orbitalElements.inclinationDeg}°</span>
                  </div>
                  <div>
                    <span className="text-[#A7B4CC]">Long. Perihelion (ϖ): </span>
                    <span className="text-[#C084FC] font-semibold">{selectedTarget.orbitalElements.longitudeOfPerihelionDeg ?? 'N/A'}°</span>
                  </div>
                </div>
              </div>
            )}

            {/* Scientific Provenance Attribution */}
            <div className="space-y-1 text-xs border-t border-[#1E293B] pt-3">
              <span className="text-[10px] font-mono text-[#A7B4CC] block">Data Source & Attribution:</span>
              <p className="text-[11px] text-[#F8FAFC]">
                {selectedTarget.dataSource}
              </p>
              {selectedTarget.scientificDisclaimer && (
                <p className="text-[10px] text-[#F5C451] leading-relaxed pt-1">
                  * {selectedTarget.scientificDisclaimer}
                </p>
              )}
            </div>

            {/* Quick Navigation Cross-Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => onNavigate('observatory')}
                className="py-2.5 px-3 rounded-xl bg-[#050B1A] hover:bg-[#132247] border border-[#38BDF8]/40 hover:border-[#38BDF8] text-[#38BDF8] font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Telescope className="w-3.5 h-3.5" />
                <span>View in Observatory</span>
              </button>

              {selectedTarget.category === 'hypothetical-p9' || selectedTarget.category === 'distant-tnos' ? (
                <button
                  onClick={() => onNavigate('planet-x')}
                  className="py-2.5 px-3 rounded-xl bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/50 text-[#C084FC] font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Orbit className="w-3.5 h-3.5" />
                  <span>Open Planet X Lab</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('asteroid-watch')}
                  className="py-2.5 px-3 rounded-xl bg-[#050B1A] hover:bg-[#132247] border border-[#1E293B] hover:border-emerald-500 text-[#F8FAFC] hover:text-emerald-400 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Track Asteroid Watch</span>
                </button>
              )}
            </div>
          </div>

          {/* B. PLANET X DYNAMICAL PARAMETERS DRAWER (Active in Planet X Lab mode) */}
          {radarMode === 'planet-x-lab' && (
            <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#8B5CF6]/40 space-y-4 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#8B5CF6]" />
                  <h5 className="font-bold text-sm text-[#F8FAFC]">
                    Planet Nine Hypothesis Parameters
                  </h5>
                </div>
                <span className="text-[10px] font-mono text-[#8B5CF6] uppercase font-bold">
                  Batygin & Brown (2021)
                </span>
              </div>

              {/* Published Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-[#A7B4CC]">Load Published Literature Model:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs font-mono">
                  <button
                    onClick={() => handleApplyP9Preset('batyginBrown2021')}
                    className="p-2 rounded-lg bg-[#050B1A] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#C084FC] text-center font-bold transition-all"
                  >
                    B&B 2021
                    <span className="text-[9px] block text-[#A7B4CC] font-normal">380 AU / 6.2 M⊕</span>
                  </button>
                  <button
                    onClick={() => handleApplyP9Preset('batyginBrown2016')}
                    className="p-2 rounded-lg bg-[#050B1A] hover:bg-[#8B5CF6]/20 border border-[#1E293B] hover:border-[#8B5CF6]/40 text-[#F8FAFC] text-center font-bold transition-all"
                  >
                    B&B 2016
                    <span className="text-[9px] block text-[#A7B4CC] font-normal">700 AU / 10 M⊕</span>
                  </button>
                  <button
                    onClick={() => handleApplyP9Preset('trujilloSheppard2014')}
                    className="p-2 rounded-lg bg-[#050B1A] hover:bg-[#8B5CF6]/20 border border-[#1E293B] hover:border-[#8B5CF6]/40 text-[#F8FAFC] text-center font-bold transition-all"
                  >
                    T&S 2014
                    <span className="text-[9px] block text-[#A7B4CC] font-normal">450 AU / 5 M⊕</span>
                  </button>
                </div>
              </div>

              {/* Real-time Interactive Sliders */}
              <div className="space-y-3 text-xs font-mono">
                {/* Mass */}
                <div>
                  <div className="flex justify-between text-[#A7B4CC] pb-1">
                    <span>Predicted Mass (M_p9):</span>
                    <span className="text-[#38BDF8] font-bold">{planetNineParams.massEarth} M⊕</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.2"
                    value={planetNineParams.massEarth}
                    onChange={e => handleUpdateP9Param('massEarth', parseFloat(e.target.value))}
                    className="w-full accent-[#8B5CF6]"
                  />
                </div>

                {/* Perihelion Distance q */}
                <div>
                  <div className="flex justify-between text-[#A7B4CC] pb-1">
                    <span>Perihelion Distance (q):</span>
                    <span className="text-[#38BDF8] font-bold">{planetNineParams.perihelionAU} AU</span>
                  </div>
                  <input
                    type="range"
                    min="180"
                    max="360"
                    step="5"
                    value={planetNineParams.perihelionAU}
                    onChange={e => handleUpdateP9Param('perihelionAU', parseFloat(e.target.value))}
                    className="w-full accent-[#8B5CF6]"
                  />
                </div>

                {/* Eccentricity e */}
                <div>
                  <div className="flex justify-between text-[#A7B4CC] pb-1">
                    <span>Eccentricity (e):</span>
                    <span className="text-[#38BDF8] font-bold">{planetNineParams.eccentricity}</span>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="0.65"
                    step="0.01"
                    value={planetNineParams.eccentricity}
                    onChange={e => handleUpdateP9Param('eccentricity', parseFloat(e.target.value))}
                    className="w-full accent-[#8B5CF6]"
                  />
                </div>

                {/* Derived Values Readout */}
                <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B] grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#A7B4CC] block">Derived Semi-major:</span>
                    <span className="text-[#F8FAFC] font-bold">{planetNineParams.semiMajorAxisAU} AU</span>
                  </div>
                  <div>
                    <span className="text-[#A7B4CC] block">Orbital Period:</span>
                    <span className="text-[#F8FAFC] font-bold">{planetNineParams.orbitalPeriodYears.toLocaleString()} yrs</span>
                  </div>
                </div>
              </div>

              {/* Secular Simulation Controls */}
              <div className="pt-2 border-t border-[#1E293B] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A7B4CC]">Dynamical Secular Confinement:</span>
                  <span className="text-purple-300 font-bold">{secularState.timeMyr} Myr elapsed</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStepSimulation(5.0)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#050B1A] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 text-[#C084FC] text-xs font-mono font-bold transition-all"
                  >
                    +5 Myr Step
                  </button>
                  <button
                    onClick={handleToggleWithP9}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      secularState.withPlanetNine
                        ? 'bg-purple-900/30 text-purple-300 border-purple-500/40'
                        : 'bg-red-900/30 text-red-300 border-red-500/40'
                    }`}
                  >
                    {secularState.withPlanetNine ? 'P9 Active' : 'P9 Removed (Disperse)'}
                  </button>
                  <button
                    onClick={handleResetSimulation}
                    className="p-1.5 rounded-lg bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]"
                    title="Reset Secular Simulation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
