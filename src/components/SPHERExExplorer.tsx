import { useState, useRef, useEffect, type FC } from 'react';
import { SPHEREX_BANDS, CELESTIAL_TARGETS } from '../data/spherexData';
import type { InfraredBand, CelestialTarget } from '../types';
import { 
  processImageData, 
  type ColorPalette, 
  type StretchFunction 
} from '../utils/imageProcessing';
import { 
  Telescope, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sun, 
  Sliders, 
  Layers, 
  SplitSquareVertical, 
  Columns, 
  Info, 
  ShieldAlert, 
  Droplet, 
  Move, 
  Loader2, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  Activity,
  ExternalLink,
  SlidersHorizontal,
  Link2,
  Unlink2,
  BookOpen,
  Sparkles,
  Compass
} from 'lucide-react';

export const SPHERExExplorer: FC = () => {
  // Target & Band Selection (Primary Image A)
  const [selectedTarget, setSelectedTarget] = useState<CelestialTarget>(CELESTIAL_TARGETS[0]);
  const [selectedBand, setSelectedBand] = useState<InfraredBand>(SPHEREX_BANDS[3]); // Default: 3.0 µm Water Ice

  // Image Manipulation State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState<number>(100); // 100% normal (50% to 200%)
  const [contrast, setContrast] = useState<number>(100); // 100% normal (50% to 200%)
  const [palette, setPalette] = useState<ColorPalette>('viridis');
  const [stretch, setStretch] = useState<StretchFunction>('linear');

  // Comparison Workspace State
  const [viewMode, setViewMode] = useState<'split-slider' | 'side-by-side' | 'single'>('split-slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%

  // Secondary Image B (for comparison workspace)
  const [compareTarget, setCompareTarget] = useState<CelestialTarget>(CELESTIAL_TARGETS[1]);
  const [compareBand, setCompareBand] = useState<InfraredBand>(SPHEREX_BANDS[0]);
  const [syncZoomPan, setSyncZoomPan] = useState<boolean>(true);
  const [compareZoom, setCompareZoom] = useState<number>(1);
  const [comparePan, setComparePan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Dragging / Panning State
  const [isDraggingPan, setIsDraggingPan] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isSliderDraggingRef = useRef<boolean>(false);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Canvas Refs for Real Pixel Processing
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compareCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Zoom Handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.7));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setPalette('viridis');
    setStretch('linear');
    setSliderPosition(50);
    setCompareZoom(1);
    setComparePan({ x: 0, y: 0 });
  };

  const handleResetComparison = () => {
    setViewMode('split-slider');
    setSliderPosition(50);
    setCompareTarget(CELESTIAL_TARGETS[1]);
    setCompareBand(SPHEREX_BANDS[0]);
    setSyncZoomPan(true);
    setCompareZoom(1);
    setComparePan({ x: 0, y: 0 });
  };

  // Pan Handlers (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSliderDraggingRef.current) return;
    setIsDraggingPan(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPan) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => setIsDraggingPan(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSliderDraggingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDraggingPan(true);
    dragStartRef.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingPan || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStartRef.current.x,
      y: touch.clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => setIsDraggingPan(false);

  // Split-slider handle drag tracking (Mouse & Touch)
  const handleSliderDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    isSliderDraggingRef.current = true;
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isSliderDraggingRef.current || !viewerContainerRef.current) return;
      const rect = viewerContainerRef.current.getBoundingClientRect();
      const pos = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, pos)));
    };
    const onMouseUp = () => {
      isSliderDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSliderTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    isSliderDraggingRef.current = true;
    const onTouchMove = (moveEvent: TouchEvent) => {
      if (!isSliderDraggingRef.current || !viewerContainerRef.current || moveEvent.touches.length === 0) return;
      const touch = moveEvent.touches[0];
      const rect = viewerContainerRef.current.getBoundingClientRect();
      const pos = ((touch.clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, pos)));
    };
    const onTouchEnd = () => {
      isSliderDraggingRef.current = false;
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
  };

  // Keyboard accessibility controls for the viewer
  const handleViewerKeyDown = (e: React.KeyboardEvent) => {
    const step = 25;
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      handleZoomIn();
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      handleZoomOut();
    } else if (e.key === '0') {
      e.preventDefault();
      handleReset();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPan(prev => ({ ...prev, x: prev.x + step }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPan(prev => ({ ...prev, x: prev.x - step }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPan(prev => ({ ...prev, y: prev.y + step }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPan(prev => ({ ...prev, y: prev.y - step }));
    }
  };

  // Real Canvas Image Processing Effect for Primary Image A
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedTarget.infraredImage;

    img.onload = () => {
      if (isCancelled) return;
      const canvas = processedCanvasRef.current;
      if (!canvas) {
        setIsLoading(false);
        return;
      }

      const width = img.width || 800;
      const height = img.height || 500;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setIsLoading(false);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const rawImageData = ctx.getImageData(0, 0, width, height);
        const processedImageData = ctx.createImageData(width, height);

        // Apply mathematical stretch, brightness, contrast, and scientific palette transformation
        processImageData(rawImageData, processedImageData, palette, stretch, brightness, contrast);

        ctx.putImageData(processedImageData, 0, 0);
        setIsLoading(false);
      } catch (err) {
        console.warn('Canvas image processing fallback:', err);
        ctx.drawImage(img, 0, 0, width, height);
        setIsLoading(false);
      }
    };

    img.onerror = () => {
      if (isCancelled) return;
      setIsLoading(false);
      setLoadError(`Failed to load astronomical dataset for "${selectedTarget.name}".`);
    };

    return () => {
      isCancelled = true;
    };
  }, [selectedTarget, selectedBand, palette, stretch, brightness, contrast]);

  // Secondary canvas processing for side-by-side mode (Image B)
  useEffect(() => {
    if (viewMode !== 'side-by-side') return;
    const canvas = compareCanvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = compareTarget.infraredImage;

    img.onload = () => {
      const width = img.width || 800;
      const height = img.height || 500;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const raw = ctx.getImageData(0, 0, width, height);
        const processed = ctx.createImageData(width, height);
        processImageData(raw, processed, palette, stretch, brightness, contrast);
        ctx.putImageData(processed, 0, 0);
      } catch {
        ctx.drawImage(img, 0, 0, width, height);
      }
    };
  }, [compareTarget, compareBand, palette, stretch, brightness, contrast, viewMode]);

  // Active band chemistry details for current target
  const currentBandData = selectedTarget.bandsData[selectedBand.id] || {
    features: ['Near-infrared baseline continuum'],
    intensityNotes: 'Broad emission within standard survey sensitivity limit.',
    absorptionSignature: 'Continuous spectral baseline.'
  };

  const compareBandData = compareTarget.bandsData[compareBand.id] || {
    features: ['Near-infrared baseline continuum'],
    intensityNotes: 'Broad emission within standard survey sensitivity limit.',
    absorptionSignature: 'Continuous spectral baseline.'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* 1. PAGE HEADER */}
      <div className="space-y-4 pb-6 border-b border-[#1E293B]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-semibold uppercase tracking-wider mb-2">
              <Telescope className="w-3.5 h-3.5" />
              <span>NASA SPHEREx Mission Surveyor & Infrared Laboratory</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight">
              SPHEREx Explorer
            </h1>
            <p className="text-base sm:text-lg text-[#F5C451] font-medium mt-1">
              Multi-Wavelength Infrared Spectroscopy & Mission Data Laboratory
            </p>
          </div>

          {/* View Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B1630] border border-[#1E293B] shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('split-slider')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'split-slider'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
              title="Split comparison slider: Optical vs Infrared"
            >
              <SplitSquareVertical className="w-4 h-4" />
              <span className="hidden sm:inline">Split Slider</span>
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
              title="Side-by-side dual target comparison"
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Side-by-Side</span>
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'single'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
              title="Full single infrared canvas view"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Single View</span>
            </button>
          </div>
        </div>

        {/* Short Introduction Explaining Infrared Astronomy in Simple Language */}
        <p className="text-sm text-[#A7B4CC] leading-relaxed max-w-4xl">
          Infrared light is a form of light invisible to human eyes with longer wavelengths than optical light. While dense cosmic dust clouds completely block visible light, infrared waves pass straight through to unveil newborn protostars, distant early galaxies, and frozen chemical compounds like water and carbon dioxide ice.
        </p>
      </div>

      {/* Target Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#A7B4CC] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Select Primary Astronomical Target (Image A):</span>
          </span>
          <span className="text-[11px] font-mono text-[#38BDF8]">
            {CELESTIAL_TARGETS.length} verified calibration & analog datasets
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {CELESTIAL_TARGETS.map(target => {
            const isSelected = selectedTarget.id === target.id;
            return (
              <button
                key={target.id}
                onClick={() => {
                  setSelectedTarget(target);
                  setPan({ x: 0, y: 0 });
                }}
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-[#0B1630] border-[#38BDF8] shadow-md shadow-[#38BDF8]/10'
                    : 'bg-[#0B1630]/50 border-[#1E293B] hover:border-[#38BDF8]/40 hover:bg-[#0B1630]'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-mono text-[10px] ${isSelected ? 'text-[#38BDF8]' : 'text-[#A7B4CC]'}`}>
                    {target.category}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                    target.dataStatus === 'Real Archival Data'
                      ? 'bg-[#38BDF8]/10 text-[#38BDF8]'
                      : target.dataStatus === 'Synthetic Mission Demonstration'
                      ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]'
                      : 'bg-[#F5C451]/10 text-[#F5C451]'
                  }`}>
                    {target.dataStatus === 'Real Archival Data' ? 'Real' : target.dataStatus === 'Synthetic Mission Demonstration' ? 'Synthetic' : 'Model'}
                  </span>
                </div>
                <div className="font-semibold text-xs text-[#F8FAFC] truncate mt-1">
                  {target.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN LAYOUT: DESKTOP BESIDE, MOBILE STACKED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / TOP: INTERACTIVE SKY VIEWER (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-2xl overflow-hidden">
            {/* Viewport Header Controls Bar */}
            <div className="bg-[#050B1A]/85 backdrop-blur-md px-4 py-3 border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                <span className="font-bold text-[#F8FAFC] truncate max-w-45 sm:max-w-none">
                  {selectedTarget.name}
                </span>
                <span className="text-[#1E293B]">|</span>
                <span className="text-[#38BDF8] font-semibold">{selectedBand.wavelength.toFixed(1)} μm</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border hidden sm:inline ${
                  selectedTarget.dataStatus === 'Real Archival Data'
                    ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30'
                    : selectedTarget.dataStatus === 'Synthetic Mission Demonstration'
                    ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30'
                    : 'bg-[#F5C451]/10 text-[#F5C451] border-[#F5C451]/30'
                }`}>
                  {selectedTarget.dataStatus}
                </span>
              </div>

              {/* Viewport Action Controls: Zoom, Sync & Reset */}
              <div className="flex items-center gap-1.5 ml-auto">
                {viewMode === 'side-by-side' && (
                  <button
                    onClick={() => setSyncZoomPan(prev => !prev)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-mono transition-colors ${
                      syncZoomPan
                        ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-[#38BDF8]'
                        : 'bg-[#0E1B38] border-[#1E293B] text-[#A7B4CC] hover:text-[#F8FAFC]'
                    }`}
                    title={syncZoomPan ? 'Synchronized zoom & pan active' : 'Independent zoom & pan'}
                  >
                    {syncZoomPan ? <Link2 className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
                    <span>{syncZoomPan ? 'Sync' : 'Split'}</span>
                  </button>
                )}

                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#F8FAFC] hover:bg-[#38BDF8] hover:text-[#050B1A] border border-[#1E293B] transition-colors"
                  title="Zoom in (+)"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] px-2 py-1 rounded bg-[#050B1A] text-[#A7B4CC] border border-[#1E293B]">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#F8FAFC] hover:bg-[#38BDF8] hover:text-[#050B1A] border border-[#1E293B] transition-colors"
                  title="Zoom out (-)"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] transition-colors ml-1"
                  title="Reset zoom and position (0 key)"
                  aria-label="Reset zoom and position"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas / Image Display Viewport Area */}
            <div
              ref={viewerContainerRef}
              tabIndex={0}
              role="region"
              aria-label="Interactive astronomical image viewer. Use arrow keys to pan, plus and minus keys to zoom, zero to reset."
              onKeyDown={handleViewerKeyDown}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative h-95 sm:h-120 bg-[#050B1A] overflow-hidden select-none focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/40 ${
                isDraggingPan ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {/* Stars Background texture */}
              <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none" />

              {/* Loading State Spinner */}
              {isLoading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#050B1A]/70 backdrop-blur-xs text-[#38BDF8] space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-mono tracking-wider uppercase">
                    Processing Astronomical Dataset...
                  </span>
                </div>
              )}

              {/* Error State Fallback */}
              {loadError && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#050B1A]/95 p-6 text-center space-y-4">
                  <AlertTriangle className="w-10 h-10 text-[#F5C451]" />
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-[#F8FAFC]">Dataset Unavailable</h4>
                    <p className="text-xs text-[#A7B4CC] max-w-sm">{loadError}</p>
                  </div>
                  <button
                    onClick={() => {
                      setLoadError(null);
                      setSelectedTarget({ ...selectedTarget });
                    }}
                    className="px-4 py-2 rounded-xl bg-[#38BDF8] text-[#050B1A] font-bold text-xs flex items-center gap-1.5 hover:bg-[#0284C7] transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Loading</span>
                  </button>
                </div>
              )}

              {/* 1. SINGLE VIEW MODE */}
              {viewMode === 'single' && (
                <div 
                  className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <canvas
                    ref={processedCanvasRef}
                    className="max-w-none w-175 sm:w-200 h-auto rounded-lg shadow-xl"
                  />
                </div>
              )}

              {/* 2. SPLIT SLIDER VIEW MODE */}
              {viewMode === 'split-slider' && (
                <div 
                  className="relative w-full h-full flex items-center justify-center overflow-hidden"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center'
                  }}
                >
                  {/* Underneath Layer: Optical Visible Image */}
                  <img
                    src={selectedTarget.opticalImage}
                    alt={`${selectedTarget.name} Optical`}
                    className="max-w-none w-175 sm:w-200 h-auto pointer-events-none absolute"
                  />

                  {/* Overneath Layer: Processed Scientific Infrared Canvas (Clipped by sliderPosition) */}
                  <div
                    className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none"
                    style={{
                      clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                    }}
                  >
                    <canvas
                      ref={processedCanvasRef}
                      className="max-w-none w-175 sm:w-200 h-auto"
                    />
                  </div>

                  {/* Draggable Divider Line & Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#F5C451] shadow-2xl z-20 cursor-ew-resize select-none touch-none"
                    style={{ left: `${sliderPosition}%` }}
                    onMouseDown={handleSliderDragStart}
                    onTouchStart={handleSliderTouchStart}
                  >
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F5C451] text-[#050B1A] flex items-center justify-center shadow-lg border-2 border-[#050B1A] hover:scale-110 active:scale-95 transition-transform cursor-ew-resize"
                      title="Drag to compare Optical vs. Infrared"
                    >
                      <SplitSquareVertical className="w-4 h-4 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SIDE BY SIDE VIEW MODE */}
              {viewMode === 'side-by-side' && (
                <div 
                  className="w-full h-full flex items-center justify-center gap-4 px-4 overflow-hidden"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center'
                  }}
                >
                  {/* Viewport A: Primary target */}
                  <div className="flex-1 relative rounded-lg overflow-hidden border border-[#1E293B] bg-[#0B1630]/60">
                    <canvas
                      ref={processedCanvasRef}
                      className="w-full h-auto"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#050B1A]/90 text-[10px] font-mono text-[#38BDF8] border border-[#38BDF8]/30">
                      Target A: {selectedTarget.name} ({selectedBand.wavelength.toFixed(1)} μm)
                    </div>
                  </div>

                  {/* Viewport B: Comparison target */}
                  <div 
                    className="flex-1 relative rounded-lg overflow-hidden border border-[#8B5CF6]/40 bg-[#0B1630]/60"
                    style={!syncZoomPan ? {
                      transform: `translate(${comparePan.x}px, ${comparePan.y}px) scale(${compareZoom})`
                    } : undefined}
                  >
                    <canvas
                      ref={compareCanvasRef}
                      className="w-full h-auto"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#050B1A]/90 text-[10px] font-mono text-[#8B5CF6] border border-[#8B5CF6]/30">
                      Target B: {compareTarget.name} ({compareBand.wavelength.toFixed(1)} μm)
                    </div>
                  </div>
                </div>
              )}

              {/* Overlay labels & bottom interactive slider bar for split-slider */}
              {viewMode === 'split-slider' && (
                <>
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="px-2.5 py-1 rounded bg-[#050B1A]/85 border border-[#38BDF8]/40 text-[#38BDF8] text-[11px] font-mono font-semibold">
                      ◄ Infrared ({selectedBand.wavelength.toFixed(1)} μm)
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <span className="px-2.5 py-1 rounded bg-[#050B1A]/85 border border-[#1E293B] text-[#A7B4CC] text-[11px] font-mono">
                      Visible Optical ►
                    </span>
                  </div>

                  {/* Interactive Split Slider Bar */}
                  <div className="absolute bottom-3 inset-x-8 z-30 bg-[#050B1A]/85 backdrop-blur-md px-4 py-2 rounded-xl border border-[#1E293B] flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold">Infrared</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="w-full accent-[#F5C451] cursor-ew-resize h-1.5 rounded-lg bg-[#1E293B]"
                      aria-label="Split Comparison Slider Position"
                    />
                    <span className="text-[10px] font-mono text-[#A7B4CC] uppercase font-bold">Optical</span>
                  </div>
                </>
              )}

              {/* Side-by-side Target B selector overlay */}
              {viewMode === 'side-by-side' && (
                <div className="absolute top-3 right-3 z-20 bg-[#050B1A]/90 backdrop-blur-md border border-[#1E293B] rounded-xl p-2.5 text-xs space-y-1.5 shadow-xl">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-[#8B5CF6] font-bold uppercase">
                      Compare Image B:
                    </span>
                    <button
                      onClick={handleResetComparison}
                      className="text-[10px] text-[#A7B4CC] hover:text-[#F8FAFC] underline"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <select
                      value={compareTarget.id}
                      onChange={(e) => {
                        const found = CELESTIAL_TARGETS.find(t => t.id === e.target.value);
                        if (found) setCompareTarget(found);
                      }}
                      className="bg-[#0B1630] text-[#F8FAFC] text-xs font-mono rounded-lg px-2 py-1 border border-[#1E293B] focus:border-[#8B5CF6] focus:outline-none"
                    >
                      {CELESTIAL_TARGETS.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={compareBand.id}
                      onChange={(e) => {
                        const found = SPHEREX_BANDS.find(b => b.id === e.target.value);
                        if (found) setCompareBand(found);
                      }}
                      className="bg-[#0B1630] text-[#8B5CF6] text-xs font-mono rounded-lg px-2 py-1 border border-[#1E293B] focus:border-[#8B5CF6] focus:outline-none"
                    >
                      {SPHEREX_BANDS.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.wavelength.toFixed(1)} μm ({b.name.split('—')[0].trim()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Drag to Pan Hint */}
              <div className="absolute bottom-3 left-3 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 text-[10px] text-[#A7B4CC]/70 bg-[#050B1A]/60 px-2 py-0.5 rounded">
                <Move className="w-3 h-3" />
                <span>Drag to pan when zoomed</span>
              </div>
            </div>
          </div>

          {/* 3. WAVELENGTH SELECTOR (1.0, 1.5, 2.0, 3.0, 4.0, 4.5 µm) */}
          <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                <span>SPHEREx Wavelength Bands (0.75 – 5.0 μm)</span>
              </span>
              <span className="text-[11px] font-mono text-[#38BDF8]">
                Active Channel: {selectedBand.wavelength.toFixed(1)} μm ({selectedBand.range})
              </span>
            </div>

            {/* Wavelength explanation */}
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              <strong>What is wavelength?</strong> Wavelength is the distance between peaks of an electromagnetic wave. While human eyes only perceive short visible waves (0.4–0.7 μm), SPHEREx observes across 102 individual spectral channels from 0.75 to 5.0 μm using 6 Linear Variable Filter arrays.
            </p>

            {/* The 6 key wavelength selector buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
              {SPHEREX_BANDS.map(band => {
                const isSelected = selectedBand.id === band.id;
                return (
                  <button
                    key={band.id}
                    onClick={() => setSelectedBand(band)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#050B1A] border-[#38BDF8] shadow-md shadow-[#38BDF8]/10 ring-1 ring-[#38BDF8]/50'
                        : 'bg-[#050B1A]/40 border-[#1E293B] hover:border-[#38BDF8]/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: band.colorHex }}
                      />
                      <span className="text-xs font-mono font-bold text-[#F8FAFC]">
                        {band.wavelength.toFixed(1)} μm
                      </span>
                    </div>
                    <div className="text-[10px] text-[#A7B4CC] truncate mt-1">
                      {band.name.split('—')[1]?.trim() || band.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT / BOTTOM: CONTROLS & OBSERVATION INFO PANELS (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 4. COLOUR PALETTES, BRIGHTNESS, CONTRAST & STRETCH CONTROLS */}
          <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] font-mono flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Image Display Controls</span>
              </span>
              <span className="text-[10px] font-mono text-[#A7B4CC]">Real-time Transform</span>
            </div>

            {/* Colour Palette Selection (Grayscale, Inferno, Viridis, Magma, Plasma) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A7B4CC] font-mono">Scientific Colour Palette:</span>
                <span className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold">{palette}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {(['grayscale', 'inferno', 'viridis', 'magma', 'plasma'] as ColorPalette[]).map(p => {
                  const isSelected = palette === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPalette(p)}
                      className={`py-2 px-1 rounded-lg text-[11px] font-mono capitalize text-center border transition-all ${
                        isSelected
                          ? 'bg-[#38BDF8] text-[#050B1A] font-bold border-[#38BDF8]'
                          : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border-[#1E293B]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#A7B4CC] pt-1 leading-snug">
                These false-colour palettes map invisible infrared intensities to colors for scientific contrast, not human eye vision.
              </p>
            </div>

            {/* Display Stretch Options (Linear, Logarithmic, Square Root, Asinh) */}
            <div className="space-y-2 pt-2 border-t border-[#1E293B]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A7B4CC] font-mono">Display Stretch:</span>
                <span className="text-[10px] font-mono text-[#8B5CF6] uppercase font-bold">{stretch}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['linear', 'logarithmic', 'sqrt', 'asinh'] as StretchFunction[]).map(s => {
                  const isSelected = stretch === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStretch(s)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-mono capitalize text-center border transition-all ${
                        isSelected
                          ? 'bg-[#8B5CF6] text-[#FFFFFF] font-bold border-[#8B5CF6]'
                          : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border-[#1E293B]'
                      }`}
                    >
                      {s === 'sqrt' ? 'Sq. Root' : s}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#A7B4CC]/80">
                Mathematical flux scaling for faint nebular features vs bright stars.
              </p>
            </div>

            {/* Brightness Adjustment Slider */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
              <div className="flex justify-between text-xs">
                <span className="text-[#A7B4CC] flex items-center gap-1.5 font-mono">
                  <Sun className="w-3.5 h-3.5 text-[#F5C451]" />
                  <span>Brightness:</span>
                </span>
                <span className="font-mono tabular-nums text-[#F8FAFC]">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-[#38BDF8] h-1.5 rounded-lg bg-[#050B1A] border border-[#1E293B]"
                aria-label="Image Brightness Adjustment Slider"
              />
            </div>

            {/* Contrast Adjustment Slider */}
            <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
              <div className="flex justify-between text-xs">
                <span className="text-[#A7B4CC] flex items-center gap-1.5 font-mono">
                  <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Contrast:</span>
                </span>
                <span className="font-mono tabular-nums text-[#F8FAFC]">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-[#38BDF8] h-1.5 rounded-lg bg-[#050B1A] border border-[#1E293B]"
                aria-label="Image Contrast Adjustment Slider"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setStretch('linear');
                  setPalette('viridis');
                }}
                className="text-[11px] text-[#A7B4CC] hover:text-[#38BDF8] font-mono flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset display controls</span>
              </button>
            </div>
          </div>

          {/* 5. OBSERVATION INFORMATION & METADATA PANEL */}
          <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] font-mono flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Observation Metadata</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                {selectedTarget.catalogId}
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Product / Target:</span>
                <span className="font-semibold text-[#F8FAFC] text-right truncate max-w-45">
                  {selectedTarget.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Telescope / Mission:</span>
                <span className="text-[#F8FAFC] text-right truncate max-w-45">
                  {selectedTarget.telescope}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Calibration Status:</span>
                <span className="text-[#38BDF8] text-right truncate max-w-47.5">
                  {selectedTarget.calibrationStatus || 'Calibrated Scientific Data'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Data Status:</span>
                <span className={`font-bold ${
                  selectedTarget.dataStatus === 'Real Archival Data' 
                    ? 'text-[#38BDF8]' 
                    : selectedTarget.dataStatus === 'Illustrative Astronomical Model'
                    ? 'text-[#F5C451]'
                    : 'text-[#8B5CF6]'
                }`}>
                  {selectedTarget.dataStatus}
                </span>
              </div>
              {selectedTarget.coordinates && (
                <div className="flex justify-between">
                  <span className="text-[#A7B4CC]">Coordinates (J2000):</span>
                  <span className="text-[#F8FAFC]">
                    {selectedTarget.coordinates.ra}, {selectedTarget.coordinates.dec}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Wavelength Channel:</span>
                <span className="text-[#38BDF8] font-bold">{selectedBand.wavelength.toFixed(1)} μm ({selectedBand.range})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Observation Date:</span>
                <span className="text-[#F8FAFC]">{selectedTarget.observationDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Instrument Details:</span>
                <span className="text-[#F8FAFC] text-right truncate max-w-45">
                  {selectedTarget.instrumentDetails}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A7B4CC] leading-relaxed pt-2 border-t border-[#1E293B]">
              {selectedTarget.description}
            </p>

            {/* Archive link */}
            {selectedTarget.archiveUrl && (
              <div className="pt-2 border-t border-[#1E293B]">
                <a
                  href={selectedTarget.archiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#38BDF8] hover:text-[#F5C451] transition-colors"
                >
                  <span>Access official archive repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Secondary comparison metadata card if in side-by-side mode */}
          {viewMode === 'side-by-side' && (
            <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#8B5CF6]/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] font-mono flex items-center gap-1.5">
                  <Columns className="w-3.5 h-3.5" />
                  <span>Comparison Target B Metadata</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30">
                  {compareTarget.catalogId}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#A7B4CC]">Target Name:</span>
                  <span className="font-semibold text-[#F8FAFC]">{compareTarget.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7B4CC]">Wavelength:</span>
                  <span className="text-[#8B5CF6] font-bold">{compareBand.wavelength.toFixed(1)} μm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A7B4CC]">Data Status:</span>
                  <span className="text-[#8B5CF6]">{compareTarget.dataStatus}</span>
                </div>
                {compareTarget.coordinates && (
                  <div className="flex justify-between">
                    <span className="text-[#A7B4CC]">Coordinates:</span>
                    <span className="text-[#F8FAFC]">{compareTarget.coordinates.ra}, {compareTarget.coordinates.dec}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#A7B4CC]">Observation Date:</span>
                  <span className="text-[#F8FAFC]">{compareTarget.observationDate}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs space-y-1">
                <span className="text-[10px] font-mono text-[#8B5CF6] font-bold block">
                  Chemical / Physical Tracer:
                </span>
                <p className="text-[#F8FAFC] text-[11px]">{compareBand.chemicalTracer}</p>
                {compareBandData.features && compareBandData.features.length > 0 && (
                  <div className="pt-1 text-[10px] text-[#A7B4CC]">
                    <span className="font-semibold text-[#8B5CF6]">Observed: </span>
                    {compareBandData.features.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactive Infrared Spectral Curve & Molecular Features Plot */}
          {selectedTarget.spectralProfile && (
            <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#38BDF8]/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Spectral Profile (0.75 – 5.0 μm)</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  selectedTarget.spectralProfile.spectrumType === 'Archival Reference Spectroscopy'
                    ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30'
                    : selectedTarget.spectralProfile.spectrumType === 'Theoretical Radiative Model'
                    ? 'bg-[#F5C451]/10 text-[#F5C451] border-[#F5C451]/30'
                    : 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30'
                }`}>
                  {selectedTarget.spectralProfile.spectrumType}
                </span>
              </div>

              {/* Responsive SVG Spectral Chart */}
              <div className="bg-[#050B1A] p-3 rounded-xl border border-[#1E293B] space-y-2">
                <div className="h-36 w-full relative">
                  <svg viewBox="0 0 320 120" className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="30" y1="20" x2="310" y2="20" stroke="#1E293B" strokeDasharray="3 3" />
                    <line x1="30" y1="60" x2="310" y2="60" stroke="#1E293B" strokeDasharray="3 3" />
                    <line x1="30" y1="100" x2="310" y2="100" stroke="#1E293B" />
                    <line x1="30" y1="10" x2="30" y2="100" stroke="#1E293B" />

                    {/* Y-axis labels */}
                    <text x="5" y="24" fill="#A7B4CC" fontSize="8" fontFamily="monospace">1.2</text>
                    <text x="5" y="64" fill="#A7B4CC" fontSize="8" fontFamily="monospace">0.8</text>
                    <text x="5" y="104" fill="#A7B4CC" fontSize="8" fontFamily="monospace">0.4</text>

                    {/* Spectral Curve Path */}
                    {(() => {
                      const pts = selectedTarget.spectralProfile.points;
                      const minW = 0.75;
                      const maxW = 5.0;
                      const minF = 0.2;
                      const maxF = 1.3;
                      const getX = (w: number) => 30 + ((w - minW) / (maxW - minW)) * 280;
                      const getY = (f: number) => 100 - ((f - minF) / (maxF - minF)) * 90;

                      const pathD = pts.reduce((acc, p, idx) => {
                        return `${acc} ${idx === 0 ? 'M' : 'L'} ${getX(p.wavelength).toFixed(1)} ${getY(p.relativeFlux).toFixed(1)}`;
                      }, '');

                      // Active band marker X
                      const activeX = getX(selectedBand.wavelength);
                      // 3.05 water ice line X
                      const iceX = getX(3.05);

                      return (
                        <>
                          {/* 3.05 µm water ice absorption region highlight */}
                          <rect x={getX(2.95)} y="10" width={getX(3.15) - getX(2.95)} height="90" fill="rgba(192, 132, 252, 0.12)" />
                          <line x1={iceX} y1="10" x2={iceX} y2="100" stroke="#C084FC" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />

                          {/* Spectral line */}
                          <path d={pathD} fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

                          {/* Data points */}
                          {pts.map((p, idx) => (
                            <circle
                              key={idx}
                              cx={getX(p.wavelength)}
                              cy={getY(p.relativeFlux)}
                              r="2.5"
                              fill="#38BDF8"
                            />
                          ))}

                          {/* Active band vertical indicator */}
                          <line x1={activeX} y1="10" x2={activeX} y2="100" stroke="#F5C451" strokeWidth="2" />
                          <circle cx={activeX} cy="10" r="3.5" fill="#F5C451" />
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-[10px] font-mono text-[#A7B4CC] px-2 pt-1">
                  <span>0.75 μm</span>
                  <span className="text-[#C084FC] font-semibold">3.05 μm (H₂O Ice)</span>
                  <span className="text-[#FB7185]">4.27 μm (CO₂)</span>
                  <span>5.0 μm</span>
                </div>
              </div>

              {/* Spectral provenance and context note */}
              <div className="text-[11px] font-mono text-[#A7B4CC] space-y-1">
                <div className="flex justify-between">
                  <span>Reference Source:</span>
                  <span className="text-[#F8FAFC] truncate max-w-44">{selectedTarget.spectralProfile.provenance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Probe Channel:</span>
                  <span className="text-[#F5C451] font-bold">{selectedBand.wavelength.toFixed(1)} μm ({selectedBand.name.split('—')[1]?.trim() || selectedBand.name})</span>
                </div>
                <p className="text-[10px] text-[#A7B4CC]/80 pt-1 leading-snug">
                  Notice: Plotted curve uses documented infrared reference spectroscopy & physical models matched to SPHEREx's 102 LVF channels. Calibrated in-flight all-sky survey data cubes will be released via IRSA post-commissioning.
                </p>
              </div>
            </div>
          )}

          {/* Active Band Chemical Diagnostics */}
          <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#8B5CF6]/30 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-[#8B5CF6]">
              <Droplet className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                {selectedBand.name}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#050B1A] border border-[#1E293B] text-xs space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#8B5CF6] font-bold block">
                Chemical / Physical Tracer:
              </span>
              <p className="text-[#F8FAFC]">{selectedBand.chemicalTracer}</p>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#A7B4CC] font-bold block">
                Observed Target Features:
              </span>
              <ul className="space-y-1 text-[#F8FAFC]">
                {currentBandData.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#38BDF8]">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Scientific Honesty Notice */}
          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#F5C451]/30 flex items-start gap-3 text-xs text-[#A7B4CC]">
            <ShieldAlert className="w-5 h-5 text-[#F5C451] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#F8FAFC] block">Scientific Transparency & Archival Analogs</span>
              <p className="text-[11px] leading-relaxed">
                Display stretch functions and false-color palettes are mathematical transformations applied to image pixels. For verified FITS data, these map directly to physical calibrated flux densities (MJy/sr). Current multi-wavelength previews utilize verified archival analogs (Spitzer IRAC, WISE, JWST NIRCam) mapped to SPHEREx's 102 LVF channels; full all-sky spectroscopic data cubes will be released via NASA/IPAC IRSA following orbital commissioning.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. EDUCATIONAL EXPLANATION SECTION */}
      <div className="rounded-2xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#F8FAFC]">
              Understanding Infrared Astronomy & SPHEREx
            </h2>
            <p className="text-xs text-[#A7B4CC] mt-0.5">
              Fundamental principles of multi-wavelength space science, false-color imaging, and molecular spectroscopy.
            </p>
          </div>
        </div>

        {/* Verbatim introductory quotation */}
        <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#38BDF8]/30 text-sm text-[#F8FAFC] leading-relaxed font-medium">
          "Infrared light is a type of light that our eyes cannot normally see. By observing infrared light, scientists can study cool objects, dust-covered regions, stars, and distant galaxies."
        </div>

        {/* 5 Educational Deep Dive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: What is infrared light? */}
          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              What is infrared light?
            </h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Infrared light sits just beyond the red end of visible light. Because its wavelengths (0.75 to 5.0 µm for SPHEREx) are larger than interstellar dust grains, infrared waves pass straight through dust without scattering, illuminating hidden stellar nurseries.
            </p>
          </div>

          {/* Card 2: Why study different wavelengths? */}
          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              Why study different wavelengths?
            </h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Every celestial temperature and chemical element radiates at distinct frequencies. While visible light reveals hot star surfaces (5,000–10,000 K), infrared light exposes cool dust clouds (10–100 K) and the earliest stars whose light was stretched by cosmic expansion.
            </p>
          </div>

          {/* Card 3: How does SPHEREx map the sky? */}
          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5C451]/10 text-[#F5C451] flex items-center justify-center">
              <Telescope className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              How does SPHEREx map the sky?
            </h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Instead of taking images through only a few broadband filters, NASA’s SPHEREx telescope maps the entire celestial sphere in 102 individual infrared colors every six months. This creates a 3D spectral map of over 450 million galaxies and millions of Milky Way stars.
            </p>
          </div>

          {/* Card 4: Why false-color palettes? */}
          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              Why use false-color palettes?
            </h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Because human eyes have no photoreceptors for infrared radiation, raw telescope data consists of numerical energy counts. Colormaps (like Viridis and Inferno) translate these invisible flux counts into visible contrast so researchers can identify physical structures.
            </p>
          </div>

          {/* Card 5: Why water ice absorbs at 3.05 µm? */}
          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#C084FC]/10 text-[#C084FC] flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              Why does water ice absorb at 3.05 μm?
            </h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Solid H₂O ice molecules vibrate at resonant natural frequencies. When infrared photons of wavelength 3.05 µm pass through icy interstellar dust grains, the oxygen-hydrogen (O–H) chemical bonds stretch and absorb the photons, creating a telltale absorption dip in the spectrum.
            </p>
          </div>

          {/* Card 6: What is a snow line? */}
          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#60A5FA]/10 text-[#60A5FA] flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              What is a protoplanetary snow line?
            </h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              In a young star system, the snow line is the critical orbital radius where gas cools enough for volatile compounds like water, carbon dioxide, or methane to condense into solid ice pebbles, enabling the rapid formation of gas giants and water-rich terrestrial worlds.
            </p>
          </div>
        </div>

        {/* 7. BEGINNER-FRIENDLY SCIENTIFIC GLOSSARY */}
        <div className="pt-6 border-t border-[#1E293B] space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#F5C451]" />
            <h3 className="text-lg font-bold text-[#F8FAFC]">
              Beginner-Friendly Astronomy Glossary
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
              <span className="text-[#38BDF8] font-bold block">Infrared (IR)</span>
              <p className="text-[#A7B4CC] font-sans text-[11px]">
                Electromagnetic radiation with wavelengths between 0.75 µm and 1,000 µm, longer than red visible light and shorter than microwaves.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
              <span className="text-[#38BDF8] font-bold block">Wavelength & Micrometer</span>
              <p className="text-[#A7B4CC] font-sans text-[11px]">
                A micrometer (µm) is one millionth of a meter. Visible light spans 0.4 to 0.7 µm; SPHEREx covers 0.75 to 5.0 µm.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
              <span className="text-[#8B5CF6] font-bold block">False-Color Imaging</span>
              <p className="text-[#A7B4CC] font-sans text-[11px]">
                Assigning visible colors (red, green, blue) to invisible wavelengths or flux levels to highlight physical differences.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
              <span className="text-[#8B5CF6] font-bold block">Spectroscopy & Datacubes</span>
              <p className="text-[#A7B4CC] font-sans text-[11px]">
                Splitting light into distinct colors to produce a 3D dataset where each sky pixel contains a complete spectral curve.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
              <span className="text-[#F5C451] font-bold block">Linear Variable Filter (LVF)</span>
              <p className="text-[#A7B4CC] font-sans text-[11px]">
                An optical filter whose transmitted wavelength changes continuously along its physical length, allowing SPHEREx to obtain spectra without complex moving parts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
              <span className="text-[#F5C451] font-bold block">Protoplanetary Disk</span>
              <p className="text-[#A7B4CC] font-sans text-[11px]">
                A rotating flattened circumstellar disk of gas and dust around a newly formed protostar from which planets, asteroids, and comets coalesce.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
              <span className="text-[#C084FC] font-bold block">Cosmic Infrared Background (CIB)</span>
              <p className="text-[#A7B4CC] font-sans text-[11px]">
                The collective diffuse infrared radiation emitted by all unresolved galaxies and primordial stars formed throughout cosmic history.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1">
              <span className="text-[#C084FC] font-bold block">Cosmological Redshift (z)</span>
              <p className="text-[#A7B4CC] font-sans text-[11px]">
                The stretching of light wavelengths to longer (redder) frequencies due to the expansion of space as photons travel across billions of light-years.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
