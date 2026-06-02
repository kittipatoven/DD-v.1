/**
 * API / WebSocket URL resolution
 * Priority (browser): valid ENV → same origin (reverse proxy) → dev default
 * Priority (SSR): valid ENV → SITE_URL origin → dev default
 */

const DEV_API_BASE = 'http://localhost:3001/api/v1';
const DEV_WS_URL = 'http://localhost:3001';
const DEV_SITE_URL = 'http://localhost:3000';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function isLocalhostHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]'
  );
}

export function isLocalhostUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return isLocalhostHost(parsed.hostname);
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

function normalizeApiBase(url: string): string {
  const trimmed = url.replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v1')) {
    return trimmed;
  }
  return `${trimmed}/api/v1`;
}

function originFromUrl(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/** Public site origin (https://ddcomputersamrong.com) */
export function getPublicOrigin(): string {
  if (isBrowser()) {
    return window.location.origin;
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    const origin = originFromUrl(site);
    if (origin) return origin;
  }

  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (api) {
    const origin = originFromUrl(api);
    if (origin) return origin;
  }

  return '';
}

/** Full API base including /api/v1 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  // Browser: ignore localhost baked in at build time when on real domain
  if (isBrowser()) {
    if (envUrl && !isLocalhostUrl(envUrl)) {
      return normalizeApiBase(envUrl);
    }
    return normalizeApiBase(`${window.location.origin}/api/v1`);
  }

  // SSR / server
  if (envUrl && !isLocalhostUrl(envUrl)) {
    return normalizeApiBase(envUrl);
  }

  const origin = getPublicOrigin();
  if (origin) {
    return normalizeApiBase(`${origin}/api/v1`);
  }

  return DEV_API_BASE;
}

/** Backend origin without /api/v1 (uploads, static files) */
export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, '');
}

/** Socket.IO base URL */
export function getWsUrl(): string {
  const envWs = process.env.NEXT_PUBLIC_WS_URL?.trim();

  if (isBrowser()) {
    if (envWs && !isLocalhostUrl(envWs)) {
      return envWs.replace(/\/+$/, '');
    }
    return window.location.origin;
  }

  if (envWs && !isLocalhostUrl(envWs)) {
    return envWs.replace(/\/+$/, '');
  }

  const origin = getPublicOrigin();
  if (origin) return origin;

  return DEV_WS_URL;
}

export function getSiteUrl(): string {
  const envSite = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (isBrowser()) {
    if (envSite && !isLocalhostUrl(envSite)) {
      return envSite.replace(/\/+$/, '');
    }
    return window.location.origin;
  }

  if (envSite && !isLocalhostUrl(envSite)) {
    return envSite.replace(/\/+$/, '');
  }

  const origin = getPublicOrigin();
  if (origin) return origin;

  return DEV_SITE_URL;
}
