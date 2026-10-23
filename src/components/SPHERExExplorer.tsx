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
  Activity
} from 'lucide-react';

export const SPHERExExplorer: FC = () => {
  // Target & Band Selection
  const [selectedTarget, setSelectedTarget] = useState<CelestialTarget>(CELESTIAL_TARGETS[0]);
  const [selectedBand, setSelectedBand] = useState<InfraredBand>(SPHEREX_BANDS[3]); // Default: 3.0 µm Water Ice

  // Image Manipulation State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState<number>(100); // 100% is normal
  const [palette, setPalette] = useState<ColorPalette>('viridis');
  const [stretch, setStretch] = useState<StretchFunction>('linear');

  // Comparison Mode: 'split-slider' | 'side-by-side' | 'single'
  const [viewMode, setViewMode] = useState<'split-slider' | 'side-by-side' | 'single'>('split-slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%

  // Secondary target selection for comparison
  const [compareTarget, setCompareTarget] = useState<CelestialTarget>(CELESTIAL_TARGETS[1]);

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
    setPalette('viridis');
    setStretch('linear');
    setSliderPosition(50);
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

  // Real Canvas Image Processing Effect
  // Applies mathematical stretch (Linear, Sqrt, Log, Asinh) and scientific colormaps (Grayscale, Inferno, Viridis, Magma, Plasma)
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

      // Draw original image to offscreen canvas to obtain raw pixel data
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const rawImageData = ctx.getImageData(0, 0, width, height);
        const processedImageData = ctx.createImageData(width, height);

        // Apply mathematical stretch and scientific palette transformation
        processImageData(rawImageData, processedImageData, palette, stretch, brightness);

        ctx.putImageData(processedImageData, 0, 0);
        setIsLoading(false);
      } catch (err) {
        console.warn('Canvas image processing fallback:', err);
        // Fallback: draw unmodified if cross-origin security blocks getImageData
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
  }, [selectedTarget, selectedBand, palette, stretch, brightness]);

  // Secondary canvas processing for side-by-side mode
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
        processImageData(raw, processed, palette, stretch, brightness);
        ctx.putImageData(processed, 0, 0);
      } catch {
        ctx.drawImage(img, 0, 0, width, height);
      }
    };
  }, [compareTarget, palette, stretch, brightness, viewMode]);

  // Active band chemistry details for current target
  const currentBandData = selectedTarget.bandsData[selectedBand.id] || {
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
              <span>NASA SPHEREx Mission Surveyor</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight">
              SPHEREx Explorer
            </h1>
            <p className="text-base sm:text-lg text-[#F5C451] font-medium mt-1">
              Explore the universe through infrared light.
            </p>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B1630] border border-[#1E293B] shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('split-slider')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'split-slider'
                  ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow'
                  : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
              }`}
              title="Split comparison slider"
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
              title="Side-by-side comparison"
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
              title="Full single infrared viewer"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Single View</span>
            </button>
          </div>
        </div>

        {/* Short Introduction Explaining Infrared Astronomy in Simple Language */}
        <p className="text-sm text-[#A7B4CC] leading-relaxed max-w-3xl">
          Infrared light is a form of light that human eyes cannot normally see. While visible light is blocked by thick cosmic dust, infrared light passes straight through dust clouds to reveal newborn stars, distant galaxies, and frozen chemical compounds like water ice.
        </p>
      </div>

      {/* Target Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#A7B4CC] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Select Astronomical Target:</span>
          </span>
          <span className="text-[11px] font-mono text-[#38BDF8]">
            {CELESTIAL_TARGETS.length} datasets available
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
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#050B1A] text-[#A7B4CC]">
                    {target.dataStatus === 'Real Archival Data' ? 'Real' : 'Demo'}
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
                <span className="font-bold text-[#F8FAFC] truncate max-w-[180px] sm:max-w-none">
                  {selectedTarget.name}
                </span>
                <span className="text-[#1E293B]">|</span>
                <span className="text-[#38BDF8] font-semibold">{selectedBand.wavelength.toFixed(1)} μm</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 hidden sm:inline">
                  {selectedTarget.dataStatus}
                </span>
              </div>

              {/* Zoom & Reset Controls */}
              <div className="flex items-center gap-1.5 ml-auto">
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
                  title="Reset zoom and position"
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
              className={`relative h-[380px] sm:h-[480px] bg-[#050B1A] overflow-hidden select-none focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/40 ${
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
                    className="max-w-none w-[700px] sm:w-[800px] h-auto rounded-lg shadow-xl"
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
                    className="max-w-none w-[700px] sm:w-[800px] h-auto pointer-events-none absolute"
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
                      className="max-w-none w-[700px] sm:w-[800px] h-auto"
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
                  {/* Image A: Primary target */}
                  <div className="flex-1 relative rounded-lg overflow-hidden border border-[#1E293B] bg-[#0B1630]/60">
                    <canvas
                      ref={processedCanvasRef}
                      className="w-full h-auto"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#050B1A]/90 text-[10px] font-mono text-[#38BDF8] border border-[#38BDF8]/30">
                      {selectedTarget.name} ({selectedBand.wavelength.toFixed(1)} μm)
                    </div>
                  </div>

                  {/* Image B: Selected comparison target */}
                  <div className="flex-1 relative rounded-lg overflow-hidden border border-[#8B5CF6]/40 bg-[#0B1630]/60">
                    <canvas
                      ref={compareCanvasRef}
                      className="w-full h-auto"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#050B1A]/90 text-[10px] font-mono text-[#8B5CF6] border border-[#8B5CF6]/30">
                      {compareTarget.name}
                    </div>
                  </div>
                </div>
              )}

              {/* Overlay labels & bottom interactive slider bar */}
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
                <div className="absolute top-3 right-3 z-20 bg-[#050B1A]/90 border border-[#1E293B] rounded-lg p-2 text-xs">
                  <label className="text-[10px] font-mono text-[#A7B4CC] block mb-1">
                    Compare Image B:
                  </label>
                  <select
                    value={compareTarget.id}
                    onChange={(e) => {
                      const found = CELESTIAL_TARGETS.find(t => t.id === e.target.value);
                      if (found) setCompareTarget(found);
                    }}
                    className="bg-[#0B1630] text-[#F8FAFC] text-xs font-mono rounded px-2 py-1 border border-[#1E293B] focus:border-[#38BDF8] focus:outline-none"
                  >
                    {CELESTIAL_TARGETS.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
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
                <span>SPHEREx Wavelength Coverage (0.75 – 5.0 μm)</span>
              </span>
              <span className="text-[11px] font-mono text-[#38BDF8]">
                Selected: {selectedBand.wavelength.toFixed(1)} μm
              </span>
            </div>

            {/* Wavelength explanation */}
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              <strong>What is wavelength?</strong> Wavelength is the distance between peaks of light waves. Visible light is short (0.4–0.7 μm), while infrared wavelengths (0.75–5.0 μm) are longer, allowing them to pierce through dust and detect cool molecules.
            </p>

            {/* The 6 requested wavelength selector buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
              {SPHEREX_BANDS.map(band => {
                const isSelected = selectedBand.id === band.id;
                return (
                  <button
                    key={band.id}
                    onClick={() => setSelectedBand(band)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#050B1A] border-[#38BDF8] shadow-md shadow-[#38BDF8]/10'
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
          {/* 4. COLOUR PALETTES & 5. BRIGHTNESS & STRETCH CONTROLS */}
          <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] font-mono flex items-center gap-2">
                <Sliders className="w-4 h-4" />
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
                <span className="font-mono text-[#F8FAFC]">{brightness}%</span>
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
          </div>

          {/* 6. OBSERVATION INFORMATION PANEL */}
          <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] font-mono">
                Observation Information
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                {selectedTarget.catalogId}
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Image Name:</span>
                <span className="font-semibold text-[#F8FAFC] text-right truncate max-w-[180px]">
                  {selectedTarget.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Data Source:</span>
                <span className="text-[#F8FAFC] text-right truncate max-w-[180px]">
                  {selectedTarget.telescope}
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
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Selected Wavelength:</span>
                <span className="text-[#38BDF8] font-bold">{selectedBand.wavelength.toFixed(1)} μm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Display Palette:</span>
                <span className="text-[#F8FAFC] capitalize">{palette}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Brightness Setting:</span>
                <span className="text-[#F8FAFC]">{brightness}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Display Stretch:</span>
                <span className="text-[#F8FAFC] capitalize">{stretch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Observation Date:</span>
                <span className="text-[#F8FAFC]">{selectedTarget.observationDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Instrument Details:</span>
                <span className="text-[#F8FAFC] text-right truncate max-w-[180px]">
                  {selectedTarget.instrumentDetails}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A7B4CC] leading-relaxed pt-2 border-t border-[#1E293B]">
              {selectedTarget.description}
            </p>
          </div>

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
              <span className="font-bold text-[#F8FAFC] block">Scientific Transparency</span>
              <p className="text-[11px] leading-relaxed">
                Display stretch functions and colormaps are mathematical transformations applied to image pixels. For verified FITS data, these map to calibrated flux units.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8. EDUCATIONAL EXPLANATION SECTION */}
      <div className="rounded-3xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#F8FAFC]">
              What is infrared astronomy?
            </h2>
            <p className="text-xs text-[#A7B4CC] mt-0.5">
              Fundamental principles of multi-wavelength space science.
            </p>
          </div>
        </div>

        {/* Required verbatim introduction */}
        <div className="p-4 rounded-2xl bg-[#050B1A] border border-[#38BDF8]/30 text-sm text-[#F8FAFC] leading-relaxed font-medium">
          "Infrared light is a type of light that our eyes cannot normally see. By observing infrared light, scientists can study cool objects, dust-covered regions, stars, and distant galaxies."
        </div>

        {/* The 3 required educational cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Card 1: What is infrared light? */}
          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              What is infrared light?
            </h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Infrared light sits just beyond the red end of the rainbow. Its waves are longer than visible light waves, which means human eyes cannot detect them directly, though we perceive them as heat. In space, cool dust, planets, and cold gas clouds emit their energy primarily in the infrared.
            </p>
          </div>

          {/* Card 2: Why do scientists study different wavelengths? */}
          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              Why do scientists study different wavelengths?
            </h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Every type of light reveals different physical processes. Visible light shows hot stars, while infrared light penetrates dense dust to expose baby stars being born. Different chemicals and ices absorb specific wavelengths, acting like unique chemical barcodes across the universe.
            </p>
          </div>

          {/* Card 3: How does SPHEREx help map the sky? */}
          <div className="p-5 rounded-2xl bg-[#050B1A]/70 border border-[#1E293B] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5C451]/10 text-[#F5C451] flex items-center justify-center">
              <Telescope className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">
              How does SPHEREx help map the sky?
            </h3>
            <p className="text-xs text-[#A7B4CC] leading-relaxed">
              Instead of taking images through only a few colors, NASA’s SPHEREx telescope maps the entire sky in 102 individual infrared colors every six months. This creates a complete 3D spectroscopic map of over 450 million galaxies and tracks the abundance of water ice across our Milky Way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
