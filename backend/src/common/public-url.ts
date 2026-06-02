/** Public backend base URL (no /api/v1 suffix) — for upload URLs in responses */
export function getPublicBackendOrigin(): string {
  const apiUrl = process.env.API_URL?.trim();
  if (apiUrl) {
    return apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  }
  const port = process.env.PORT || '3001';
  return `http://localhost:${port}`;
}

export function getUploadUrl(relativePath: string): string {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${getPublicBackendOrigin()}${path}`;
}
