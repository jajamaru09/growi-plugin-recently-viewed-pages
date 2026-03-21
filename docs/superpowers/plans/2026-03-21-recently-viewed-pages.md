# Recently Viewed Pages Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Growi script plugin that tracks page visits in localStorage and displays them in a native sidebar panel.

**Architecture:** DOM injection approach — the plugin's `activate()` uses MutationObserver to wait for Growi's sidebar DOM, then injects a nav button and content panel using Growi's own CSS classes. Page visits are tracked via URL polling (to catch Next.js pushState navigations) and stored in localStorage as a JSON array of max 30 unique entries.

**Tech Stack:** TypeScript, Vite, vitest (testing), no React (pure DOM)

---

## File Structure

```
growi-plugin-recently-viewed-pages/
├── client-entry.tsx           # Plugin activate/deactivate + window registration
├── src/
│   ├── storage.ts            # localStorage CRUD: record, get, clear
│   ├── relative-time.ts      # Format timestamps as relative time strings
│   ├── page-tracker.ts       # URL monitoring, page view detection, path exclusion
│   ├── sidebar-button.ts     # Inject nav button, manage active state
│   ├── sidebar-panel.ts      # Render history list, handle clear action
│   ├── html-escape.ts        # XSS prevention utility
│   └── styles.css            # Minimal custom styles
├── index.html                # Dev mock page with simulated Growi sidebar
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
└── .gitignore
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "growi-plugin-recently-viewed-pages",
  "version": "1.0.0",
  "description": "GROWI plugin that displays recently viewed pages in the sidebar.",
  "type": "module",
  "keywords": ["growi", "growi-plugin"],
  "license": "MIT",
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "jsdom": "^25.0.0",
    "typescript": "^5.4.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  },
  "growiPlugin": {
    "schemaVersion": "4",
    "types": ["script"]
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "client-entry.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create vite.config.ts**

```typescript
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    manifest: true,
    sourcemap: true,
    rollupOptions: {
      input: [resolve(__dirname, 'client-entry.tsx')],
    },
  },
});
```

- [ ] **Step 5: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

- [ ] **Step 6: Create .gitignore**

```
node_modules/
*.local
```

Note: `dist/` is NOT ignored because Growi loads plugins directly from the git repository and needs the built output.

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` generated

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts vitest.config.ts .gitignore
git commit -m "chore: scaffold project with Vite, TypeScript, vitest"
```

---

### Task 2: Storage Module

**Files:**
- Create: `src/storage.ts`
- Test: `src/storage.test.ts`

- [ ] **Step 1: Write failing tests for storage**

Create `src/storage.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { recordPageView, getHistory, clearHistory, STORAGE_KEY, MAX_ITEMS } from './storage';

describe('storage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records a page view and retrieves it', () => {
    recordPageView('/test/page', 'page');
    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].path).toBe('/test/page');
    expect(history[0].title).toBe('page');
    expect(typeof history[0].viewedAt).toBe('number');
  });

  it('returns empty array when no history', () => {
    expect(getHistory()).toEqual([]);
  });

  it('updates viewedAt when same path is recorded again', () => {
    vi.setSystemTime(new Date('2026-03-21T10:00:00'));
    recordPageView('/test/page', 'page');
    const first = getHistory()[0].viewedAt;

    vi.setSystemTime(new Date('2026-03-21T10:05:00'));
    recordPageView('/test/page', 'page');
    const second = getHistory()[0].viewedAt;

    expect(second).toBeGreaterThan(first);
    expect(getHistory()).toHaveLength(1);
  });

  it('sorts by viewedAt descending (most recent first)', () => {
    recordPageView('/a', 'a');
    vi.advanceTimersByTime(1000);
    recordPageView('/b', 'b');
    vi.advanceTimersByTime(1000);
    recordPageView('/c', 'c');
    const history = getHistory();
    expect(history[0].path).toBe('/c');
    expect(history[2].path).toBe('/a');
  });

  it('enforces max 30 items', () => {
    for (let i = 0; i < 35; i++) {
      recordPageView(`/page/${i}`, `${i}`);
    }
    expect(getHistory()).toHaveLength(MAX_ITEMS);
  });

  it('clears all history', () => {
    recordPageView('/a', 'a');
    recordPageView('/b', 'b');
    clearHistory();
    expect(getHistory()).toEqual([]);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');
    expect(getHistory()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/storage.test.ts`
Expected: FAIL — module `./storage` not found

- [ ] **Step 3: Implement storage module**

Create `src/storage.ts`:

```typescript
export const STORAGE_KEY = 'growi-recently-viewed-pages';
export const MAX_ITEMS = 30;

export type ViewedPage = {
  path: string;
  title: string;
  viewedAt: number;
};

export function getHistory(): ViewedPage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function recordPageView(path: string, title: string): void {
  try {
    const history = getHistory().filter((item) => item.path !== path);
    history.unshift({ path, title, viewedAt: Date.now() });
    if (history.length > MAX_ITEMS) {
      history.length = MAX_ITEMS;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/storage.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/storage.ts src/storage.test.ts
git commit -m "feat: add localStorage storage module with tests"
```

---

### Task 3: Relative Time Module

**Files:**
- Create: `src/relative-time.ts`
- Test: `src/relative-time.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/relative-time.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from './relative-time';

describe('formatRelativeTime', () => {
  const now = Date.now();

  it('returns "just now" for < 60 seconds ago', () => {
    expect(formatRelativeTime(now - 30_000, now)).toBe('just now');
  });

  it('returns "1 minute" for 60-119 seconds ago', () => {
    expect(formatRelativeTime(now - 90_000, now)).toBe('1 minute');
  });

  it('returns "N minutes" for 2-59 minutes ago', () => {
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe('5 minutes');
  });

  it('returns "1 hour" for 60-119 minutes ago', () => {
    expect(formatRelativeTime(now - 90 * 60_000, now)).toBe('1 hour');
  });

  it('returns "N hours" for 2-23 hours ago', () => {
    expect(formatRelativeTime(now - 5 * 3600_000, now)).toBe('5 hours');
  });

  it('returns "1 day" for 24-47 hours ago', () => {
    expect(formatRelativeTime(now - 30 * 3600_000, now)).toBe('1 day');
  });

  it('returns "N days" for 2-29 days ago', () => {
    expect(formatRelativeTime(now - 5 * 86400_000, now)).toBe('5 days');
  });

  it('returns formatted date for >= 30 days ago', () => {
    const old = new Date(2026, 0, 15, 14, 30).getTime();
    expect(formatRelativeTime(old, now)).toBe('2026/01/15 14:30');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/relative-time.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement relative-time module**

Create `src/relative-time.ts`:

```typescript
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 2) return '1 minute';
  if (diffMin < 60) return `${diffMin} minutes`;
  if (diffHour < 2) return '1 hour';
  if (diffHour < 24) return `${diffHour} hours`;
  if (diffDay < 2) return '1 day';
  if (diffDay < 30) return `${diffDay} days`;

  const d = new Date(timestamp);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/relative-time.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/relative-time.ts src/relative-time.test.ts
git commit -m "feat: add relative time formatting with tests"
```

---

### Task 4: Page Tracker Module

**Files:**
- Create: `src/page-tracker.ts`
- Test: `src/page-tracker.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/page-tracker.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { isExcludedPath, extractTitle } from './page-tracker';

describe('isExcludedPath', () => {
  it('excludes root path', () => {
    expect(isExcludedPath('/')).toBe(true);
  });

  it('excludes API paths', () => {
    expect(isExcludedPath('/_api/v3/pages')).toBe(true);
  });

  it('excludes search paths', () => {
    expect(isExcludedPath('/_search')).toBe(true);
  });

  it('excludes admin paths', () => {
    expect(isExcludedPath('/admin/plugins')).toBe(true);
  });

  it('excludes /me path', () => {
    expect(isExcludedPath('/me')).toBe(true);
    expect(isExcludedPath('/me/settings')).toBe(true);
  });

  it('excludes /trash path', () => {
    expect(isExcludedPath('/trash')).toBe(true);
  });

  it('allows normal page paths', () => {
    expect(isExcludedPath('/user/jun/メモ')).toBe(false);
    expect(isExcludedPath('/999_その他/Claudeコラム')).toBe(false);
  });
});

describe('extractTitle', () => {
  it('extracts last path segment', () => {
    expect(extractTitle('/999_その他/Claudeコラム/20260321_月齢')).toBe('20260321_月齢');
  });

  it('decodes URI-encoded segments', () => {
    expect(extractTitle('/test/%E3%83%86%E3%82%B9%E3%83%88')).toBe('テスト');
  });

  it('handles single-segment path', () => {
    expect(extractTitle('/テスト用')).toBe('テスト用');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/page-tracker.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement page-tracker module**

Create `src/page-tracker.ts`:

```typescript
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
  // Record current page immediately
  lastPath = window.location.pathname;
  trackCurrentPage();

  // Listen for popstate (back/forward navigation)
  window.addEventListener('popstate', trackCurrentPage);

  // Poll for pushState navigations (Next.js router)
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/page-tracker.test.ts`
Expected: All 10 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/page-tracker.ts src/page-tracker.test.ts
git commit -m "feat: add page tracker with URL monitoring and path filtering"
```

---

### Task 5: HTML Escape Utility

**Files:**
- Create: `src/html-escape.ts`
- Test: `src/html-escape.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/html-escape.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { escapeHtml } from './html-escape';

describe('escapeHtml', () => {
  it('escapes ampersand', () => {
    expect(escapeHtml('a&b')).toBe('a&amp;b');
  });

  it('escapes angle brackets', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#39;s');
  });

  it('leaves normal text unchanged', () => {
    expect(escapeHtml('hello world 日本語')).toBe('hello world 日本語');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/html-escape.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement html-escape module**

Create `src/html-escape.ts`:

```typescript
const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/html-escape.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/html-escape.ts src/html-escape.test.ts
git commit -m "feat: add HTML escape utility for XSS prevention"
```

---

### Task 6: Sidebar Button Module

**Files:**
- Create: `src/sidebar-button.ts`

- [ ] **Step 1: Implement sidebar-button module**

Create `src/sidebar-button.ts`:

```typescript
const BUTTON_ID = 'recently-viewed';

export function injectSidebarButton(onClick: () => void): HTMLButtonElement | null {
  const notificationBtn = document.getElementById('in-app-notification');
  if (!notificationBtn) return null;

  // Avoid duplicate injection
  if (document.getElementById(BUTTON_ID)) {
    return document.getElementById(BUTTON_ID) as HTMLButtonElement;
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-primary m-1 rounded';
  btn.id = BUTTON_ID;
  btn.innerHTML = '<div class="position-relative"><span class="material-symbols-outlined">history</span></div>';

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  // Insert after the notification button
  notificationBtn.insertAdjacentElement('afterend', btn);
  return btn;
}

export function setButtonActive(active: boolean): void {
  const btn = document.getElementById(BUTTON_ID);
  if (!btn) return;

  if (active) {
    // Remove active from all sibling nav buttons
    const container = btn.parentElement;
    if (container) {
      container.querySelectorAll('button.btn').forEach((b) => b.classList.remove('active'));
    }
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/sidebar-button.ts
git commit -m "feat: add sidebar button injection module"
```

---

### Task 7: Sidebar Panel Module

**Files:**
- Create: `src/sidebar-panel.ts`
- Create: `src/styles.css`
- Test: `src/sidebar-panel.test.ts`

- [ ] **Step 1: Create styles.css**

Create `src/styles.css`:

```css
.grw-recently-viewed-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.grw-recently-viewed-item a {
  text-decoration: none;
  color: inherit;
}

.grw-recently-viewed-item a:hover {
  text-decoration: underline;
}

.grw-recently-viewed-empty {
  color: #999;
  text-align: center;
  padding: 2rem 0;
}
```

- [ ] **Step 2: Implement sidebar-panel module**

Create `src/sidebar-panel.ts`:

```typescript
import { getHistory, clearHistory, type ViewedPage } from './storage';
import { formatRelativeTime } from './relative-time';
import { escapeHtml } from './html-escape';
import './styles.css';

function buildPathHierarchy(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) return '';

  const parentSegments = segments.slice(0, -1);
  let currentPath = '';
  const links = parentSegments.map((seg) => {
    currentPath += '/' + encodeURIComponent(decodeURIComponent(seg));
    const decoded = decodeURIComponent(seg);
    return `<a class="page-segment" href="${escapeHtml(currentPath)}">${escapeHtml(decoded)}</a>`;
  });

  return `<span class="path-segment"><a href="/"><span class="material-symbols-outlined" style="font-size:inherit;vertical-align:middle">home</span><span class="separator" style="margin:0 0.2em">/</span></a></span>${links.join('<span class="separator" style="margin:0 0.2em">/</span>')}`;
}

function renderItem(item: ViewedPage): string {
  const pathHierarchy = buildPathHierarchy(item.path);
  const relativeTime = formatRelativeTime(item.viewedAt);

  return `
    <li class="list-group-item grw-recently-viewed-item py-2 px-0">
      <div class="d-flex w-100">
        <div class="flex-grow-1 ms-2">
          <div class="row gy-1">
            ${pathHierarchy ? `<div class="col-12"><div style="font-size:0.85em;color:#888">${pathHierarchy}</div></div>` : ''}
            <h6 class="col-12 d-flex align-items-center mb-0">
              <a class="page-segment" href="${escapeHtml(item.path)}">${escapeHtml(item.title)}</a>
            </h6>
            <div class="col-12">
              <div class="d-flex justify-content-end">
                <div class="grw-formatted-distance-date mt-auto">
                  <span>${escapeHtml(relativeTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  `;
}

export function renderPanel(): string {
  const history = getHistory();

  const headerHtml = `
    <div class="grw-sidebar-content-header py-4 d-flex">
      <h3 class="fs-6 fw-bold mb-0 text-nowrap">閲覧履歴</h3>
      <button type="button" class="btn btn-sm ms-auto py-0 grw-btn-clear-history" title="履歴をクリア">
        <span class="material-symbols-outlined">delete_sweep</span>
      </button>
    </div>
  `;

  if (history.length === 0) {
    return `
      <div class="px-3">
        ${headerHtml}
        <div class="grw-recently-viewed-empty">閲覧履歴はありません</div>
      </div>
    `;
  }

  const listHtml = history.map(renderItem).join('');

  return `
    <div class="px-3">
      ${headerHtml}
      <div class="grw-recent-changes">
        <ul class="list-group list-group-flush">
          ${listHtml}
        </ul>
      </div>
    </div>
  `;
}

export function showPanel(container: Element): void {
  const refresh = () => showPanel(container);

  container.innerHTML = renderPanel();

  // Attach clear button handler
  const clearBtn = container.querySelector('.grw-btn-clear-history');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearHistory();
      refresh();
    });
  }
}
```

- [ ] **Step 3: Write tests for sidebar panel**

Create `src/sidebar-panel.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderPanel } from './sidebar-panel';
import { recordPageView, clearHistory, STORAGE_KEY } from './storage';

describe('sidebar-panel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty state when no history', () => {
    const html = renderPanel();
    expect(html).toContain('閲覧履歴はありません');
    expect(html).toContain('閲覧履歴');
  });

  it('renders history items', () => {
    recordPageView('/test/page', 'page');
    const html = renderPanel();
    expect(html).toContain('page');
    expect(html).toContain('href="/test/page"');
  });

  it('renders path hierarchy for nested pages', () => {
    recordPageView('/parent/child/page', 'page');
    const html = renderPanel();
    expect(html).toContain('parent');
    expect(html).toContain('child');
  });

  it('escapes HTML in titles to prevent XSS', () => {
    recordPageView('/test/<img onerror=alert(1)>', '<img onerror=alert(1)>');
    const html = renderPanel();
    expect(html).not.toContain('<img onerror');
    expect(html).toContain('&lt;img onerror');
  });

  it('renders clear button', () => {
    const html = renderPanel();
    expect(html).toContain('grw-btn-clear-history');
    expect(html).toContain('delete_sweep');
  });
});
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/sidebar-panel.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/sidebar-panel.ts src/sidebar-panel.test.ts src/styles.css
git commit -m "feat: add sidebar panel rendering with XSS-safe history list"
```

---

### Task 8: Client Entry Point & Plugin Integration

**Files:**
- Create: `client-entry.tsx`

- [ ] **Step 1: Implement client-entry.tsx**

Create `client-entry.tsx`:

```typescript
import { injectSidebarButton, setButtonActive } from './src/sidebar-button';
import { showPanel } from './src/sidebar-panel';
import { startTracking, stopTracking } from './src/page-tracker';

let isActive = false;
let observer: MutationObserver | null = null;

function getSidebarContents(): Element | null {
  return document.querySelector('.grw-sidebar-contents');
}

function handleButtonClick(): void {
  const container = getSidebarContents();
  if (!container) return;

  if (isActive) {
    // Deactivate — let Growi restore its default panel
    setButtonActive(false);
    isActive = false;
    return;
  }

  isActive = true;
  setButtonActive(true);
  showPanel(container);
}

function setupSidebarIntegration(): void {
  const btn = injectSidebarButton(handleButtonClick);
  if (!btn) return;

  // Listen for clicks on other sidebar nav buttons to deactivate our panel
  const navContainer = btn.parentElement;
  if (navContainer) {
    navContainer.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const clickedBtn = target.closest('button');
      if (clickedBtn && clickedBtn.id !== 'recently-viewed' && isActive) {
        isActive = false;
        setButtonActive(false);
      }
    });
  }
}

function waitForSidebar(): void {
  // Check if sidebar already exists
  const navContainer = document.querySelector('.grw-sidebar-nav-primary-container');
  if (navContainer && document.getElementById('in-app-notification')) {
    setupSidebarIntegration();
    return;
  }

  // Otherwise, wait for it with MutationObserver
  observer = new MutationObserver((_mutations, obs) => {
    const nav = document.querySelector('.grw-sidebar-nav-primary-container');
    if (nav && document.getElementById('in-app-notification')) {
      obs.disconnect();
      observer = null;
      setupSidebarIntegration();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

const activate = (): void => {
  waitForSidebar();
  startTracking();
};

const deactivate = (): void => {
  stopTracking();
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

// Register plugin with Growi
if ((window as any).pluginActivators == null) {
  (window as any).pluginActivators = {};
}
(window as any).pluginActivators['growi-plugin-recently-viewed-pages'] = {
  activate,
  deactivate,
};

export {};
```

- [ ] **Step 2: Commit**

```bash
git add client-entry.tsx
git commit -m "feat: add client entry point with plugin registration"
```

---

### Task 9: Dev Mock Page

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create dev mock page**

Create `index.html` — a minimal HTML page that simulates Growi's sidebar DOM structure for local development:

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Growi Plugin Dev - Recently Viewed Pages</title>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
  <style>
    body { display: flex; height: 100vh; margin: 0; background: #f5f5f5; }
    .grw-sidebar-nav { width: 64px; background: #2a2a2a; display: flex; flex-direction: column; }
    .grw-sidebar-nav .btn-primary { background: #444; border: none; color: #ccc; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
    .grw-sidebar-nav .btn-primary.active { background: #666; color: #fff; }
    .sidebar-contents-container { width: 320px; background: #fff; border-right: 1px solid #ddd; overflow-y: auto; }
    .grw-sidebar-contents { min-height: 100%; }
    .main-content { flex: 1; padding: 2rem; }
  </style>
</head>
<body>
  <fieldset class="flex-expand-horiz border-0 p-0 m-0 border-top">
    <div class="grw-sidebar-nav">
      <div class="grw-sidebar-nav-primary-container">
        <div class="PrimaryItems_grw-primary-items__MP17f mt-1">
          <button type="button" class="btn btn-primary m-1 rounded" id="page-tree">
            <div class="position-relative"><span class="material-symbols-outlined">list</span></div>
          </button>
          <button type="button" class="btn btn-primary m-1 rounded active" id="recent-changes">
            <div class="position-relative"><span class="material-symbols-outlined">update</span></div>
          </button>
          <button type="button" class="btn btn-primary m-1 rounded" id="bookmarks">
            <div class="position-relative"><span class="material-symbols-outlined">bookmarks</span></div>
          </button>
          <button type="button" class="btn btn-primary m-1 rounded" id="in-app-notification">
            <div class="position-relative"><span class="material-symbols-outlined">notifications</span></div>
          </button>
        </div>
      </div>
    </div>
    <div class="sidebar-contents-container flex-grow-1 overflow-hidden">
      <div class="grw-sidebar-contents" data-testid="grw-sidebar-contents">
        <div class="px-3">
          <div class="grw-sidebar-content-header py-4 d-flex">
            <h3 class="fs-6 fw-bold mb-0">最新の変更</h3>
          </div>
          <p class="text-muted">（モックコンテンツ）</p>
        </div>
      </div>
    </div>
  </fieldset>
  <div class="main-content">
    <h1>Dev Mock Page</h1>
    <p>サイドバーの <code>history</code> ボタンをクリックしてテストしてください。</p>
  </div>
  <script>
    // Simulate some page view history in localStorage
    const mockHistory = [
      { path: '/999_その他/Claudeコラム/20260321_月齢', title: '20260321_月齢', viewedAt: Date.now() - 60000 },
      { path: '/004_プログラミング手法/008_JavaScript/npmパッケージのセキュリティ対策', title: 'npmパッケージのセキュリティ対策', viewedAt: Date.now() - 3600000 },
      { path: '/テスト用', title: 'テスト用', viewedAt: Date.now() - 86400000 },
    ];
    if (!localStorage.getItem('growi-recently-viewed-pages')) {
      localStorage.setItem('growi-recently-viewed-pages', JSON.stringify(mockHistory));
    }
  </script>
  <script type="module">
    import './client-entry.tsx';
    // Simulate Growi calling activate
    setTimeout(() => {
      const activator = window.pluginActivators?.['growi-plugin-recently-viewed-pages'];
      if (activator) activator.activate();
    }, 100);
  </script>
</body>
</html>
```

- [ ] **Step 2: Run dev server and verify visually**

Run: `npx vite --host`
Expected: Opens dev server, sidebar shows "history" button, clicking it displays mock history

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "chore: add dev mock page for local testing"
```

---

### Task 10: Build & Final Verification

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 2: Build for production**

Run: `npm run build`
Expected: `dist/` directory created with manifest and bundled JS

- [ ] **Step 3: Verify dist output**

Run: `ls dist/`
Expected: Contains `.js` file(s) and `.vite/manifest.json`

- [ ] **Step 4: Commit build output**

```bash
git add dist/
git commit -m "chore: add production build output"
```
