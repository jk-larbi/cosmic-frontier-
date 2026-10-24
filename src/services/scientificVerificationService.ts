/**
 * COSMIC FRONTIER — Shared Scientific Verification Service
 * 
 * Reusable verification utilities for:
 * - Astronomical data provenance and archive attribution
 * - Image classification and matching status
 * - Measurements, units, uncertainties, and estimates
 * - Data freshness and retrieval status
 * - Fallback and unavailable data handling
 */

import type { 
  ScientificProvenance, 
  ScientificMeasurement, 
  ImageMatchingStatus, 
  FreshnessStatus,
  AstronomicalImageRecord,
  AstronomicalAssetClassification
} from '../types';

export type { ScientificProvenance, ScientificMeasurement, ImageMatchingStatus, FreshnessStatus };

/**
 * Constructs a type-safe scientific measurement descriptor
 */
export function createScientificMeasurement<T = number>(
  value: T | null | undefined,
  unit: string,
  options: {
    uncertainty?: T | null;
    method?: string;
    isEstimate?: boolean;
    status?: ScientificMeasurement<T>['status'];
    provenance?: Partial<ScientificProvenance>;
  } = {}
): ScientificMeasurement<T> {
  const isEstimated = options.isEstimate ?? (value === null || value === undefined);
  return {
    value: value ?? null,
    unit,
    uncertainty: options.uncertainty ?? null,
    method: options.method,
    isEstimate: isEstimated,
    status: options.status || (value === null || value === undefined ? 'unmeasured' : (isEstimated ? 'estimated' : 'measured')),
    provenance: options.provenance
  };
}

/**
 * Standard data freshness evaluation
 */
export function getDataFreshness(
  timestampMsOrIso: number | string | null | undefined,
  maxAgeMs = 24 * 60 * 60 * 1000
): { status: FreshnessStatus; label: string; color: string; description: string } {
  if (!timestampMsOrIso) {
    return {
      status: 'archival',
      label: 'Standard Reference Archive',
      color: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
      description: 'Peer-reviewed baseline reference data from authoritative astrophysical archives.'
    };
  }

  const timeMs = typeof timestampMsOrIso === 'string' 
    ? new Date(timestampMsOrIso).getTime() 
    : timestampMsOrIso;

  if (isNaN(timeMs)) {
    return {
      status: 'archival',
      label: 'Reference Archive',
      color: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
      description: 'Archival catalogue record.'
    };
  }

  const ageMs = Date.now() - timeMs;

  if (ageMs < 15 * 60 * 1000) {
    return {
      status: 'live',
      label: 'Live Ephemeris / Telemetry',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description: 'Direct live query or dynamic orbital ephemeris calculated for current epoch.'
    };
  }

  if (ageMs < maxAgeMs) {
    return {
      status: 'cached',
      label: 'Cached Live Stream',
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      description: 'Synchronized live session cache respecting upstream observatory rate limits.'
    };
  }

  return {
    status: 'stale',
    label: 'Historical Observation',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    description: 'Archival snapshot preserved from prior observation run.'
  };
}

/**
 * Verifies and normalizes scientific data provenance for any catalog record
 */
export function verifyDataProvenance(
  record: any,
  category: 'galaxy' | 'exoplanet' | 'planet' | 'asteroid' | 'small-body' | 'star' | 'spherex' | 'observation' = 'galaxy'
): ScientificProvenance {
  if (!record) {
    return {
      sourceOrganization: 'NASA Open Data',
      isLive: false,
      freshnessStatus: 'archival',
      verificationLevel: 'peer-reviewed-archive'
    };
  }

  let sourceOrg = record.sourceOrganization || 'NASA / JPL / Caltech';
  let catalogName = record.catalogIdentifier || record.catalog || record.name;
  let archiveUrl = record.sourceUrl || record.sourcePage || 'https://data.nasa.gov/';
  let bibcode = record.bibcode;
  let isLive = Boolean(record.isLive);
  let level: ScientificProvenance['verificationLevel'] = 'peer-reviewed-archive';

  switch (category) {
    case 'galaxy':
      sourceOrg = 'NASA/IPAC Extragalactic Database (NED) & SIMBAD';
      catalogName = record.catalogIdentifier || 'NASA/IPAC NED Extragalactic Catalog';
      archiveUrl = record.sourceUrl || 'https://ned.ipac.caltech.edu/';
      level = 'peer-reviewed-archive';
      break;

    case 'exoplanet':
      sourceOrg = 'NASA Exoplanet Archive (Caltech/IPAC)';
      catalogName = record.planetName ? `NASA Exoplanet Archive (${record.planetName})` : 'NASA Confirmed Exoplanet Archive';
      archiveUrl = record.sourceUrl || (record.planetName 
        ? `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(record.planetName)}` 
        : 'https://exoplanetarchive.ipac.caltech.edu/');
      level = record.confirmedStatus === 'Candidate' ? 'ground-based-astrometry' : 'peer-reviewed-archive';
      break;

    case 'planet':
      if (record.isHypothetical) {
        sourceOrg = 'Caltech Theoretical Astrophysics (Batygin & Brown)';
        catalogName = 'Dynamical Perturbation Model';
        archiveUrl = 'https://solarsystem.nasa.gov/planets/hypothetical-planet-x/in-depth/';
        level = 'theoretical-model';
      } else {
        sourceOrg = 'NASA/JPL Solar System Dynamics & Horizons Ephemerides';
        catalogName = 'JPL Planetary and Lunar Ephemerides (DE440/DE441)';
        archiveUrl = record.sourceUrl || 'https://ssd.jpl.nasa.gov/horizons/';
        level = 'space-telescope-calibrated';
      }
      break;

    case 'asteroid':
    case 'small-body':
      sourceOrg = 'NASA/JPL Center for Near-Earth Object Studies (CNEOS)';
      catalogName = 'JPL Small-Body Database (SBDB)';
      archiveUrl = record.sourceUrl || 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html';
      level = 'ephemeris-propagation';
      break;

    case 'spherex':
      sourceOrg = 'NASA/JPL-Caltech SPHEREx Science Team';
      catalogName = 'SPHEREx All-Sky Spectral Survey (0.75–5.0 µm)';
      archiveUrl = 'https://spherex.caltech.edu/';
      level = 'space-telescope-calibrated';
      break;
  }

  const freshness = getDataFreshness(record.retrievalTimestamp || record.retrievalDateUTC || (isLive ? Date.now() : null));

  return {
    sourceOrganization: sourceOrg,
    catalogName,
    archiveUrl,
    bibcode,
    retrievalDateUTC: record.retrievalDateUTC || (isLive ? new Date().toISOString() : undefined),
    isLive,
    freshnessStatus: freshness.status,
    verificationLevel: level,
    disclaimer: record.isHypothetical 
      ? 'Hypothetical object inferred through gravitational perturbation simulations. Not physically confirmed.' 
      : undefined
  };
}

/**
 * Validates and classifies astronomical imagery into strict scientific status categories
 */
export function verifyImageClassification(
  image: Partial<AstronomicalImageRecord> | null | undefined
): ImageMatchingStatus {
  if (!image) return 'unavailable';

  const classification = image.assetClassification as AstronomicalAssetClassification | undefined;

  if (classification === 'unavailable' || !image.imageUrl) {
    return 'unavailable';
  }

  if (classification === 'contextual') {
    return 'contextual-field';
  }

  if (classification === 'scientific-illustration') {
    return 'physical-model-illustration';
  }

  if (classification === 'artist-impression') {
    return 'artist-impression';
  }

  if (classification === 'spacecraft') {
    return 'verified-spacecraft-photo';
  }

  if (classification === 'observation' || image.isVerifiedRealObservation) {
    if (image.instrument && (image.instrument.includes('&') || image.instrument.includes('/'))) {
      return 'verified-composite';
    }
    return 'verified-direct-observation';
  }

  return 'unverified';
}

/**
 * Formats a scientific measurement with strict preservation of units, uncertainties, and estimate disclaimers
 */
export function formatScientificMeasurement<T = number>(
  value: T | null | undefined,
  unit: string,
  options: {
    uncertainty?: T | null;
    method?: string;
    isEstimate?: boolean;
    decimals?: number;
    fallback?: string;
  } = {}
): string {
  if (value === null || value === undefined) {
    return options.fallback || 'Unmeasured / Not Archived';
  }

  let formattedVal: string;
  if (typeof value === 'number') {
    formattedVal = options.decimals !== undefined ? value.toFixed(options.decimals) : value.toLocaleString();
  } else {
    formattedVal = String(value);
  }

  let str = `${formattedVal} ${unit}`.trim();

  if (options.uncertainty !== null && options.uncertainty !== undefined) {
    const uncertStr = typeof options.uncertainty === 'number' && options.decimals !== undefined
      ? options.uncertainty.toFixed(options.decimals)
      : String(options.uncertainty);
    str += ` ± ${uncertStr} ${unit}`.trim();
  }

  if (options.isEstimate) {
    str += ' (est.)';
  }

  if (options.method) {
    str += ` [via ${options.method}]`;
  }

  return str;
}

/**
 * Safely formats numeric measurement values without replacing missing data with false numbers
 */
export function formatMeasurementValue(
  value: number | null | undefined,
  decimals = 2,
  fallback = '—'
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  return value.toFixed(decimals);
}
