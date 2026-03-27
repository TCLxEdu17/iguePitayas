/**
 * Returns a URL for an API path.
 * On web builds (NEXT_PUBLIC_API_URL unset) returns the path as-is (relative URL).
 * On mobile builds returns an absolute URL prefixed with NEXT_PUBLIC_API_URL.
 *
 * @param path - Must start with '/' (e.g. '/api/plots'). Base URL must have no trailing slash.
 */
export function getApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  return `${base}${path}`
}
