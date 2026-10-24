import type { AstronomicalImageRecord } from '../types';
import { 
  getVerifiedAstronomicalImage, 
  getVerifiedAstronomicalGallery,
  normalizeObjectId 
} from '../data/verifiedAstronomicalImages';
import { 
  createDeterministicImageRecord, 
  type IllustrationParams 
} from '../utils/astronomicalIllustrationGenerator';

// In-memory cache to prevent redundant resolution or queries
const resolvedImageCache = new Map<string, AstronomicalImageRecord>();
const dynamicAssetSearchCache = new Map<string, AstronomicalImageRecord[]>();

/**
 * Resolves the highest-priority visual representation for any astronomical object.
 * 
 * Strict Priority Order:
 * 1. Verified image explicitly associated with the object (NASA/ESA/JPL mission data).
 * 2. Verified mission or observatory image associated with the same object.
 * 3. Relevant host-star, observation, or contextual image, accurately labelled.
 * 4. Deterministic scientific illustration generated from available properties.
 * 5. A professionally designed category-specific fallback visual.
 */
export function resolveAstronomicalVisual(
  object: {
    id?: string;
    name?: string;
    planetName?: string;
    designation?: string;
    category?: string;
    radiusEarthRadii?: number | null;
    radiusKm?: number | string | null;
    massEarthMasses?: number | null;
    stellarEffectiveTempK?: number | null;
    effectiveTemperatureK?: number | null;
    hostStar?: string | null;
    spectralType?: string | null;
    image?: AstronomicalImageRecord | null;
  },
  category: 'exoplanet' | 'planet' | 'star' | 'asteroid' | 'comet' | 'galaxy' | 'nebula' | 'small-body' | 'observation' = 'exoplanet'
): AstronomicalImageRecord {
  const objectName = object.planetName || object.name || object.designation || object.id || 'Unnamed Object';
  const objectId = object.id || objectName;
  const cacheKey = `${category}:${normalizeObjectId(objectId)}`;

  if (resolvedImageCache.has(cacheKey)) {
    return resolvedImageCache.get(cacheKey)!;
  }

  // 1. If object already carries a verified image record (supports both imageUrl and url)
  const rawImg = object.image as any;
  if (rawImg && (rawImg.imageUrl || rawImg.url)) {
    const normalizedRecord: AstronomicalImageRecord = {
      id: rawImg.id || `img-${normalizeObjectId(objectId)}`,
      associatedObjectId: objectId,
      imageUrl: rawImg.imageUrl || rawImg.url,
      thumbnailUrl: rawImg.thumbnailUrl || rawImg.url || rawImg.imageUrl,
      hdUrl: rawImg.hdUrl || rawImg.imageUrl || rawImg.url,
      title: rawImg.title || objectName,
      caption: rawImg.caption || `Verified scientific imagery for ${objectName}.`,
      sourceOrganization: rawImg.sourceOrganization || (rawImg.credit?.includes('NASA') ? 'NASA' : 'NASA / Space Telescope Science Institute'),
      sourceUrl: rawImg.sourcePage || rawImg.sourceUrl || 'https://images.nasa.gov/',
      credit: rawImg.credit || 'NASA/ESA/STScI',
      assetClassification: rawImg.assetClassification || (rawImg.isIllustration ? 'artist-impression' : 'observation'),
      isVerifiedRealObservation: rawImg.isVerifiedRealObservation !== undefined ? rawImg.isVerifiedRealObservation : !rawImg.isIllustration,
      observationDate: rawImg.observationDate,
      instrument: rawImg.instrument || rawImg.mission,
      wavelength: rawImg.wavelength
    };
    resolvedImageCache.set(cacheKey, normalizedRecord);
    return normalizedRecord;
  }

  // 2. Lookup in Verified Astronomical Images Registry (Priority 1 & 2)
  const verified = getVerifiedAstronomicalImage(objectId) || getVerifiedAstronomicalImage(objectName);
  if (verified) {
    resolvedImageCache.set(cacheKey, verified);
    return verified;
  }

  // 3. Relevant host-star image if host star exists and is registered (Priority 3)
  if (object.hostStar) {
    const starVerified = getVerifiedAstronomicalImage(object.hostStar);
    if (starVerified) {
      const contextualHostImage: AstronomicalImageRecord = {
        ...starVerified,
        id: `ctx-${starVerified.id}`,
        associatedObjectId: objectId,
        title: `Host Star ${object.hostStar} (System Context for ${objectName})`,
        caption: `Observation of host star ${object.hostStar}. Direct optical photography of orbiting exoplanet ${objectName} is currently beyond modern resolution limits.`,
        assetClassification: 'contextual',
        isVerifiedRealObservation: starVerified.isVerifiedRealObservation
      };
      resolvedImageCache.set(cacheKey, contextualHostImage);
      return contextualHostImage;
    }
  }

  // 4. Deterministic Scientific Illustration from Available Physical Properties (Priority 4)
  const tempK = object.stellarEffectiveTempK ?? object.effectiveTemperatureK ?? null;
  const illustrationParams: IllustrationParams = {
    id: objectId,
    name: objectName,
    category,
    radiusEarthRadii: object.radiusEarthRadii,
    radiusKm: object.radiusKm,
    massEarthMasses: object.massEarthMasses,
    temperatureK: tempK,
    stellarType: object.spectralType || null
  };

  const deterministicVisual = createDeterministicImageRecord(illustrationParams);
  resolvedImageCache.set(cacheKey, deterministicVisual);
  return deterministicVisual;
}

/**
 * Returns complete gallery of verified assets for an object
 * (multiple wavelengths, light curves, spacecraft views).
 */
export function getAstronomicalGallery(
  objectIdOrName: string,
  category: 'exoplanet' | 'planet' | 'star' | 'asteroid' | 'comet' | 'galaxy' | 'nebula' | 'small-body' | 'observation' = 'exoplanet',
  fallbackParams?: IllustrationParams
): AstronomicalImageRecord[] {
  const verifiedList = getVerifiedAstronomicalGallery(objectIdOrName);
  
  if (verifiedList.length > 0) {
    return verifiedList;
  }

  // If no verified assets exist, provide the deterministic illustration as the primary asset
  const params: IllustrationParams = fallbackParams || {
    id: objectIdOrName,
    name: objectIdOrName,
    category
  };

  return [createDeterministicImageRecord(params)];
}

export const resolveAstronomicalGallery = getAstronomicalGallery;

/**
 * Searches official NASA Image & Video Library via server proxy or direct API
 */
export async function searchNasaImages(query: string): Promise<AstronomicalImageRecord[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const cacheKey = trimmed.toLowerCase();
  if (dynamicAssetSearchCache.has(cacheKey)) {
    return dynamicAssetSearchCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`/api/data/images?search=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.records) && data.records.length > 0) {
        dynamicAssetSearchCache.set(cacheKey, data.records);
        return data.records;
      }
    }
  } catch (err) {
    console.warn('NASA image search proxy unavailable:', err);
  }

  return [];
}
