/**
 * Utility to convert relative URLs or asset imports to absolute URLs pointing to the Vercel app.
 */
export function toAbsoluteUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  // If we are in local development or AI Studio preview (run.app), or the path starts with /src/,
  // we use the local domain to prevent breaking the local preview workspace.
  const isDev = typeof window !== 'undefined' && (
    window.location.hostname.includes('localhost') || 
    window.location.hostname.includes('127.0.0.1') || 
    window.location.hostname.includes('run.app') || 
    url.startsWith('/src/')
  );

  if (isDev) {
    return url;
  }

  const baseUrl = 'https://central-de-comando-gr-o6j2.vercel.app';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}
