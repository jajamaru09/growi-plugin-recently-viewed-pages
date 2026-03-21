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
 * Tries multiple sources to avoid storing pageId-based URLs.
 */
export function getWikiPath(): string {
  const urlPath = window.location.pathname;

  // If URL path is already wiki-style (not a bare pageId), use it directly
  const segments = urlPath.split('/').filter(Boolean);
  const looksLikePageId = segments.length === 1 && isObjectId(segments[0]);

  if (!looksLikePageId) {
    return urlPath;
  }

  // Try to extract path from __NEXT_DATA__ (Growi uses Next.js)
  try {
    const nextData = (window as any).__NEXT_DATA__;
    const page = nextData?.props?.pageServerSideProps?.currentPage;
    if (page?.path && typeof page.path === 'string') {
      return page.path;
    }
  } catch {
    // ignore
  }

  // Try to extract from Growi's page header breadcrumb
  try {
    const pathNav = document.querySelector('.grw-page-path-nav');
    if (pathNav) {
      const links = pathNav.querySelectorAll('a[href]');
      if (links.length > 0) {
        const lastLink = links[links.length - 1] as HTMLAnchorElement;
        const href = lastLink.getAttribute('href');
        if (href && href.startsWith('/') && !isObjectId(href.replace('/', ''))) {
          return href;
        }
      }
    }
  } catch {
    // ignore
  }

  // Try to find page path from the page header h1
  try {
    const headerPath = document.querySelector('.grw-page-path-text-muted-container');
    if (headerPath?.textContent) {
      const text = headerPath.textContent.trim();
      if (text.startsWith('/')) return text;
    }
  } catch {
    // ignore
  }

  // Fallback: return URL path as-is
  return urlPath;
}

function debugPageInfo(): void {
  const urlPath = window.location.pathname;
  console.group('[growi-rv-debug] Page Info');
  console.log('URL pathname:', urlPath);
  console.log('document.title:', document.title);

  // __NEXT_DATA__
  try {
    const nd = (window as any).__NEXT_DATA__;
    console.log('__NEXT_DATA__:', JSON.parse(JSON.stringify(nd ?? null)));
  } catch (e) {
    console.log('__NEXT_DATA__: error reading', e);
  }

  // Growi global objects
  for (const key of ['grpiPageData', 'growiRenderer', 'growiPlugin']) {
    if ((window as any)[key]) console.log(`window.${key}:`, (window as any)[key]);
  }

  // DOM candidates for page path
  const selectors = [
    '.grw-page-path-nav',
    '.grw-page-path-text-muted-container',
    '.page-path',
    '[data-page-path]',
    '[data-page-id]',
    '.grw-page-path-hierarchical-link',
    '#grw-subnav-container',
    '.grw-subnav',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      console.log(`DOM "${sel}":`, {
        textContent: el.textContent?.trim().substring(0, 200),
        innerHTML: el.innerHTML.substring(0, 500),
        dataset: { ...(el as HTMLElement).dataset },
      });
    }
  }

  // Check all elements with data-page-* attributes
  const dataPageEls = document.querySelectorAll('[data-page-path], [data-page-id]');
  if (dataPageEls.length > 0) {
    console.log('Elements with data-page-* attrs:');
    dataPageEls.forEach((el) => {
      console.log('  ', el.tagName, { ...(el as HTMLElement).dataset });
    });
  }

  console.groupEnd();
}

function trackCurrentPage(): void {
  // === DEBUG: remove after investigation ===
  debugPageInfo();
  // === END DEBUG ===

  const path = getWikiPath();
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
