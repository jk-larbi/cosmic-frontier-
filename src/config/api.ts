/**
 * COSMIC FRONTIER - Centralized API Configuration
 * 
 * Supports:
 * 1. Local development: requests proxy through Vite dev server to localhost:3001.
 * 2. Static GitHub Pages deployment connected to a hosted backend via VITE_BACKEND_URL.
 * 3. Graceful offline/fallback mode when backend is unreachable or not yet deployed.
 */

// If VITE_BACKEND_URL is set in environment (e.g., https://cosmic-frontier-api.onrender.com),
// normalize it by stripping any trailing slash. Otherwise empty string for relative proxying.
export const BACKEND_URL = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || '').replace(/\/+$/, '');

/**
 * Resolves a full API URL given a relative endpoint path.
 * If VITE_BACKEND_URL is provided, prepends the backend origin.
 * Otherwise returns the relative path (working with Vite proxy or same-origin deployment).
 *
 * Example:
 *   getApiUrl('/api/data/galaxies')
 *   -> 'https://cosmic-frontier.onrender.com/api/data/galaxies' (with VITE_BACKEND_URL)
 *   -> '/api/data/galaxies' (local development)
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!BACKEND_URL) {
    return cleanPath;
  }
  return `${BACKEND_URL}${cleanPath}`;
}
