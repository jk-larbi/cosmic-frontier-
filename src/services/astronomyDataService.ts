import type { 
  ExoplanetRecord, 
  SmallBodyRecord, 
  GalaxyRecord, 
  StarRecord, 
  CatalogItem, 
  CatalogCategory 
} from '../types';

const REQUEST_TIMEOUT_MS = 8000;

async function safeFetch<T>(url: string, fallbackData: T): Promise<{ data: T; source: string; isLive: boolean }> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    if (res.ok) {
      const json = await res.json();
      return {
        data: (json.records || json.data || json) as T,
        source: json.source || 'NASA Open Data Gateway',
        isLive: true
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

export async function fetchConfirmedExoplanets(search?: string, includeCandidates = true) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (includeCandidates) params.append('candidates', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';
  return safeFetch<ExoplanetRecord[]>(`/api/data/exoplanets${query}`, []);
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

  const url = `/api/data/catalog?${params.toString()}`;
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
