import { recordPageView } from './storage';

const EXCLUDED_PREFIXES = ['/_api/', '/_search', '/admin', '/me', '/trash'];

export function isExcludedPath(path: string): boolean {
  if (path === '/') return true;
  return EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
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

function trackCurrentPage(): void {
  const path = window.location.pathname;
  if (isExcludedPath(path)) return;
  const title = extractTitle(path);
  recordPageView(path, title);
}

let pollInterval: ReturnType<typeof setInterval> | null = null;
let lastPath = '';

export function startTracking(): void {
  lastPath = window.location.pathname;
  trackCurrentPage();
  window.addEventListener('popstate', trackCurrentPage);
  pollInterval = setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      trackCurrentPage();
    }
  }, 1000);
}

export function stopTracking(): void {
  window.removeEventListener('popstate', trackCurrentPage);
  if (pollInterval !== null) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
