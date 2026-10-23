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

export async function fetchConfirmedExoplanets(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
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
