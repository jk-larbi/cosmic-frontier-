/**
 * COSMIC FRONTIER — Live Space & Earth Approach Data Service
 * 
 * Communicates with backend endpoints:
 *   - /api/data/live-space/ephemeris: High-precision J2000 state vectors from NASA JPL Solar System Dynamics
 *   - /api/data/live-space/close-approaches: Verified near-Earth close approaches from NASA/JPL CNEOS CAD API
 */

import type { LiveEphemerisResponse, LiveCloseApproachesResponse, AsteroidMotionResponse } from '../types';
import { BACKEND_URL } from '../config/api';
import { buildFallbackAsteroidMotionResponse } from '../data/verifiedAsteroidPresets';

const getApiOrigin = () => BACKEND_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

export interface EphemerisQueryParams {
  date?: string;
  target?: string;
}

export interface CloseApproachesQueryParams {
  timeframe?: '24h' | '7d' | '30d' | 'custom';
  phaOnly?: boolean;
  sort?: 'dist' | 'date' | 'size';
  limit?: number;
  dateMin?: string;
  dateMax?: string;
}

export interface AsteroidOrbitQueryParams {
  des?: string;
  date?: string;
  refresh?: boolean;
}

export async function fetchAsteroidOrbit(
  params?: AsteroidOrbitQueryParams,
  signal?: AbortSignal
): Promise<AsteroidMotionResponse> {
  const isRefresh = !!params?.refresh;
  const refreshTimestamp = new Date().toISOString();

  try {
    const url = new URL('/api/data/asteroid/orbit', getApiOrigin());
    if (params?.des) url.searchParams.set('des', params.des);
    if (params?.date) url.searchParams.set('date', params.date);
    if (isRefresh) {
      url.searchParams.set('refresh', 'true');
      url.searchParams.set('_t', Date.now().toString());
    }

    const res = await fetch(url.toString(), {
      signal,
      cache: isRefresh ? 'no-cache' : 'default',
      headers: {
        'Accept': 'application/json',
        ...(isRefresh ? { 'Cache-Control': 'no-cache, no-store' } : {})
      }
    });

    if (res.ok) {
      const json: AsteroidMotionResponse = await res.json();
      return json;
    } else {
      console.warn(`[liveSpaceService] Live asteroid orbit fetch failed with HTTP ${res.status}`);
      const fallback = buildFallbackAsteroidMotionResponse(params?.des, params?.date);
      fallback.provenance.lastRefreshAttempt = {
        timestamp: refreshTimestamp,
        success: false,
        error: `HTTP ${res.status}: Backend orbit service could not complete live retrieval.`
      };
      fallback.provenance.statusExplanation = `Network query returned HTTP ${res.status}. Falling back to verified local archive.`;
      return fallback;
    }
  } catch (err: any) {
    console.warn('[liveSpaceService] Live asteroid orbit fetch failed, falling back to verified Keplerian preset:', err?.message || err);
    const fallback = buildFallbackAsteroidMotionResponse(params?.des, params?.date);
    fallback.provenance.lastRefreshAttempt = {
      timestamp: refreshTimestamp,
      success: false,
      error: err?.message || 'Network connectivity error contacting backend service.'
    };
    fallback.provenance.statusExplanation = 'Network connection failed during retrieval. Displaying verified local archive.';
    return fallback;
  }
}

export async function fetchLiveEphemeris(
  params?: EphemerisQueryParams,
  signal?: AbortSignal
): Promise<LiveEphemerisResponse> {
  const url = new URL('/api/data/live-space/ephemeris', getApiOrigin());
  if (params?.date) url.searchParams.set('date', params.date);
  if (params?.target) url.searchParams.set('target', params.target);

  const res = await fetch(url.toString(), {
    signal,
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ephemeris: HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchLiveCloseApproaches(
  params?: CloseApproachesQueryParams,
  signal?: AbortSignal
): Promise<LiveCloseApproachesResponse> {
  const url = new URL('/api/data/live-space/close-approaches', getApiOrigin());
  if (params?.timeframe) url.searchParams.set('timeframe', params.timeframe);
  if (params?.phaOnly !== undefined) url.searchParams.set('phaOnly', String(params.phaOnly));
  if (params?.sort) url.searchParams.set('sort', params.sort);
  if (params?.limit) url.searchParams.set('limit', String(params.limit));
  if (params?.dateMin) url.searchParams.set('dateMin', params.dateMin);
  if (params?.dateMax) url.searchParams.set('dateMax', params.dateMax);

  const res = await fetch(url.toString(), {
    signal,
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch close approaches: HTTP ${res.status}`);
  }

  return res.json();
}

