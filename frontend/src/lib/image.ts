import { getApiOrigin, getPublicOrigin, isLocalhostUrl } from '@/lib/env';

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%231e293b" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2364748b"%3ENo Image%3C/text%3E%3C/svg%3E';

export function getImageUrl(path: string | undefined): string {
  if (!path) {
    return PLACEHOLDER;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (typeof window !== 'undefined' && isLocalhostUrl(path)) {
      const filename = path.replace(/^.*\/uploads\//, '');
      if (filename && filename !== path) {
        return `/uploads/${filename}`;
      }
    }
    return path;
  }

  if (path.startsWith('/uploads')) {
    if (typeof window !== 'undefined') {
      return path;
    }
    const origin = getPublicOrigin() || getApiOrigin();
    return origin ? `${origin}${path}` : path;
  }

  return path;
}
