import type { FC } from 'react';
import type { AstronomicalImageRecord } from '../../types';
import { resolveAstronomicalVisual } from '../../services/astronomicalImageService';
import { AstronomicalBadge } from './AstronomicalBadge';

export interface ComparisonItem {
  id: string;
  name: string;
  radiusLabel?: string;
  radiusRelative?: number;
  scaleValue?: number;
  tempLabel?: string;
  typeLabel?: string;
  image?: AstronomicalImageRecord;
  target?: any;
  type?: any;
  label?: string;
  sublabel?: string;
}

export interface AstronomicalComparisonVisualProps {
  items: ComparisonItem[];
  baselineName?: string;
  className?: string;
}

export const AstronomicalComparisonVisual: FC<AstronomicalComparisonVisualProps> = ({
  items,
  baselineName = 'Earth (1.0 R⊕)',
  className = ''
}) => {
  if (!items || items.length === 0) return null;

  // Find max scaleValue or radiusRelative to scale relatively (bounded between 0.35 and 1.0)
  const maxScale = Math.max(
    ...items.map(i => i.scaleValue || i.radiusRelative || 1.0),
    1.0
  );

  return (
    <div className={`p-5 rounded-2xl bg-[#050B1A] border border-[#1E293B] space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3 text-xs">
        <span className="font-mono text-[#38BDF8] uppercase tracking-wider font-semibold">
          Side-by-Side Visual & Relative Scale Analysis
        </span>
        <span className="text-[11px] font-mono text-[#64748B]">
          Baseline Scale Reference: <span className="text-[#F8FAFC] font-semibold">{baselineName}</span>
        </span>
      </div>

      <div className={`grid grid-cols-1 ${items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4`}>
        {items.map((item, idx) => {
          const name = item.name || item.label || `Object ${idx + 1}`;
          const scaleVal = item.scaleValue || item.radiusRelative || 1.0;
          const sublabel = item.sublabel || item.radiusLabel || `${scaleVal} R⊕`;
          const resolvedImg = item.image || (item.target ? resolveAstronomicalVisual(item.target, item.type || 'exoplanet') : null);

          // Compute relative scale percentage (min 40%, max 100%)
          const scalePct = Math.max(40, Math.min(100, Math.round((scaleVal / maxScale) * 100)));

          return (
            <div
              key={item.id || name}
              className="p-4 rounded-xl bg-[#0B1630] border border-[#1E293B] flex flex-col items-center text-center space-y-3"
            >
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-36">{name}</span>
                {resolvedImg && (
                  <AstronomicalBadge
                    classification={resolvedImg.assetClassification}
                    isVerifiedRealObservation={resolvedImg.isVerifiedRealObservation}
                    showIcon={false}
                  />
                )}
              </div>

              {/* Scaled Visual Viewport */}
              <div className="relative w-full h-40 flex items-center justify-center rounded-lg bg-[#050B1A] border border-[#1E293B]/70 overflow-hidden p-2">
                {resolvedImg ? (
                  <div
                    className="transition-all duration-300 flex items-center justify-center"
                    style={{
                      width: `${scalePct}%`,
                      height: `${scalePct}%`,
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  >
                    <img
                      src={resolvedImg.imageUrl || resolvedImg.thumbnailUrl}
                      alt={resolvedImg.title || name}
                      className="w-full h-full object-contain rounded-full shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-[#64748B] font-mono">No visual data</div>
                )}
              </div>

              {/* Physical Dimension Metrics */}
              <div className="w-full space-y-1 font-mono text-xs pt-1 border-t border-[#1E293B]/60">
                <div className="flex items-center justify-between text-[#A7B4CC]">
                  <span className="text-[10px]">Relative Radius:</span>
                  <span className="text-emerald-400 font-bold tabular-nums">{sublabel}</span>
                </div>
                {item.tempLabel && (
                  <div className="flex items-center justify-between text-[#A7B4CC]">
                    <span className="text-[10px]">Temperature:</span>
                    <span className="text-amber-300 tabular-nums">{item.tempLabel}</span>
                  </div>
                )}
                {item.typeLabel && (
                  <div className="flex items-center justify-between text-[#A7B4CC]">
                    <span className="text-[10px]">Classification:</span>
                    <span className="text-cyan-300 tabular-nums">{item.typeLabel}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
