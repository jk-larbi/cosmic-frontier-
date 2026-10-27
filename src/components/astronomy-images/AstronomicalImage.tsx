import { useState, useMemo, type FC } from 'react';
import type { AstronomicalImageRecord } from '../../types';
import { resolveAstronomicalVisual } from '../../services/astronomicalImageService';
import { AstronomicalBadge } from './AstronomicalBadge';
import { ExternalLink, ZoomIn, Image as ImageIcon, ImageOff } from 'lucide-react';

export interface AstronomicalImageProps {
  image?: AstronomicalImageRecord;
  target?: any;
  targetType?: 'exoplanet' | 'planet' | 'star' | 'asteroid' | 'comet' | 'galaxy' | 'nebula' | 'small-body' | 'observation';
  aspectRatio?: '16/9' | '4/3' | 'square' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showBadge?: boolean;
  showCredit?: boolean;
  className?: string;
  onClick?: () => void;
  alt?: string;
  fallbackUrl?: string;
}

export const AstronomicalImage: FC<AstronomicalImageProps> = ({
  image,
  target,
  targetType = 'exoplanet',
  aspectRatio = '16/9',
  size = 'md',
  showBadge = true,
  showCredit = false,
  className = '',
  onClick,
  alt,
  fallbackUrl
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve image record
  const resolvedImage = useMemo<AstronomicalImageRecord>(() => {
    if (image) return image;
    if (target) {
      return resolveAstronomicalVisual(target, targetType);
    }
    // Safe fallback image
    return {
      id: 'fallback-placeholder',
      associatedObjectId: 'unknown',
      imageUrl: 'https://images-assets.nasa.gov/image/PIA19832/PIA19832~small.jpg',
      thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA19832/PIA19832~thumb.jpg',
      title: 'Astronomical Visualization',
      caption: 'Visual representation from NASA archives.',
      sourceOrganization: 'NASA',
      sourceUrl: 'https://images.nasa.gov',
      credit: 'NASA/JPL-Caltech',
      assetClassification: 'scientific-illustration',
      isVerifiedRealObservation: false
    };
  }, [image, target, targetType]);

  // Aspect ratio class mapping
  const aspectClass = 
    aspectRatio === '16/9' ? 'aspect-video' :
    aspectRatio === '4/3' ? 'aspect-4/3' :
    aspectRatio === 'square' ? 'aspect-square' : '';

  // Determine current image source
  const currentSrc = hasError 
    ? (fallbackUrl || resolvedImage.thumbnailUrl || resolvedImage.imageUrl)
    : (resolvedImage.imageUrl || resolvedImage.thumbnailUrl);

  const handleImageError = () => {
    if (!hasError && fallbackUrl && fallbackUrl !== currentSrc) {
      setHasError(true);
    } else {
      setIsLoading(false);
    }
  };

  const sizeClass = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : '';

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-[#050B1A] border border-[#1E293B] group ${aspectClass} ${sizeClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#0B1630] animate-pulse flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-[#1E293B]" />
        </div>
      )}

      {/* Main Image or Honest Unavailable State */}
      {resolvedImage.assetClassification === 'unavailable' || !currentSrc ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#070D1E] border border-dashed border-[#1E293B]">
          <ImageOff className="w-8 h-8 text-slate-500 mb-2 opacity-60" />
          <span className="text-xs font-mono font-semibold text-slate-300">Direct Optical Observation Unavailable</span>
          <span className="text-[10px] text-slate-500 mt-1 max-w-[85%] leading-relaxed font-mono line-clamp-2">
            {resolvedImage.caption || 'No verified high-resolution photograph is currently archived in open data. Astrometric and spectroscopic telemetry preserved.'}
          </span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt || resolvedImage.title || 'Astronomical body visualization'}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            onClick ? 'group-hover:scale-105' : ''
          } ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
      )}

      {/* Scientific Classification Badge */}
      {showBadge && (
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none drop-shadow-md">
          <AstronomicalBadge
            classification={resolvedImage.assetClassification}
            isVerifiedRealObservation={resolvedImage.isVerifiedRealObservation}
          />
        </div>
      )}

      {/* Zoom / Lightbox Indicator on Hover */}
      {onClick && (
        <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#050B1A]/80 backdrop-blur-md p-1.5 rounded-lg border border-[#1E293B] text-white">
          <ZoomIn className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Credit / Caption Bar */}
      {showCredit && resolvedImage.credit && (
        <div className="absolute bottom-0 inset-x-0 z-10 bg-linear-to-t from-[#050B1A]/95 via-[#050B1A]/80 to-transparent p-2.5 text-[10px] font-mono text-[#94A3B8] flex items-center justify-between gap-2">
          <span className="truncate">Credit: {resolvedImage.credit}</span>
          {resolvedImage.sourceUrl && (
            <a
              href={resolvedImage.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#38BDF8] hover:text-[#7DD3FC] shrink-0 inline-flex items-center gap-0.5"
              title="Open source record"
            >
              <span>Source</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

