/**
 * COSMIC FRONTIER — Live Space & Earth Approach Data Service
 * 
 * Communicates with backend endpoints:
 *   - /api/data/live-space/ephemeris: High-precision J2000 state vectors from NASA JPL Solar System Dynamics
 *   - /api/data/live-space/close-approaches: Verified near-Earth close approaches from NASA/JPL CNEOS CAD API
 */

import type { LiveEphemerisResponse, LiveCloseApproachesResponse } from '../types';

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

export async function fetchLiveEphemeris(
  params?: EphemerisQueryParams,
  signal?: AbortSignal
): Promise<LiveEphemerisResponse> {
  const url = new URL('/api/data/live-space/ephemeris', window.location.origin);
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
  const url = new URL('/api/data/live-space/close-approaches', window.location.origin);
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
