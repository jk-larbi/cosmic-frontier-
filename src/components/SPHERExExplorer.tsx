import { useState, useRef, type FC } from 'react';
import { SPHEREX_BANDS, CELESTIAL_TARGETS } from '../data/spherexData';
import type { InfraredBand, CelestialTarget } from '../types';
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
  Move
} from 'lucide-react';

type PaletteMode = 'natural' | 'thermal' | 'cyan-cosmic' | 'gold-violet' | 'monochrome';

export const SPHERExExplorer: FC = () => {
  // Target & band selection
  const [selectedTarget, setSelectedTarget] = useState<CelestialTarget>(CELESTIAL_TARGETS[0]);
  const [selectedBand, setSelectedBand] = useState<InfraredBand>(SPHEREX_BANDS[2]); // Default: Band 3 Water Ice

  // Image manipulation state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState<number>(100); // 100% is normal
  const [contrast, setContrast] = useState<number>(100); // 100% is normal
  const [palette, setPalette] = useState<PaletteMode>('natural');

  // Comparison mode: 'single' | 'split-slider' | 'side-by-side'
  const [viewMode, setViewMode] = useState<'single' | 'split-slider' | 'side-by-side'>('split-slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%

  // Dragging / panning state
  const [isDraggingPan, setIsDraggingPan] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const isSliderDraggingRef = useRef<boolean>(false);

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.7));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setPalette('natural');
    setSliderPosition(50);
  };

  // Pan handlers
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

  // Color Filter CSS generator based on palette
  const getFilterStyle = () => {
    let baseFilter = `brightness(${brightness}%) contrast(${contrast}%)`;
    switch (palette) {
      case 'thermal':
        return `${baseFilter} hue-rotate(180deg) saturate(200%)`;
      case 'cyan-cosmic':
        return `${baseFilter} hue-rotate(90deg) saturate(160%)`;
      case 'gold-violet':
        return `${baseFilter} hue-rotate(270deg) saturate(180%)`;
      case 'monochrome':
        return `${baseFilter} grayscale(100%) invert(10%)`;
      case 'natural':
      default:
        return baseFilter;
    }
  };

  // Band-specific feature details for current target
  const currentBandData = selectedTarget.bandsData[selectedBand.id] || {
    features: ['Infrared continuum spectral baseline'],
    intensityNotes: 'Broad infrared emission within standard sensitivity limit.',
    absorptionSignature: 'Continuous spectral baseline.'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1E293B]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <Telescope className="w-3.5 h-3.5" />
            <span>Spectroscopic Infrared Explorer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">
            SPHEREx Infrared Explorer
          </h1>
          <p className="text-sm sm:text-base text-[#A7B4CC] mt-1 max-w-2xl">
            Inspect celestial targets across 5 representative infrared wavelength bands from NASA's upcoming SPHEREx all-sky spectral survey (0.75 – 5.0 µm).
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B1630] border border-[#1E293B] shrink-0 self-start md:self-auto">
          <button
            onClick={() => setViewMode('split-slider')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'split-slider'
                ? 'bg-[#38BDF8] text-[#050B1A] font-bold shadow'
                : 'text-[#A7B4CC] hover:text-[#F8FAFC]'
            }`}
            title="Split slider comparing Optical vs Infrared"
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
            title="Side by side comparison"
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
            title="Single Infrared view"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Full Infrared</span>
          </button>
        </div>
      </div>

      {/* Target Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#A7B4CC] flex items-center gap-2">
          <span>Choose Celestial Target:</span>
          <span className="text-[11px] text-[#38BDF8] font-normal">({CELESTIAL_TARGETS.length} calibrated models available)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  <span className="text-[10px] text-[#A7B4CC] font-mono">{target.distanceLightYears}</span>
                </div>
                <div className="font-semibold text-xs sm:text-sm text-[#F8FAFC] truncate mt-1">
                  {target.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Viewer + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: 2-column image viewer viewport */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Viewer Card */}
          <div className="relative rounded-2xl bg-[#0B1630] border border-[#1E293B] shadow-2xl overflow-hidden">
            {/* Viewport Top Bar Controls */}
            <div className="bg-[#050B1A]/80 backdrop-blur-md px-4 py-3 border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                <span className="font-bold text-[#F8FAFC] truncate max-w-[200px] sm:max-w-none">
                  {selectedTarget.name}
                </span>
                <span className="text-[#A7B4CC] hidden sm:inline">|</span>
                <span className="text-[#38BDF8] hidden sm:inline">{selectedBand.range}</span>
              </div>

              {/* Zoom & Reset Controls */}
              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#F8FAFC] hover:bg-[#38BDF8] hover:text-[#050B1A] border border-[#1E293B] transition-colors"
                  title="Zoom In (+)"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] px-2 py-1 rounded bg-[#050B1A] text-[#A7B4CC] border border-[#1E293B]">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#F8FAFC] hover:bg-[#38BDF8] hover:text-[#050B1A] border border-[#1E293B] transition-colors"
                  title="Zoom Out (-)"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-[#0E1B38] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B] transition-colors ml-1"
                  title="Reset View"
                  aria-label="Reset View"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Canvas / Image Display Area */}
            <div
              ref={viewerContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative h-[380px] sm:h-[460px] bg-[#050B1A] overflow-hidden select-none ${
                isDraggingPan ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {/* Stars Background texture */}
              <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none" />

              {/* 1. SINGLE VIEW MODE */}
              {viewMode === 'single' && (
                <div 
                  className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <img
                    src={selectedTarget.infraredImage}
                    alt={`${selectedTarget.name} in Infrared`}
                    className="max-w-none w-[600px] sm:w-[700px] h-auto pointer-events-none rounded-lg shadow-lg"
                    style={{ filter: getFilterStyle() }}
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
                  {/* Optical Image (Underneath) */}
                  <img
                    src={selectedTarget.opticalImage}
                    alt={`${selectedTarget.name} Optical`}
                    className="max-w-none w-[600px] sm:w-[700px] h-auto pointer-events-none absolute"
                  />

                  {/* Infrared Image (Clipped by slider position) */}
                  <div
                    className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none"
                    style={{
                      clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                    }}
                  >
                    <img
                      src={selectedTarget.infraredImage}
                      alt={`${selectedTarget.name} Infrared`}
                      className="max-w-none w-[600px] sm:w-[700px] h-auto pointer-events-none"
                      style={{ filter: getFilterStyle() }}
                    />
                  </div>

                  {/* Vertical Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#F5C451] shadow-2xl pointer-events-none z-20"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F5C451] text-[#050B1A] flex items-center justify-center shadow-lg border-2 border-[#050B1A]">
                      <SplitSquareVertical className="w-4 h-4 rotate-90" />
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
                  <div className="flex-1 relative rounded-lg overflow-hidden border border-[#1E293B] bg-[#0B1630]/60">
                    <img
                      src={selectedTarget.opticalImage}
                      alt="Visible Light View"
                      className="w-full h-auto pointer-events-none"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#050B1A]/80 text-[10px] font-mono text-[#A7B4CC]">
                      Visible Optical
                    </div>
                  </div>
                  <div className="flex-1 relative rounded-lg overflow-hidden border border-[#38BDF8]/40 bg-[#0B1630]/60">
                    <img
                      src={selectedTarget.infraredImage}
                      alt="SPHEREx Infrared View"
                      className="w-full h-auto pointer-events-none"
                      style={{ filter: getFilterStyle() }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#050B1A]/80 text-[10px] font-mono text-[#38BDF8]">
                      SPHEREx {selectedBand.range}
                    </div>
                  </div>
                </div>
              )}

              {/* Overlay labels & slider drag bar */}
              {viewMode === 'split-slider' && (
                <>
                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="px-2 py-1 rounded bg-[#050B1A]/80 border border-[#38BDF8]/40 text-[#38BDF8] text-[11px] font-mono font-semibold">
                      ◄ SPHEREx Infrared ({selectedBand.range})
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <span className="px-2 py-1 rounded bg-[#050B1A]/80 border border-[#1E293B] text-[#A7B4CC] text-[11px] font-mono">
                      Visible Optical ►
                    </span>
                  </div>

                  {/* Interactive Split Slider Track at bottom */}
                  <div className="absolute bottom-3 inset-x-8 z-30 bg-[#050B1A]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-[#1E293B] flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[#38BDF8] uppercase">Infrared</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="w-full accent-[#F5C451] cursor-ew-resize h-1.5 rounded-lg bg-[#1E293B]"
                      aria-label="Split Comparison Position"
                    />
                    <span className="text-[10px] font-mono text-[#A7B4CC] uppercase">Optical</span>
                  </div>
                </>
              )}

              {/* Hint badge */}
              <div className="absolute bottom-3 left-3 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 text-[10px] text-[#A7B4CC]/70 bg-[#050B1A]/60 px-2 py-0.5 rounded">
                <Move className="w-3 h-3" />
                <span>Drag to pan image</span>
              </div>
            </div>

            {/* Viewport Bottom Controls: Brightness, Contrast & Color Palettes */}
            <div className="p-4 bg-[#0B1630] border-t border-[#1E293B] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brightness Adjustment */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A7B4CC] flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-[#F5C451]" />
                      <span>Image Brightness:</span>
                    </span>
                    <span className="font-mono text-[#F8FAFC]">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-[#38BDF8] h-1.5 rounded-lg bg-[#050B1A] border border-[#1E293B]"
                    aria-label="Brightness Adjustment"
                  />
                </div>

                {/* Contrast Adjustment */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#A7B4CC] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Spectral Contrast:</span>
                    </span>
                    <span className="font-mono text-[#F8FAFC]">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-[#38BDF8] h-1.5 rounded-lg bg-[#050B1A] border border-[#1E293B]"
                    aria-label="Contrast Adjustment"
                  />
                </div>
              </div>

              {/* False-Color Palettes */}
              <div className="pt-2 border-t border-[#1E293B] flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#A7B4CC] font-mono mr-2">Color Palettes:</span>
                <button
                  onClick={() => setPalette('natural')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                    palette === 'natural'
                      ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/50'
                      : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
                  }`}
                >
                  Natural IR
                </button>
                <button
                  onClick={() => setPalette('thermal')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                    palette === 'thermal'
                      ? 'bg-[#F5C451]/20 text-[#F5C451] border border-[#F5C451]/50'
                      : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
                  }`}
                >
                  Thermal Heat
                </button>
                <button
                  onClick={() => setPalette('cyan-cosmic')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                    palette === 'cyan-cosmic'
                      ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/50'
                      : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
                  }`}
                >
                  Cold Cosmic
                </button>
                <button
                  onClick={() => setPalette('gold-violet')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                    palette === 'gold-violet'
                      ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/50'
                      : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
                  }`}
                >
                  Gold-Violet High-Contrast
                </button>
                <button
                  onClick={() => setPalette('monochrome')}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                    palette === 'monochrome'
                      ? 'bg-[#F8FAFC]/20 text-[#F8FAFC] border border-[#F8FAFC]/50'
                      : 'bg-[#050B1A] text-[#A7B4CC] hover:text-[#F8FAFC] border border-[#1E293B]'
                  }`}
                >
                  Monochrome
                </button>
              </div>
            </div>
          </div>

          {/* SPHEREx Wavelength Bands Selector */}
          <div className="p-5 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                <span>SPHEREx Spectroscopic Bands (0.75 – 5.0 µm)</span>
              </span>
              <span className="text-[11px] font-mono text-[#A7B4CC]">Selected: {selectedBand.wavelength} µm</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
              {SPHEREX_BANDS.map(band => {
                const isSelected = selectedBand.id === band.id;
                return (
                  <button
                    key={band.id}
                    onClick={() => setSelectedBand(band)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#050B1A] border-[#38BDF8] shadow-sm'
                        : 'bg-[#050B1A]/40 border-[#1E293B] hover:border-[#38BDF8]/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: band.colorHex }}
                      />
                      <span className="text-[11px] font-mono font-bold text-[#F8FAFC]">
                        {band.range}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#A7B4CC] truncate mt-1">
                      {band.scientificPurpose.split('&')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Scientific Observation & Band Information Panel */}
        <div className="space-y-6">
          {/* Target Metadata Card */}
          <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#1E293B] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] font-mono">
                Target Observation Info
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                {selectedTarget.catalogId}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Category:</span>
                <span className="font-semibold text-[#F8FAFC]">{selectedTarget.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Constellation:</span>
                <span className="font-mono text-[#F8FAFC]">{selectedTarget.constellation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Distance:</span>
                <span className="font-mono text-[#F8FAFC]">{selectedTarget.distanceLightYears}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Active Band:</span>
                <span className="font-mono text-[#38BDF8] font-bold">{selectedBand.range}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Brightness:</span>
                <span className="font-mono text-[#F8FAFC]">{brightness}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A7B4CC]">Data Status:</span>
                <span className="font-mono text-[#F5C451] text-[11px]">{selectedTarget.dataStatus}</span>
              </div>
            </div>

            <p className="text-xs text-[#A7B4CC] leading-relaxed pt-2 border-t border-[#1E293B]">
              {selectedTarget.description}
            </p>
          </div>

          {/* Active Band Chemistry & Signature Card */}
          <div className="p-6 rounded-2xl bg-[#0B1630] border border-[#8B5CF6]/30 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#8B5CF6]">
              <Droplet className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                Wavelength Diagnostics
              </span>
            </div>

            <h4 className="text-base font-bold text-[#F8FAFC]">
              {selectedBand.name}
            </h4>

            <div className="p-3 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-mono text-[#8B5CF6] font-bold">
                Chemical & Physical Tracer:
              </span>
              <p className="text-[#F8FAFC] font-medium">
                {selectedBand.chemicalTracer}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] uppercase font-mono text-[#A7B4CC] font-bold">
                Target Spectral Signature:
              </span>
              <p className="text-[#A7B4CC] leading-relaxed">
                {currentBandData.absorptionSignature}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-[10px] uppercase font-mono text-[#A7B4CC] font-bold">
                Observed Physical Features:
              </span>
              <ul className="space-y-1 text-[#F8FAFC]">
                {currentBandData.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#38BDF8]">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Scientific Transparency Callout */}
          <div className="p-4 rounded-xl bg-[#050B1A] border border-[#F5C451]/30 flex items-start gap-3 text-xs text-[#A7B4CC]">
            <ShieldAlert className="w-5 h-5 text-[#F5C451] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#F8FAFC] block">Calibrated Model Notice</span>
              <p className="text-[11px] leading-relaxed">
                {selectedTarget.sourceAttribution} Controls operate dynamically on calibrated photometric datasets without inventing fictional telescope measurements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Explanation Section Beneath the Viewer */}
      <div className="rounded-3xl bg-[#0B1630] border border-[#1E293B] p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#F8FAFC]">
              How Infrared Light Unveils the Universe
            </h3>
            <p className="text-xs text-[#A7B4CC]">
              The scientific foundation behind NASA's SPHEREx mission.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#A7B4CC] leading-relaxed">
          <div className="space-y-2 p-4 rounded-xl bg-[#050B1A]/60 border border-[#1E293B]">
            <h4 className="text-sm font-semibold text-[#38BDF8]">1. Piercing Opaque Interstellar Dust</h4>
            <p>
              Interstellar dust grains are roughly 0.1 to 1 micrometer across. Because optical light waves are smaller than the grains, they scatter and get absorbed. Infrared wavelengths (0.75 to 5.0 µm) are larger than the dust grains, allowing them to pass through unhindered. This enables SPHEREx to see newborn stars inside dense molecular clouds.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[#050B1A]/60 border border-[#1E293B]">
            <h4 className="text-sm font-semibold text-[#8B5CF6]">2. Fingerprinting Water & Organic Ices</h4>
            <p>
              Molecules vibrate at distinct resonant frequencies. The chemical bond between oxygen and hydrogen in frozen water (H₂O ice) specifically absorbs light at 3.05 µm, while carbon dioxide (CO₂) absorbs at 4.27 µm. By measuring dips in light at these precise wavelengths, SPHEREx calculates the mass of water available to forming exoplanets.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-[#050B1A]/60 border border-[#1E293B]">
            <h4 className="text-sm font-semibold text-[#F5C451]">3. Redshifted Light from Cosmic Dawn</h4>
            <p>
              Because space is expanding, light emitted as ultraviolet or blue by the very first stars 13.5 billion years ago has had its wavelength stretched by a factor of 8 to 10 into the near-infrared. SPHEREx maps the collective glow of these primordial stars across the whole sky to illuminate the Epoch of Reionization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

