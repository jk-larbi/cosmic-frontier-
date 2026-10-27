import type { 
  ExoplanetRecord, 
  SmallBodyRecord, 
  GalaxyRecord, 
  StarRecord, 
  CatalogItem, 
  CatalogCategory,
  NasaImageRecord
} from '../types';
import { getApiUrl } from '../config/api';

const REQUEST_TIMEOUT_MS = 8000;

export interface FetchResult<T> {
  data: T;
  source: string;
  isLive: boolean;
  table?: string;
  page?: number;
  pageSize?: number;
  totalRecords?: number;
  hasMore?: boolean;
  lastUpdatedUtc?: string;
}

async function safeFetch<T>(endpoint: string, fallbackData: T): Promise<FetchResult<T>> {
  const url = getApiUrl(endpoint);
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    if (res.ok) {
      const json = await res.json();
      return {
        data: (json.records || json.data || json.items || json) as T,
        source: json.source || 'NASA Open Data Gateway',
        isLive: json.isLive ?? true,
        table: json.table,
        page: json.page,
        pageSize: json.pageSize,
        totalRecords: json.totalRecords || json.recordCount,
        hasMore: json.hasMore,
        lastUpdatedUtc: json.lastUpdatedUtc || json.retrievalDateUTC
      };
    }
  } catch (err) {
    console.warn(`[AstronomyDataService] Request to ${url} failed, using verified fallback:`, err);
  }
  return {
    data: fallbackData,
    source: 'Verified Local Archive',
    isLive: false
  };
}

export async function fetchSolarSystemPlanets() {
  return safeFetch('/api/data/solar-system', []);
}

export async function fetchConfirmedExoplanets(
  search?: string, 
  includeCandidates = true,
  page = 1,
  limit = 50,
  method?: string,
  sort?: string
) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (includeCandidates) params.append('candidates', 'true');
  if (page > 1) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  if (method && method !== 'all') params.append('method', method);
  if (sort) params.append('sort', sort);
  const query = params.toString() ? `?${params.toString()}` : '';
  return safeFetch<ExoplanetRecord[]>(`/api/data/exoplanets${query}`, []);
}

export async function fetchNasaImageSearch(query: string, page = 1, pageSize = 12, category?: string) {
  const params = new URLSearchParams();
  params.append('q', query);
  if (page > 1) params.append('page', String(page));
  if (pageSize) params.append('pageSize', String(pageSize));
  if (category && category !== 'all') params.append('category', category);
  return safeFetch<NasaImageRecord[]>(`/api/nasa/images?${params.toString()}`, []);
}

export async function fetchSmallBodies(search?: string) {
  const query = search ? `?sstr=${encodeURIComponent(search)}` : '';
  return safeFetch<{ confirmedObjects: SmallBodyRecord[]; hypotheticalScenarios: unknown[] }>(
    `/api/data/small-bodies${query}`,
    { confirmedObjects: [], hypotheticalScenarios: [] }
  );
}

export async function fetchGalaxies() {
  return safeFetch<GalaxyRecord[]>('/api/data/galaxies', []);
}

export async function fetchStars() {
  return safeFetch<StarRecord[]>('/api/data/stars', []);
}

export async function fetchSpherexProducts() {
  return safeFetch('/api/data/spherex', null);
}

export async function fetchNasaImages(query = 'SPHEREx') {
  return safeFetch(`/api/data/images?q=${encodeURIComponent(query)}`, []);
}

export async function fetchObservatoryObjects(params?: { date?: string; category?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.date) query.append('date', params.date);
  if (params?.category && params.category !== 'all') query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  const qStr = query.toString() ? `?${query.toString()}` : '';

  return safeFetch(`/api/data/observatory/objects${qStr}`, {
    success: false,
    epoch: new Date().toISOString(),
    julianDate: 2451545.0,
    retrievalTimestamp: new Date().toISOString(),
    coordinateFrame: 'ICRF / J2000 Ecliptic',
    statusLabel: 'UNAVAILABLE',
    totalCount: 0,
    allAvailableCount: 0,
    categories: {
      'solar-system': 0,
      'asteroids-comets': 0,
      'distant-tnos': 0,
      'exoplanets': 0,
      'deep-sky': 0,
      'spherex-targets': 0
    },
    objects: []
  });
}

export async function fetchCatalogItems(
  category: CatalogCategory = 'all', 
  searchQuery = ''
): Promise<{ items: CatalogItem[]; source: string; isLive: boolean }> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (searchQuery) params.append('q', searchQuery);

  const url = getApiUrl(`/api/data/catalog?${params.toString()}`);
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    if (res.ok) {
      const json = await res.json();
      return {
        items: (json.items || []) as CatalogItem[],
        source: json.source || 'NASA Open Data Gateway',
        isLive: true
      };
    }
  } catch (err) {
    console.warn(`[AstronomyDataService] Request to ${url} failed:`, err);
  }
  return {
    items: [],
    source: 'Verified Local Archive',
    isLive: false
  };
}
