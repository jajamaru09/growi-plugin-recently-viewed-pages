import { recordPageView } from './storage';

const EXCLUDED_PREFIXES = ['/_api/', '/_search', '/admin', '/me', '/trash'];

export function isExcludedPath(path: string): boolean {
  if (path === '/') return true;
  return EXCLUDED_PREFIXES.some((prefix) => {
    if (prefix.endsWith('/')) return path.startsWith(prefix);
    return path === prefix || path.startsWith(prefix + '/');
  });
}

export function extractTitle(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || '';
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

export function getPageTitle(): string {
  return extractTitle(window.location.pathname);
}

function trackCurrentPage(): void {
  const path = window.location.pathname;
  if (isExcludedPath(path)) return;
  const title = getPageTitle();
  recordPageView(path, title);
}

let abortController: AbortController | null = null;

export function startTracking(): void {
  // Record current page after short delay (let Growi set document.title)
  setTimeout(trackCurrentPage, 500);

  // Use Navigation API for SPA navigation detection
  if (window.navigation) {
    abortController = new AbortController();
    window.navigation.addEventListener(
      'navigatesuccess',
      () => {
        setTimeout(trackCurrentPage, 500);
      },
      { signal: abortController.signal },
    );
  }
}

export function stopTracking(): void {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
}
