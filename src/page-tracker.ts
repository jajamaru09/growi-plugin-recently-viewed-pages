import { recordPageView } from './storage';

const EXCLUDED_PREFIXES = ['/_api/', '/_search', '/admin', '/me', '/trash'];

/** Check if a path segment is a MongoDB ObjectId (24 hex chars) */
function isObjectId(segment: string): boolean {
  return /^[0-9a-f]{24}$/i.test(segment);
}

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
  // Use document.title and strip the trailing site name (e.g. "PageName - Green-Server")
  // Uses lastIndexOf instead of regex to handle hyphens in the site name
  const docTitle = document.title;
  if (docTitle) {
    const sepDash = docTitle.lastIndexOf(' - ');
    const sepPipe = docTitle.lastIndexOf(' | ');
    const sepPos = Math.max(sepDash, sepPipe);
    if (sepPos > 0) {
      const cleaned = docTitle.substring(0, sepPos).trim();
      if (cleaned && !/^[0-9a-f]{24}$/i.test(cleaned)) return cleaned;
    }
  }
  return extractTitle(window.location.pathname);
}

/**
 * Resolve the wiki-style path for the current page.
 * If the URL is a pageId, fetches the real path from Growi API.
 * Returns null if the path needs async resolution (caller should await resolveWikiPath instead).
 */
function getWikiPathSync(): string | null {
  const urlPath = window.location.pathname;
  const segments = urlPath.split('/').filter(Boolean);
  const looksLikePageId = segments.length === 1 && isObjectId(segments[0]);

  if (!looksLikePageId) {
    return urlPath;
  }

  // Needs async API call
  return null;
}

/**
 * Fetch wiki path from Growi API using pageId.
 */
async function fetchWikiPath(pageId: string): Promise<string | null> {
  try {
    const res = await fetch(`/_api/v3/page?pageId=${pageId}`);
    if (!res.ok) return null;
    const data = await res.json();
    const path = data?.page?.path;
    if (path && typeof path === 'string') return path;
  } catch {
    // API unavailable
  }
  return null;
}

/**
 * Resolve wiki-style path, using API if needed.
 */
async function resolveWikiPath(): Promise<string> {
  const urlPath = window.location.pathname;
  const syncPath = getWikiPathSync();
  if (syncPath !== null) return syncPath;

  // Extract pageId from URL
  const pageId = urlPath.split('/').filter(Boolean)[0];
  const apiPath = await fetchWikiPath(pageId);
  return apiPath ?? urlPath;
}

async function trackCurrentPage(): Promise<void> {
  const path = await resolveWikiPath();
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
