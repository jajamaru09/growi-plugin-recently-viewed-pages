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
  // Growi sets document.title to "PageTitle - SiteName" or "PageTitle | GROWI"
  const docTitle = document.title;
  if (docTitle) {
    // Strip common suffixes: " - SiteName", " | SiteName"
    const cleaned = docTitle.replace(/\s*[-|]\s*[^-|]+$/, '').trim();
    if (cleaned) return cleaned;
  }
  // Fallback to path extraction
  return extractTitle(window.location.pathname);
}

function trackCurrentPage(): void {
  const path = window.location.pathname;
  if (isExcludedPath(path)) return;
  const title = getPageTitle();
  recordPageView(path, title);
}

let pollInterval: ReturnType<typeof setInterval> | null = null;
let lastPath = '';

export function startTracking(): void {
  lastPath = window.location.pathname;
  // Delay first recording slightly so document.title is set
  setTimeout(trackCurrentPage, 500);

  // Listen for popstate (back/forward navigation)
  window.addEventListener('popstate', () => {
    // Delay to let Growi update document.title after navigation
    setTimeout(trackCurrentPage, 500);
  });

  // Poll for pushState navigations (Next.js router)
  pollInterval = setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      // Delay to let Growi update document.title
      setTimeout(trackCurrentPage, 500);
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
