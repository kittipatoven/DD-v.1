export function getImageUrl(path: string | undefined): string {
  // Data URI placeholder (gray box with icon)
  const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%231e293b" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%2364748b"%3ENo Image%3C/text%3E%3C/svg%3E';

  if (!path) {
    return placeholder;
  }

  // If already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If path starts with /uploads, construct full URL
  if (path.startsWith('/uploads')) {
    // Get raw API URL and remove /api/v1 to get base backend URL
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const base = rawApiUrl.replace(/\/api\/v1\/?$/, '');
    return `${base}${path}`;
  }

  // For other relative paths, return as-is
  return path;
}
