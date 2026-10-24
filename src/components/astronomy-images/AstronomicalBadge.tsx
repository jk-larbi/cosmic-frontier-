import type { FC } from 'react';
import type { AstronomicalAssetClassification } from '../../types';
import { Camera, Satellite, Sparkles, Binary, Compass, Info, ImageOff } from 'lucide-react';

interface AstronomicalBadgeProps {
  classification: AstronomicalAssetClassification;
  isVerifiedRealObservation?: boolean;
  className?: string;
  showIcon?: boolean;
}

export const AstronomicalBadge: FC<AstronomicalBadgeProps> = ({
  classification,
  isVerifiedRealObservation = false,
  className = '',
  showIcon = true
}) => {
  // Classification badge configurations
  let label = 'Scientific Model';
  let badgeStyle = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  let Icon = Binary;
  let title = 'Deterministic physical illustration calculated from astronomical parameters. Not an optical photograph.';

  if (isVerifiedRealObservation || classification === 'observation') {
    label = 'Verified Observation';
    badgeStyle = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    Icon = Camera;
    title = 'Genuine astronomical telescope observation.';
  } else if (classification === 'spacecraft') {
    label = 'Spacecraft Photo';
    badgeStyle = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    Icon = Satellite;
    title = 'Authentic photograph captured by in-situ robotic space exploration probe.';
  } else if (classification === 'artist-impression') {
    label = 'Artist Concept';
    badgeStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    Icon = Sparkles;
    title = 'NASA/ESA peer-reviewed artist impression based on measured physical parameters.';
  } else if (classification === 'simulation') {
    label = 'Theoretical Model';
    badgeStyle = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    Icon = Compass;
    title = 'Computer dynamical simulation based on gravitational perturbation models.';
  } else if (classification === 'contextual') {
    label = 'Contextual Visual';
    badgeStyle = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    Icon = Info;
    title = 'Contextual observation of surrounding starfield or parent cluster.';
  } else if (classification === 'unavailable') {
    label = 'No Direct Image';
    badgeStyle = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    Icon = ImageOff;
    title = 'No verified direct telescope photograph is currently archived in open data.';
  } else if (classification === 'category-fallback') {
    label = 'Visual Placeholder';
    badgeStyle = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    Icon = Info;
    title = 'Category visual placeholder.';
  }

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border select-none ${badgeStyle} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{label}</span>
    </span>
  );
};

