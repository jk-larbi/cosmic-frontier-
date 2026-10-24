import { useState, useMemo, type FC } from 'react';
import type { AstronomicalImageRecord } from '../../types';
import { resolveAstronomicalGallery } from '../../services/astronomicalImageService';
import { AstronomicalBadge } from './AstronomicalBadge';
import { ExternalLink, Calendar, Telescope, Radio, Sliders, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface AstronomicalImageGalleryProps {
  images?: AstronomicalImageRecord[];
  target?: any;
  targetType?: 'exoplanet' | 'planet' | 'star' | 'asteroid' | 'comet' | 'galaxy' | 'nebula' | 'small-body' | 'observation';
  title?: string;
  className?: string;
}

export const AstronomicalImageGallery: FC<AstronomicalImageGalleryProps> = ({
  images,
  target,
  targetType = 'exoplanet',
  title,
  className = ''
}) => {
  // Resolve image list from either images array or target
  const imageList = useMemo<AstronomicalImageRecord[]>(() => {
    if (images && images.length > 0) return images;
    if (target) {
      const objId = target.id || target.planetName || target.name || target.designation || 'target';
      return resolveAstronomicalGallery(objId, targetType, {
        id: objId,
        name: target.planetName || target.name || target.designation || objId,
        category: targetType,
        radiusEarthRadii: target.radiusEarthRadii,
        radiusKm: target.radiusKm,
        massEarthMasses: target.massEarthMasses,
        temperatureK: target.stellarEffectiveTempK ?? target.effectiveTemperatureK ?? null
      });
    }
    return [];
  }, [images, target, targetType]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeImage = imageList[selectedIndex] || imageList[0];
  const selectedImage = activeImage; // Explicit reference for inspector & testing

  if (!imageList || imageList.length === 0 || !activeImage) {
    return null;
  }

  return (
    <div className={`space-y-4 rounded-2xl bg-[#0B1630] border border-[#1E293B] p-5 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          <Telescope className="w-4 h-4 text-[#38BDF8]" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            {title || 'Astronomical Visual Documentation & Provenance'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#64748B]">
            Asset {selectedIndex + 1} of {imageList.length}
          </span>
          <AstronomicalBadge
            classification={selectedImage.assetClassification}
            isVerifiedRealObservation={selectedImage.isVerifiedRealObservation}
          />
        </div>
      </div>

      {/* Primary Display Viewport */}
      <div className="relative rounded-xl overflow-hidden bg-[#050B1A] border border-[#1E293B] aspect-video sm:aspect-16/9 flex items-center justify-center">
        <img
          src={selectedImage.imageUrl || selectedImage.thumbnailUrl}
          alt={selectedImage.title}
          className="w-full h-full object-cover"
        />

        {/* Floating Classification Tag */}
        <div className="absolute top-3 left-3 z-10 drop-shadow-md">
          <AstronomicalBadge
            classification={selectedImage.assetClassification}
            isVerifiedRealObservation={selectedImage.isVerifiedRealObservation}
          />
        </div>

        {/* Source link badge */}
        {selectedImage.sourceUrl && (
          <a
            href={selectedImage.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#050B1A]/85 backdrop-blur-md border border-[#1E293B] text-[10px] font-mono text-[#38BDF8] hover:text-white transition-colors"
          >
            <span>Original Archive</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Thumbnail Strip (If 2+ images exist) */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {imageList.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border transition-all ${
                  isSelected
                    ? 'border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-md'
                    : 'border-[#1E293B] opacity-70 hover:opacity-100 hover:border-[#64748B]'
                }`}
              >
                <img
                  src={img.thumbnailUrl || img.imageUrl}
                  alt={img.title}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Metadata & Scientific Provenance Breakdown */}
      <div className="p-4 rounded-xl bg-[#050B1A] border border-[#1E293B] space-y-3 text-xs">
        <div>
          <h4 className="font-semibold text-[#F8FAFC] text-sm">{selectedImage.title}</h4>
          <p className="text-[#94A3B8] text-xs leading-relaxed mt-1">{selectedImage.caption}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#1E293B] text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-[#A7B4CC]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span className="text-[#64748B]">Organization:</span>
            <span className="text-white truncate">{selectedImage.sourceOrganization}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#A7B4CC]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[#64748B]">Credit:</span>
            <span className="text-white truncate">{selectedImage.credit}</span>
          </div>

          {selectedImage.instrument && (
            <div className="flex items-center gap-1.5 text-[#A7B4CC]">
              <Telescope className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
              <span className="text-[#64748B]">Instrument:</span>
              <span className="text-white truncate">{selectedImage.instrument}</span>
            </div>
          )}

          {selectedImage.wavelength && (
            <div className="flex items-center gap-1.5 text-[#A7B4CC]">
              <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[#64748B]">Wavelength:</span>
              <span className="text-white truncate">{selectedImage.wavelength}</span>
            </div>
          )}

          {selectedImage.observationDate && (
            <div className="flex items-center gap-1.5 text-[#A7B4CC]">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[#64748B]">Date / Epoch:</span>
              <span className="text-white truncate">{selectedImage.observationDate}</span>
            </div>
          )}

          {selectedImage.processing && (
            <div className="flex items-center gap-1.5 text-[#A7B4CC] sm:col-span-2">
              <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-[#64748B]">Calibration / Method:</span>
              <span className="text-[#CBD5E1] truncate">{selectedImage.processing}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
